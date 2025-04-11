import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../config/supabaseConfig'; // Adjust path as needed
import { Project } from '../../admin/sections/Projects/types'; // Import the Project type

const PROJECTS_TABLE = 'projects';

export const useFetchProjects = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch projects from the database
    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        if (!supabase) {
            setError("Supabase client not available.");
            setIsLoading(false);
            return;
        }
        try {
            const { data, error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .select('*')
                .order('sort_order', { ascending: true, nullsFirst: false }); // Order by sort_order

            if (dbError) throw dbError;

            // Ensure tags are always an array, even if null/undefined in DB
            const formattedData = data?.map(project => ({
                ...project,
                tags: Array.isArray(project.tags) ? project.tags : [],
            })) || [];

            setProjects(formattedData);
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            setError(`Failed to fetch projects: ${err.message}`);
            setProjects([]); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies needed for fetching

    // Effect to fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        isLoading,
        error,
        refetchProjects: fetchProjects, // Expose refetch if needed
    };
};
