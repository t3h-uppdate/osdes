import React, { useState, useCallback, useEffect } from 'react';
import { useNotifications } from '../../../../contexts/NotificationContext';
// Remove direct icon imports
import IconRenderer from '../../../../components/common/IconRenderer'; // Import central renderer
import { useProjectManagement } from './hooks/useProjectManagement';
import { Project } from './types';
// Import types from useAdminData for the new props
import { SiteConfigData } from '../../hooks/useAdminData'; // Keep this import

// Define a type for the local editing state for individual projects
type LocalProjectState = Omit<Project, 'id' | 'tags' | 'is_published'> & { tags: string; is_published: boolean };

// Define props for the component, including site config related props
interface ProjectsSectionProps {
  siteConfig: SiteConfigData;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  saveSiteConfig: () => Promise<void>;
  isLoadingConfig: boolean; // Loading state specifically for siteConfig saving/loading
  saveStatusConfig: string; // Save status specifically for siteConfig
}


const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  siteConfig,
  handleInputChange,
  saveSiteConfig,
  isLoadingConfig,
  saveStatusConfig,
}) => {
  // Hook for managing individual project items
  const {
    projects: projectsFromHook,
    isLoading: isLoadingProjects, // Rename to avoid conflict
    error: projectsError, // Rename to avoid conflict
    addProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    moveProject,
  } = useProjectManagement();

  const { requestConfirmation, showToast } = useNotifications();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [localProjectData, setLocalProjectData] = useState<{ [key: string]: LocalProjectState }>({});

  // Combine loading states
  const isOverallLoading = isLoadingProjects || isLoadingConfig;

  // Effect to initialize or update local state for project items when projectsFromHook changes
  useEffect(() => {
    const initialLocalState: { [key: string]: LocalProjectState } = {};
    projectsFromHook.forEach(project => {
      initialLocalState[project.id] = {
        title: project.title || '',
        description: project.description || '',
        image_url: project.image_url || '',
        tags: Array.isArray(project.tags) ? project.tags.join(', ') : '',
        live_url: project.live_url || '',
        repo_url: project.repo_url || '',
        sort_order: project.sort_order ?? projectsFromHook.length,
        is_published: project.is_published ?? false, // Initialize is_published, default to false (draft)
      };
    });
    setLocalProjectData(initialLocalState);
  }, [projectsFromHook]); // Dependency remains projectsFromHook

  const toggleItemExpansion = (projectId: string) => {
    setExpandedItems(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  // --- Section Title Handling ---
  // Get the current title value from siteConfig prop
  const currentSectionTitle = siteConfig?.projects_section_title ?? '';

  // Handler specifically for the section title input change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Use the passed-in handleInputChange which updates the state in useAdminData
    handleInputChange(event);
  };

  // Handler for saving the section title (calls the passed-in saveSiteConfig)
  const handleSaveTitle = async () => {
    // The actual data is already updated in the parent state via handleInputChange
    // We just need to trigger the save operation.
    await saveSiteConfig();
  };
  // --- End Section Title Handling ---

  const handleAddNewProjectClick = useCallback(() => {
    const defaultProject: Omit<Project, 'id'> = {
      title: 'New Project',
      description: '',
      image_url: '',
      tags: [],
      live_url: '',
      repo_url: '',
      sort_order: projectsFromHook.length + 1, // Adjust sort order based on current length
      is_published: false, // Default new projects to draft
    };
    addProject(defaultProject);
  }, [addProject, projectsFromHook.length]); // Keep dependencies

  // Handle local input changes
  const handleLocalChange = useCallback((projectId: string, field: keyof LocalProjectState, value: string | number | boolean) => {
    setLocalProjectData(prev => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        [field]: value,
      },
    }));
  }, []);

  // Handle saving changes on blur
  const handleBlurSave = useCallback((projectId: string) => {
    const localData = localProjectData[projectId];
    if (!localData) return;
    const originalProject = projectsFromHook.find(p => p.id === projectId);
    if (!originalProject) return;

    const tagsArray = localData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    const dataToUpdate: Partial<Project> = {
        title: localData.title,
        description: localData.description,
        image_url: localData.image_url,
        tags: tagsArray,
        live_url: localData.live_url,
        repo_url: localData.repo_url,
        sort_order: Number(localData.sort_order),
        is_published: localData.is_published, // Include status in update
    };

    // Only call update if something actually changed (simple check for demo)
    if (JSON.stringify(dataToUpdate) !== JSON.stringify({
        title: originalProject.title,
        description: originalProject.description,
        image_url: originalProject.image_url,
        tags: originalProject.tags,
        live_url: originalProject.live_url,
        repo_url: originalProject.repo_url,
        sort_order: originalProject.sort_order,
        is_published: originalProject.is_published,
     })) {
        console.log(`Saving changes for project ${projectId} on blur`);
        updateProject(projectId, dataToUpdate).catch(err => console.error("Update failed:", err));
    } else {
        console.log(`No changes detected for project ${projectId} on blur`);
    }
  }, [localProjectData, updateProject, projectsFromHook]); // Keep dependencies

  // Handle toggling publish status for individual projects
  const handleToggleStatus = useCallback((projectId: string) => {
      const currentStatus = localProjectData[projectId]?.is_published ?? false;
      // Update local state immediately for responsiveness
      handleLocalChange(projectId, 'is_published', !currentStatus);
      // Call the hook function to update the backend
      toggleProjectStatus(projectId, currentStatus).catch(err => {
          // Hook handles error toast and reverts optimistic update, but we might need to revert local state too
          console.error("Toggle status failed:", err);
          handleLocalChange(projectId, 'is_published', currentStatus); // Revert local state on error
      });
  }, [localProjectData, toggleProjectStatus, handleLocalChange]); // Keep dependencies

  // Handle deletion confirmation
  const handleDeleteClick = useCallback((projectId: string, projectTitle: string) => {
     requestConfirmation({
        message: `Are you sure you want to delete project "${projectTitle || `Item #${projectId}`}"?\nThis action cannot be undone.`,
        onConfirm: async () => {
          try {
            await deleteProject(projectId);
            showToast('Project deleted successfully!', 'success');
            setLocalProjectData(prev => {
                const newState = {...prev};
                delete newState[projectId];
                return newState;
            });
          } catch (err: any) {
            console.error("Error deleting project:", err);
            showToast(`Error deleting project: ${err.message || 'Unknown error'}`, 'error');
          }
        },
        confirmText: 'Delete Project',
        title: 'Confirm Deletion'
      });
  }, [deleteProject, requestConfirmation, showToast]); // Keep dependencies


  // Loading state for initial project items fetch
  if (isLoadingProjects && projectsFromHook.length === 0) {
    return (
      <div className="flex justify-center items-center p-6">
        <IconRenderer iconName="Loader2" className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
      </div>
    );
  }

  // Error state for project items fetch
  if (projectsError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading projects:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{projectsError}</p>
      </div>
    );
  }

  // Determine if the "Save Title" button should be disabled
  const isSaveTitleDisabled = isLoadingConfig || saveStatusConfig.includes('Saving');

  return (
    <div className="space-y-6">
      {/* Section Title Input Area */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">Section Title</h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            name="projects_section_title" // Name must match the key in SiteConfigData
            value={currentSectionTitle}
            onChange={handleTitleChange}
            className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
            placeholder="Enter the title for the projects section"
            disabled={isOverallLoading} // Disable if anything is loading
          />
          <button
            onClick={handleSaveTitle}
            disabled={isSaveTitleDisabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoadingConfig && saveStatusConfig.includes('Saving') ? (
              <IconRenderer iconName="Loader2" className="h-4 w-4 animate-spin" />
            ) : (
              <IconRenderer iconName="Save" size={16} />
            )}
            Save Title
          </button>
        </div>
         {saveStatusConfig && !isLoadingConfig && ( // Display save status for title
          <span className={`text-xs italic mt-1 ${saveStatusConfig.includes('Error') ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {saveStatusConfig}
          </span>
        )}
      </div>

      {/* Existing Project Items Management Area */}
      <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
         <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
           Project Items ({projectsFromHook.length})
         </h3>
        <button
          onClick={handleAddNewProjectClick}
          disabled={isOverallLoading} // Use combined loading state
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Add new project item"
        >
          <IconRenderer iconName="PlusSquare" size={16} /> Add New Project Item
        </button>
      </div>

      <div className="space-y-3">
         {projectsFromHook.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No project items added yet. Click "Add New Project Item" to begin.</p>
        ) : (
          projectsFromHook.map((project, index) => { // Add index for reordering
            const isExpanded = expandedItems[project.id] || false;
            const currentLocalData = localProjectData[project.id] || { title: '', description: '', image_url: '', tags: '', live_url: '', repo_url: '', sort_order: 0, is_published: false };
            const isPublished = currentLocalData.is_published; // Use local state for status display

            return (
              // Use isOverallLoading for disabling inputs within items
              <div key={project.id} className={`rounded-lg border shadow-sm overflow-hidden ${isPublished ? 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600' : 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50'}`}>
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 relative group"
                  onClick={() => toggleItemExpansion(project.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(project.id); }}
                  aria-expanded={isExpanded}
                  aria-controls={`project-content-${project.id}`}
                >
                  {/* Reorder Arrows */}
                   <div className="flex flex-col mr-2">
                       <button
                           onClick={(e) => { e.stopPropagation(); moveProject(index, 'up'); }}
                           disabled={index === 0 || isOverallLoading} // Use combined loading state
                            className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move project up"
                        >
                            <IconRenderer iconName="ArrowUp" size={16} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); moveProject(index, 'down'); }}
                            disabled={index === projectsFromHook.length - 1 || isOverallLoading} // Use combined loading state
                            className="p-0.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            aria-label="Move project down"
                        >
                            <IconRenderer iconName="ArrowDown" size={16} />
                        </button>
                    </div>

                   {/* Expand/Collapse Chevron */}
                   <div className="mr-3 text-gray-500 dark:text-gray-400">
                     {isExpanded ? <IconRenderer iconName="ChevronUp" size={18} /> : <IconRenderer iconName="ChevronDown" size={18} />}
                   </div>

                   {/* Title */}
                  <div className="flex-grow mr-2 font-medium text-gray-700 dark:text-gray-200 truncate">
                    {currentLocalData.title || `Project: ${project.id}`}
                    {!isPublished && <span className="ml-2 text-xs font-normal text-yellow-600 dark:text-yellow-400">(Draft)</span>}
                  </div>

                  {/* Actions: Toggle Status & Delete */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     {/* Toggle Status Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(project.id);
                        }}
                        disabled={isOverallLoading} // Use combined loading state
                        className={`p-1 rounded-full focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isPublished
                            ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:ring-green-500'
                           : 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200 focus:ring-yellow-500'
                       }`}
                       aria-label={isPublished ? 'Set project to draft' : 'Publish project'}
                        title={isPublished ? 'Published (Click to Draft)' : 'Draft (Click to Publish)'}
                      >
                        {isPublished ? <IconRenderer iconName="Eye" size={18} /> : <IconRenderer iconName="EyeOff" size={18} />}
                      </button>

                     {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(project.id, currentLocalData.title);
                        }}
                        disabled={isOverallLoading} // Use combined loading state
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Delete project ${currentLocalData.title || project.id}`}
                      >
                       <IconRenderer iconName="Trash2" size={18} />
                     </button>
                   </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div id={`project-content-${project.id}`} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 space-y-4">
                    {/* Inputs remain the same, using handleLocalChange and handleBlurSave */}
                    {/* Project Title Input */}
                    <div>
                      <label htmlFor={`project-title-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Project Title
                      </label>
                      <input
                        id={`project-title-${project.id}`}
                        type="text"
                        value={currentLocalData.title}
                        onChange={(e) => handleLocalChange(project.id, 'title', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter project title"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                    {/* Project Description Input */}
                    <div>
                      <label htmlFor={`project-description-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`project-description-${project.id}`}
                        value={currentLocalData.description}
                        onChange={(e) => handleLocalChange(project.id, 'description', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter project description"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                     {/* Project Image URL Input */}
                    <div>
                      <label htmlFor={`project-image-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Image URL
                      </label>
                      <input
                        id={`project-image-${project.id}`}
                        type="url"
                        value={currentLocalData.image_url}
                        onChange={(e) => handleLocalChange(project.id, 'image_url', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://example.com/image.jpg"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                    {/* Project Tags Input */}
                    <div>
                      <label htmlFor={`project-tags-input-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                        id={`project-tags-input-${project.id}`}
                        type="text"
                        value={currentLocalData.tags}
                        onChange={(e) => handleLocalChange(project.id, 'tags', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="e.g., react, typescript, supabase"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                       <div className="flex flex-wrap gap-1 mt-1">
                         {currentLocalData.tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                           <span key={index} className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2 py-0.5 rounded-full">
                             {tag}
                           </span>
                         ))}
                       </div>
                    </div>
                    {/* Project Live URL Input */}
                    <div>
                      <label htmlFor={`project-live-url-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Live URL (Optional)
                      </label>
                      <input
                        id={`project-live-url-${project.id}`}
                        type="url"
                        value={currentLocalData.live_url}
                        onChange={(e) => handleLocalChange(project.id, 'live_url', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://live-project.com"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                     {/* Project Repo URL Input */}
                    <div>
                      <label htmlFor={`project-repo-url-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Repository URL (Optional)
                      </label>
                      <input
                        id={`project-repo-url-${project.id}`}
                        type="url"
                        value={currentLocalData.repo_url}
                        onChange={(e) => handleLocalChange(project.id, 'repo_url', e.target.value)}
                        onBlur={() => handleBlurSave(project.id)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://github.com/user/repo"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                     {/* Sort Order Input */}
                    <div>
                       <label htmlFor={`project-sort-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Sort Order (Read-only, use arrows to reorder)
                      </label>
                      <input
                        id={`project-sort-${project.id}`}
                        type="number"
                        value={currentLocalData.sort_order}
                        readOnly // Make sort order read-only, controlled by arrows
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-0 focus:border-gray-300 bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        disabled={isOverallLoading} // Use combined loading state
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProjectsSection;
