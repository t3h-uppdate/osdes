import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Adjust path as needed
import { useNotifications } from '../../../../../contexts/NotificationContext'; // Adjust path as needed
import { Project } from '../types'; // Assuming types.ts defines Project structure

const PROJECTS_TABLE = 'projects';

// Define the type for a project fetched from the DB (includes id, created_at etc.)
// Adjust based on your exact table structure and Project type
interface ProjectWithId extends Project {
    id: string;
    created_at?: string;
    updated_at?: string;
    // Add other DB-specific fields if necessary (like sort_order if added to type)
    sort_order?: number;
}

export const useProjectManagement = () => {
    const [projects, setProjects] = useState<ProjectWithId[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useNotifications();

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
            // Fetch ordered by sort_order or created_at
            const { data, error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .select('*')
                .order('sort_order', { ascending: true }); // Or 'created_at'

            if (dbError) throw dbError;

            setProjects(data || []);
        } catch (err: any) {
            console.error("Error fetching projects:", err);
            setError(`Failed to fetch projects: ${err.message}`);
            showToast(`Error fetching projects: ${err.message}`, 'error');
            setProjects([]); // Reset on error
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    // Effect to fetch projects on mount
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Add a new project
    const addProject = useCallback(async (newProjectData: Omit<Project, 'id'>) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        setIsLoading(true);
        try {
            // Add default sort_order if not provided
            const projectToAdd = {
                ...newProjectData,
                sort_order: newProjectData.sort_order ?? projects.length, // Example default sort
                tags: newProjectData.tags || [], // Ensure tags is an array
            };

            const { data, error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .insert(projectToAdd)
                .select()
                .single();

            if (dbError) throw dbError;

            if (data) {
                setProjects(prev => [...prev, data].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
                showToast('Project added successfully!', 'success');
            } else {
                 throw new Error("No data returned after insert.");
            }
        } catch (err: any) {
            console.error("Error adding project:", err);
            showToast(`Error adding project: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, projects.length]);

    // Update an existing project
    const updateProject = useCallback(async (projectId: string, updatedData: Partial<Project>) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        // setIsLoading(true); // Remove loading state toggle for smoother onBlur updates
        try {
             // Ensure tags are handled correctly if updated
            const dataToUpdate = { ...updatedData };
            if (dataToUpdate.tags && !Array.isArray(dataToUpdate.tags)) {
                // If tags are provided but not an array (e.g., from a text input), split them
                // Adjust this logic based on how tags are input in your form
                dataToUpdate.tags = (dataToUpdate.tags as unknown as string).split(',').map(tag => tag.trim()).filter(Boolean);
            }

            const { data, error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .update(dataToUpdate)
                .eq('id', projectId)
                .select()
                .single();

            if (dbError) throw dbError;

             if (data) {
                setProjects(prev =>
                    prev.map(p => (p.id === projectId ? data : p))
                       .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)) // Re-sort
                );
                showToast('Project updated successfully!', 'success');
            } else {
                 throw new Error("No data returned after update.");
            }
        } catch (err: any) {
            console.error("Error updating project:", err);
            showToast(`Error updating project: ${err.message}`, 'error');
        } finally {
            // setIsLoading(false); // Remove loading state toggle
        }
    }, [showToast]);

    // Delete a project - Modified to return Promise and remove internal confirmation/toast
    const deleteProject = useCallback(async (projectId: string): Promise<void> => {
        if (!supabase) {
            // Throw error instead of showing toast here
            throw new Error("Supabase client not available.");
        }
        // Confirmation should be handled by the component calling this function

        setIsLoading(true);
        try {
            const { error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .delete()
                .eq('id', projectId);

            if (dbError) throw dbError;

            // Update state locally on success
            setProjects(prev => prev.filter(p => p.id !== projectId));
            // Resolve the promise on success
            // Toast will be handled by the component
        } catch (err: any) {
            console.error("Error deleting project:", err);
            // Reject the promise on error
            // Toast will be handled by the component
            throw err; // Re-throw the error to be caught by the caller
        } finally {
            setIsLoading(false);
        }
    }, []); // Removed showToast dependency

    // Toggle publish status
    const toggleProjectStatus = useCallback(async (projectId: string, currentStatus: boolean) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        const newStatus = !currentStatus;
        // Optimistically update UI first
        setProjects(prev =>
            prev.map(p => (p.id === projectId ? { ...p, is_published: newStatus } : p))
        );
        try {
            const { error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .update({ is_published: newStatus })
                .eq('id', projectId);

            if (dbError) throw dbError;

            showToast(`Project ${newStatus ? 'published' : 'set to draft'} successfully!`, 'success');
        } catch (err: any) {
            console.error("Error toggling project status:", err);
            showToast(`Error toggling status: ${err.message}`, 'error');
            // Revert optimistic update on error
            setProjects(prev =>
                prev.map(p => (p.id === projectId ? { ...p, is_published: currentStatus } : p))
            );
        }
        // No loading state change needed for quick toggle
    }, [showToast]);

    // Move project up or down
    const moveProject = useCallback(async (index: number, direction: 'up' | 'down') => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= projects.length) return; // Cannot move first item up or last item down

        const projectToMove = projects[index];
        const projectToSwapWith = projects[swapIndex];

        // Ensure sort_order exists and is a number for both items
        const orderToMove = projectToMove.sort_order ?? index;
        const orderToSwapWith = projectToSwapWith.sort_order ?? swapIndex;

        // Optimistically update UI
        const optimisticProjects = [...projects];
        optimisticProjects[index] = { ...projectToSwapWith, sort_order: orderToMove };
        optimisticProjects[swapIndex] = { ...projectToMove, sort_order: orderToSwapWith };
        setProjects(optimisticProjects.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));


        setIsLoading(true); // Show loading for reorder as it involves two updates
        try {
            // Perform updates sequentially to swap sort_order values
            const { error: error1 } = await supabase
                .from(PROJECTS_TABLE)
                .update({ sort_order: orderToSwapWith }) // Give projectToMove the order of projectToSwapWith
                .eq('id', projectToMove.id);
            if (error1) throw error1;

            const { error: error2 } = await supabase
                .from(PROJECTS_TABLE)
                .update({ sort_order: orderToMove }) // Give projectToSwapWith the original order of projectToMove
                .eq('id', projectToSwapWith.id);
            if (error2) throw error2;

            showToast(`Project moved ${direction} successfully.`, 'success');
            // Fetch again to ensure consistency, although optimistic update should be correct
            // await fetchProjects(); // Optional: uncomment if optimistic update isn't reliable
        } catch (err: any) {
            console.error(`Error moving project ${direction}:`, err);
            showToast(`Failed to reorder project: ${err.message}`, 'error');
            // Revert optimistic update on error by fetching fresh data
            await fetchProjects();
        } finally {
            setIsLoading(false);
        }
    }, [projects, showToast, fetchProjects]); // Added fetchProjects dependency

    return {
        projects,
        isLoading,
        error,
        fetchProjects, // Expose refetch if needed
        addProject,
        updateProject,
        deleteProject,
        toggleProjectStatus, // Export new function
        moveProject,         // Export new function
    };
};
