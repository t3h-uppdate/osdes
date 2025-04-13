import React from 'react';
import IconRenderer from '../../../components/common/IconRenderer'; // Import IconRenderer

// Define the structure for a navigation item
interface NavItem {
  iconName: string; // Changed from icon: React.ReactNode
  label: string;
  tab: string;
}

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  activeTab: string | null;
  navItems: NavItem[];
  onTabClick: (tab: string) => void;
  onCloseMobileSidebar: () => void; // For the overlay click
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isSidebarOpen,
  isDesktopSidebarCollapsed,
  activeTab,
  navItems,
  onTabClick,
  onCloseMobileSidebar,
}) => {
  return (
    <>
      {/* Overlay for Mobile Sidebar */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" // Ensure overlay is only for mobile
          onClick={onCloseMobileSidebar}
          aria-hidden="true" // Hide from screen readers when not visible
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg transition-transform duration-300 ease-in-out z-20 border-r border-gray-200 dark:border-gray-700 md:translate-x-0 md:transition-all md:duration-300
          ${isMobile ? (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : (isDesktopSidebarCollapsed ? 'w-20' : 'w-64')}
        `}
        aria-label="Main Navigation"
      >
        {/* Add padding to the nav container, not individual items */}
        <nav className="py-4 overflow-y-auto h-full">
          {navItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabClick(item.tab)}
              className={`w-full flex items-center px-4 py-3 transition-colors duration-150 ease-in-out group ${
                activeTab === item.tab
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-medium' // Active state
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100' // Default & Hover state
              } ${isDesktopSidebarCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`} // Center icon when collapsed
              aria-current={activeTab === item.tab ? 'page' : undefined}
              title={isDesktopSidebarCollapsed && !isMobile ? item.label : undefined} // Show tooltip when collapsed
            >
              {/* Icon styling - Use IconRenderer */}
              <span className={`flex-shrink-0 ${activeTab === item.tab ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
                <IconRenderer iconName={item.iconName} size={20} aria-hidden="true" /> {/* Use IconRenderer */}
              </span>
              {/* Label styling and visibility */}
              <span className={`flex-1 text-left ${(isMobile && isSidebarOpen) || (!isMobile && !isDesktopSidebarCollapsed) ? 'inline' : 'hidden'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
