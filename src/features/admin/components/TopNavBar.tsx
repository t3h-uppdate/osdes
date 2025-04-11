import React, { useState } from 'react';
import { Menu, User, ChevronDown, LogOut } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher'; // Import the ThemeSwitcher

interface TopNavBarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  isDesktopSidebarCollapsed: boolean;
  onToggleMobileSidebar: () => void;
  onToggleDesktopSidebar: () => void;
  onLogout: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopSidebar,
  onLogout,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md fixed w-full z-30 border-b border-gray-200 dark:border-gray-700"> {/* Increased z-index */}
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left side: Toggle buttons */}
        <div className="flex items-center">
          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden mr-4" // Show only on mobile
            aria-label="Toggle mobile sidebar"
          >
            <Menu size={24} />
          </button>
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onToggleDesktopSidebar}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 hidden md:block" // Show only on desktop
            aria-label="Toggle desktop sidebar"
          >
            <Menu size={24} />
          </button>
          {/* Optional: Add Logo or Title here */}
          {/* <span className="text-xl font-semibold text-gray-800 dark:text-white ml-4">Admin Panel</span> */}
        </div>

        {/* Right side: Theme Switcher & User Menu */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Theme Switcher */}
          {/* Pass a dummy onThemeSelect as it's not needed for global toggle here */}
          <ThemeSwitcher onThemeSelect={() => {}} />

          {/* User Menu */}
          <div className="relative"> {/* Removed ml-3 as space-x handles spacing */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
              aria-expanded={showUserMenu}
              aria-haspopup="true"
              id="user-menu-button" // Added id for accessibility
            >
              <User size={20} />
              <span className="hidden sm:inline">Admin</span> {/* Hide text on very small screens */}
              <ChevronDown size={16} className={`transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-600"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu-button" // Reference button id
                tabIndex={-1} // Added for accessibility
              >
                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false); // Close menu after click
                  }}
                  className="w-full px-4 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2"
                  role="menuitem" // Added role
                  tabIndex={-1} // Added for accessibility
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
