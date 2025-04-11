import React, { useState, useCallback } from 'react';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { Trash2, PlusSquare, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'; // Updated icons
import { useProjectManagement } from './hooks/useProjectManagement'; // Import the new hook
import { Project } from './types'; // Import the Project type

// Props are no longer needed as data comes from the hook
const ProjectsSection: React.FC = () => {
  const {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
  } = useProjectManagement(); // Use the new hook

  const { requestConfirmation } = useNotifications();
  // State to track the expanded state of each item { projectId: boolean }
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  // State for the current tag input value for each project
  const [tagInputValue, setTagInputValue] = useState<{ [key: string]: string }>({});

  const toggleItemExpansion = (projectId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [projectId]: !prev[projectId] // Toggle state for the specific project ID
    }));
  };

  // Handle adding a new project with default values
  const handleAddNewProjectClick = useCallback(() => {
    const defaultProject: Omit<Project, 'id'> = {
      title: 'New Project',
      description: '',
      image_url: '',
      tags: [],
      live_url: '',
      repo_url: '',
      sort_order: projects.length, // Append to the end by default
    };
    addProject(defaultProject);
  }, [addProject, projects.length]);

  // Handle input changes and trigger update
  const handleProjectChange = useCallback((projectId: string, field: keyof Project, value: string | string[]) => {
    // Special handling for tags if value is string (from tag input)
    if (field === 'tags' && typeof value === 'string') {
        // This case shouldn't happen with the current tag logic, but as a safeguard
        console.warn("Attempted to update tags with a single string, expected array.");
        return;
    }
    updateProject(projectId, { [field]: value });
  }, [updateProject]);

  // Handle deletion confirmation
  const handleDeleteClick = useCallback((projectId: string, projectTitle: string) => {
     requestConfirmation({
        message: `Are you sure you want to delete project "${projectTitle || `Item #${projectId}`}"?\nThis action cannot be undone.`,
        onConfirm: () => deleteProject(projectId),
        confirmText: 'Delete Project',
        title: 'Confirm Deletion'
      });
  }, [deleteProject, requestConfirmation]);

  // --- Tag Management Handlers ---
  const handleTagInputChange = (projectId: string, value: string) => {
    // Prevent adding comma itself as part of the tag
    if (value.endsWith(',')) {
       setTagInputValue(prev => ({ ...prev, [projectId]: value.slice(0, -1) }));
    } else {
       setTagInputValue(prev => ({ ...prev, [projectId]: value }));
    }
  };

  const handleAddTag = useCallback((projectId: string, currentTags: string[]) => {
    const newTag = (tagInputValue[projectId] || '').trim();
    if (newTag && !currentTags.includes(newTag)) {
      updateProject(projectId, { tags: [...currentTags, newTag] });
      setTagInputValue(prev => ({ ...prev, [projectId]: '' })); // Clear input
    } else if (!newTag) {
       setTagInputValue(prev => ({ ...prev, [projectId]: '' })); // Clear if empty
    }
  }, [tagInputValue, updateProject]);

  const handleRemoveTag = useCallback((projectId: string, currentTags: string[], tagToRemove: string) => {
    updateProject(projectId, { tags: currentTags.filter(tag => tag !== tagToRemove) });
  }, [updateProject]);

  const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, projectId: string, currentTags: string[]) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      handleAddTag(projectId, currentTags);
    }
  };
  // --- End Tag Management Handlers ---


  if (isLoading && projects.length === 0) { // Show loader only on initial load
    return (
      <div className="flex justify-center items-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading projects...</span>
      </div>
    );
  }

  if (error) {
    // Use a more styled error box
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading projects:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title Input Removed */}

      {/* Add New Project Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddNewProjectClick} // Use the new handler
          disabled={isLoading} // Disable button while loading/saving
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Add new project item"
        >
          <PlusSquare size={16} /> Add New Project
        </button>
      </div>

      {/* Project Items List */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 pb-2 mb-3">
          Project Items ({projects.length})
        </h3>
        {projects.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 italic">No projects added yet. Click "Add New Project" to begin.</p>
        ) : (
          // Use projects array from the hook
          projects.map((project) => {
            // Use project.id as the key and for state management
            const isExpanded = expandedItems[project.id] || false;
            const currentTags = Array.isArray(project.tags) ? project.tags : [];

            return (
              // Use project.id as the key
              <div key={project.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm overflow-hidden">
                {/* Clickable Header */}
                <div
                  className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 relative group"
                  onClick={() => toggleItemExpansion(project.id)} // Use project.id
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleItemExpansion(project.id); }}
                  aria-expanded={isExpanded}
                  aria-controls={`project-content-${project.id}`} // Use project.id
                >
                  {/* Chevron Icon */}
                  <div className="mr-3 text-gray-500 dark:text-gray-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>

                  {/* Project Title (Display Only in Header) */}
                  <div className="flex-grow mr-2 font-medium text-gray-700 dark:text-gray-200 truncate">
                    {project.title || `Project: ${project.id}`} {/* Show title or ID */}
                  </div>

                  {/* Delete Button (inside header) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Call deleteProject via handler
                      handleDeleteClick(project.id, project.title);
                    }}
                    disabled={isLoading} // Disable button during loading/saving
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-1 focus:ring-red-500 dark:focus:ring-red-400 rounded-full z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Delete project ${project.title || project.id}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Collapsible Content */}
                {isExpanded && (
                  <div id={`project-content-${project.id}`} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 space-y-4">
                    {/* Project Title Input */}
                    <div>
                      <label htmlFor={`project-title-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Project Title
                      </label>
                      <input
                        id={`project-title-${project.id}`}
                        type="text"
                        value={project.title || ''}
                        onChange={(e) => handleProjectChange(project.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter project title"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Project Description Input */}
                    <div>
                      <label htmlFor={`project-description-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id={`project-description-${project.id}`}
                        value={project.description || ''}
                        onChange={(e) => handleProjectChange(project.id, 'description', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="Enter project description"
                        disabled={isLoading}
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
                        value={project.image_url || ''}
                        onChange={(e) => handleProjectChange(project.id, 'image_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://example.com/image.jpg"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Project Tags Input */}
                    <div>
                      <label htmlFor={`project-tags-input-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Tags (add with Enter or comma)
                      </label>
                      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600">
                        {currentTags.map((tag, index) => (
                          <span key={index} className="flex items-center bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(project.id, currentTags, tag)}
                              className="ml-1.5 text-indigo-600 dark:text-indigo-300 hover:text-indigo-800 dark:hover:text-indigo-100 focus:outline-none disabled:opacity-50"
                              aria-label={`Remove tag ${tag}`}
                              disabled={isLoading}
                            >
                              &times; {/* Consider using a Lucide icon like XCircle */}
                            </button>
                          </span>
                        ))}
                        <input
                          id={`project-tags-input-${project.id}`}
                          type="text"
                          value={tagInputValue[project.id] || ''}
                          onChange={(e) => handleTagInputChange(project.id, e.target.value)}
                          onKeyDown={(e) => handleTagInputKeyDown(e, project.id, currentTags)}
                          className="flex-grow px-1 py-0.5 border-none focus:ring-0 focus:outline-none text-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                          placeholder={currentTags.length === 0 ? "e.g., react, typescript" : "Add tag..."}
                          disabled={isLoading}
                        />
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
                        value={project.live_url || ''}
                        onChange={(e) => handleProjectChange(project.id, 'live_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://live-project.com"
                        disabled={isLoading}
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
                        value={project.repo_url || ''}
                        onChange={(e) => handleProjectChange(project.id, 'repo_url', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="https://github.com/user/repo"
                        disabled={isLoading}
                      />
                    </div>

                     {/* Sort Order Input */}
                    <div>
                       <label htmlFor={`project-sort-${project.id}`} className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                        Sort Order (Optional)
                      </label>
                      <input
                        id={`project-sort-${project.id}`}
                        type="number"
                        value={project.sort_order ?? ''} // Handle potential undefined value
                        onChange={(e) => handleProjectChange(project.id, 'sort_order', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-500 disabled:opacity-70"
                        placeholder="e.g., 0, 1, 2..."
                        disabled={isLoading}
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
