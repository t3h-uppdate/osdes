import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Ensure CSS is imported

const DynamicPageSkeleton: React.FC = () => {
  // Removed SkeletonTheme wrapper, styles are now handled globally in index.css
  return (
    <div className="flex flex-col min-h-screen text-text ltr bg-gradient-to-br from-background to-background-secondary pb-20">
      {/* Removed text-center from container */}
      <div className="flex-grow container mx-auto px-4 py-16 backdrop-blur-sm relative">
          {/* Skeleton for Back Link */}
          <div className="absolute top-6 left-6">
            <Skeleton width={30} height={30} />
          </div>
          {/* Skeleton for Title - Simplified, centered */}
          <div className="text-center mb-8">
            <Skeleton height={40} width={`60%`} style={{ margin: '0 auto' }} />
          </div>
          {/* Skeleton for Content Area - Added rounded-lg */}
          <div className="p-6 md:p-8 prose bg-section prose-invert max-w-none text-text rounded-lg">
            <Skeleton count={5} /> {/* Simulate paragraphs */}
            <br />
            <Skeleton count={3} />
             {/* Skeleton for Timestamps - Moved inside, aligned right */}
            <div className="mt-8 text-sm text-gray-500 text-right border-t border-gray-700 pt-4">
              <Skeleton width={150} style={{ marginBottom: '4px', marginLeft: 'auto' }} /> {/* Align right */}
              <Skeleton width={180} style={{ marginLeft: 'auto' }}/> {/* Align right */}
            </div>
          </div>
        </div>
    </div>
  );
};

export default DynamicPageSkeleton;
