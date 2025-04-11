import React from 'react';
import { ExternalLink, Code2, Github } from 'lucide-react'; // Added Github icon
import { Project } from '../../admin/sections/Projects/types'; // Import the correct Project type

interface ProjectsSectionProps {
  projects: Project[];
  title: string;
  isDarkMode?: boolean; // Optional dark mode prop for styling consistency
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, title, isDarkMode }) => {
  return (
    <section id='projects' className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4">
        <h2 className={`text-3xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl ${isDarkMode ? 'bg-gray-700' : 'bg-white'}`}
            >
              {project.image_url && (
                <img src={project.image_url} alt={project.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {project.title}
                  </h3>
                  <div className="flex space-x-3">
                    {project.repo_url && (
                      <a
                        href={project.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} Repository`}
                        className={`hover:text-blue-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                      >
                        <Github size={20} />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${project.title} Live Demo`}
                        className={`hover:text-blue-400 transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </div>
                </div>
                <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {project.description || 'No description provided.'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags?.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
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
