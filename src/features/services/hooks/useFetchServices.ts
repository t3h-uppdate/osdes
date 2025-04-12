import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../config/supabaseConfig'; // Adjust path as needed

const SERVICES_TABLE = 'services';

// Define the type for a service item fetched from the DB
// Should match the structure used in the admin section for consistency
export interface ServiceItem {
    id: string;
    created_at?: string;
    updated_at?: string;
    title: string;
    description: string;
    icon?: string | null; // Icon might be optional
    sort_order?: number | null; // Sort order might be optional
}

export const useFetchServices = () => {
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                .eq('is_published', true) // Only fetch published services
                .order('sort_order', { ascending: true, nullsFirst: false }); // Order by sort_order, handle nulls

            if (dbError) throw dbError;

            setServices(data || []);
        } catch (err: any) {
            console.error("Error fetching services:", err);
            setError(`Failed to fetch services: ${err.message}`);
            setServices([]); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed for fetching

    // Effect to fetch services on mount
    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    return {
        services,
        isLoading,
        error,
        refetchServices: fetchServices, // Expose refetch if needed
    };
};
