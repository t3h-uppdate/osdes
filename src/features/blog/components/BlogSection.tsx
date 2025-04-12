import React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../admin/sections/Pages/types'; // Corrected path


interface BlogSectionProps {
  dynamicPages: Page[];
}

const BlogSection: React.FC<BlogSectionProps> = ({ dynamicPages }) => {
  return (
    <section id='blog' className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center mb-8">
        <h2 className="text-base font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400">
        Blog
        </h2>
        {dynamicPages && dynamicPages.length > 0 && (
          <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-4">
            {dynamicPages.map(page => (
              <Link
                key={page.id}
                to={`/${page.slug}`}
                className="block p-6 shadow-lg hover:bg-gray-700 transition-colors bg-section"
              >
                {page.title}
              </Link>
            ))}
          </div>
        )}
      </div>
   </div>
    </section>
  );
};


export default BlogSection;
