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
        setIsLoading(true);
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
            setIsLoading(false);
        }
    }, [showToast]);

    // Delete a project
    const deleteProject = useCallback(async (projectId: string) => {
        if (!supabase) {
            showToast("Supabase client not available.", 'error');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        setIsLoading(true);
        try {
            const { error: dbError } = await supabase
                .from(PROJECTS_TABLE)
                .delete()
                .eq('id', projectId);

            if (dbError) throw dbError;

            setProjects(prev => prev.filter(p => p.id !== projectId));
            showToast('Project deleted successfully!', 'success');
        } catch (err: any) {
            console.error("Error deleting project:", err);
            showToast(`Error deleting project: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    return {
        projects,
        isLoading,
        error,
        fetchProjects, // Expose refetch if needed
        addProject,
        updateProject,
        deleteProject,
    };
};
