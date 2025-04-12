import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Adjust path as needed
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Adjust path as needed
import { ServiceItem } from '../types'; // Assuming types.ts is updated or compatible

const SERVICES_TABLE = 'services';

// Define the type for a service fetched from the DB (includes id, created_at etc.)
// This might need adjustment based on your exact table structure and types.ts
interface ServiceItemWithId extends ServiceItem {
    id: string;
    created_at?: string;
    updated_at?: string;
    // Add other DB-specific fields if necessary
}

export const useServiceManagement = () => {
    const [services, setServices] = useState<ServiceItemWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useNotifications();

    // Fetch services from the database
    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!supabase) {
            setError("Supabase client not available.");
            setIsLoading(false);
            return;
        }
        try {
            const { data, error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .select('*')
                .order('sort_order', { ascending: true }); // Or order by created_at, etc.

            if (dbError) throw dbError;

            setServices(data || []);
        } catch (err: any) {
            console.error("Error fetching services:", err);
            setError(`Failed to fetch services: ${err.message}`);
            showToast(`Error fetching services: ${err.message}`, 'error');
            setServices([]); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    // Effect to fetch services on mount
    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Add a new service
    const addService = useCallback(async (newServiceData: Omit<ServiceItem, 'id'>) => { // Expect data without DB fields
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        setIsLoading(true); // Indicate loading during add operation
        try {
            // Add default sort_order if not provided, maybe based on current count
            const serviceToAdd = {
                ...newServiceData,
                sort_order: newServiceData.sort_order ?? services.length, // Example default sort order
            };

            const { data, error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .insert(serviceToAdd)
                .select() // Select the newly inserted row
                .single(); // Expecting one row back

            if (dbError) throw dbError;

            if (data) {
                // Add the new service to local state
                setServices(prev => [...prev, data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
                showToast('Service added successfully!', 'success');
            } else {
                 throw new Error("No data returned after insert.");
            }
        } catch (err: any) {
            console.error("Error adding service:", err);
            showToast(`Error adding service: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, services.length]); // Depend on services.length for default sort order

    // Update an existing service
    const updateService = useCallback(async (serviceId: string, updatedData: Partial<ServiceItem>) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        // setIsLoading(true); // Remove loading state toggle for smoother onBlur updates
        try {
            const { data, error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .update(updatedData)
                .eq('id', serviceId)
                .select()
                .single(); // Expect one row back

            if (dbError) throw dbError;

             if (data) {
                // Update local state
                setServices(prev =>
                    prev.map(service => (service.id === serviceId ? data : service))
                       .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) // Re-sort if sort_order changed
                );
                showToast('Service updated successfully!', 'success');
            } else {
                 throw new Error("No data returned after update.");
            }
        } catch (err: any) {
            console.error("Error updating service:", err);
            showToast(`Error updating service: ${err.message}`, 'error');
        } finally {
            // setIsLoading(false); // Remove loading state toggle
        }
    }, [showToast]);

    // Delete a service - Modified to return Promise and remove internal confirmation/toast
    const deleteService = useCallback(async (serviceId: string): Promise<void> => {
        if (!supabase) {
            // Throw error instead of showing toast here
            throw new Error("Supabase client not available.");
        }
        // Confirmation should be handled by the component calling this function

        setIsLoading(true);
        try {
            const { error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .delete()
                .eq('id', serviceId);

            if (dbError) throw dbError;

            // Remove from local state on success
            setServices(prev => prev.filter(service => service.id !== serviceId));
            // Resolve the promise on success
            // Toast will be handled by the component
        } catch (err: any) {
            console.error("Error deleting service:", err);
            // Reject the promise on error
            // Toast will be handled by the component
            throw err; // Re-throw the error to be caught by the caller
        } finally {
            setIsLoading(false);
        }
    }, []); // Removed showToast dependency

    // Toggle publish status
    const toggleServiceStatus = useCallback(async (serviceId: string, currentStatus: boolean) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        const newStatus = !currentStatus;
        // Optimistically update UI first
        setServices(prev =>
            prev.map(s => (s.id === serviceId ? { ...s, is_published: newStatus } : s))
        );
        try {
            const { error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .update({ is_published: newStatus })
                .eq('id', serviceId);

            if (dbError) throw dbError;

            showToast(`Service ${newStatus ? 'published' : 'set to draft'} successfully!`, 'success');
        } catch (err: any) {
            console.error("Error toggling service status:", err);
            showToast(`Error toggling status: ${err.message}`, 'error');
            // Revert optimistic update on error
            setServices(prev =>
                prev.map(s => (s.id === serviceId ? { ...s, is_published: currentStatus } : s))
            );
        }
        // No loading state change needed for quick toggle
    }, [showToast]);

    // Move service up or down
    const moveService = useCallback(async (index: number, direction: 'up' | 'down') => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= services.length) return;

        const serviceToMove = services[index];
        const serviceToSwapWith = services[swapIndex];

        const orderToMove = serviceToMove.sort_order ?? index;
        const orderToSwapWith = serviceToSwapWith.sort_order ?? swapIndex;

        // Optimistically update UI
        const optimisticServices = [...services];
        optimisticServices[index] = { ...serviceToSwapWith, sort_order: orderToMove };
        optimisticServices[swapIndex] = { ...serviceToMove, sort_order: orderToSwapWith };
        setServices(optimisticServices.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));

        setIsLoading(true);
        try {
            // Perform updates sequentially
            const { error: error1 } = await supabase
                .from(SERVICES_TABLE)
                .update({ sort_order: orderToSwapWith })
                .eq('id', serviceToMove.id);
            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from(SERVICES_TABLE)
                .update({ sort_order: orderToMove })
                .eq('id', serviceToSwapWith.id);
            if (error2) throw error2;

            showToast(`Service moved ${direction} successfully.`, 'success');
            // Optional: await fetchServices();
        } catch (err: any) {
            console.error(`Error moving service ${direction}:`, err);
            showToast(`Failed to reorder service: ${err.message}`, 'error');
            await fetchServices(); // Revert optimistic update on error
        } finally {
            setIsLoading(false);
        }
    }, [services, showToast, fetchServices]); // Added fetchServices dependency

    return {
        services,
        isLoading,
        error,
        fetchServices, // Expose refetch if needed
        addService,
        updateService,
        deleteService,
        toggleServiceStatus, // Export new function
        moveService,         // Export new function
    };
};
