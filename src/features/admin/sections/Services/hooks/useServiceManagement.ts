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
        setIsLoading(true);
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
            setIsLoading(false);
        }
    }, [showToast]);

    // Delete a service
    const deleteService = useCallback(async (serviceId: string) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        // Optional: Add confirmation dialog
        if (!window.confirm('Are you sure you want to delete this service?')) {
            return;
        }

        setIsLoading(true);
        try {
            const { error: dbError } = await supabase
                .from(SERVICES_TABLE)
                .delete()
                .eq('id', serviceId);

            if (dbError) throw dbError;

            // Remove from local state
            setServices(prev => prev.filter(service => service.id !== serviceId));
            showToast('Service deleted successfully!', 'success');
        } catch (err: any) {
            console.error("Error deleting service:", err);
            showToast(`Error deleting service: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    return {
        services,
        isLoading,
        error,
        fetchServices, // Expose refetch if needed
        addService,
        updateService,
        deleteService,
    };
};
