import React from 'react';
// Remove direct icon imports
import IconRenderer from '../../../components/common/IconRenderer'; // Import central renderer
import { Project } from '../../admin/sections/Projects/types'; // Import the correct Project type

interface ProjectsSectionProps {
  projects: Project[];
  title: string;
  // isDarkMode?: boolean; // Removed prop
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, title }) => { // Removed isDarkMode from destructuring
  // Use dark: prefixes for styling
  return (
    <section id='projects' className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl bg-white dark:bg-gray-700"
            >
              {project.image_url && (
                <img src={project.image_url} alt={project.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {project.title}
                  </h3>
                  <div className="flex space-x-3">
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} Repository`}
                        className="text-gray-500 dark:text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <IconRenderer iconName="Github" size={20} />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} Live Demo`}
                        className="text-gray-500 dark:text-gray-300 hover:text-blue-400 transition-colors"
                      >
                        <IconRenderer iconName="ExternalLink" size={20} />
                      </a>
                    )}
                  </div>
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-500 dark:text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
