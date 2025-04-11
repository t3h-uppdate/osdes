import React from 'react';
import { useSiteSettings } from '../../../contexts/SiteSettingsContext'; // Import the hook

// Define the structure for theme color data (matches StyleData in StyleEditorTab)
interface ThemeData {
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  h3TitleColor: string;
  textColor: string;
  backgroundFromColor: string;
  backgroundToColor: string;
  sectionBgColor: string;
  // Add fontFamily if you want the switcher to control it too
  // fontFamily: string;
}

// Define the props for ThemeSwitcher, including the callback
interface ThemeSwitcherProps {
  onThemeSelect: (themeData: ThemeData) => void; // Callback function prop for admin style editor
}

// Define the theme configurations directly in the component
// These should match the values in the tailwind.config.js plugin
const themeConfigs: Record<string, ThemeData> = {
  light: { // Matches :root in tailwind config (approximated from theme('colors...'))
    primaryColor: '#3b82f6', // blue-500
    secondaryColor: '#6b7280', // gray-500
    titleColor: '#1f2937', // gray-800 (Assuming title uses default text color in light)
    h3TitleColor: '#1f2937', // gray-800 (Assuming h3 uses default text color in light)
    textColor: '#1f2937', // gray-800
    backgroundFromColor: '#ffffff', // white
    backgroundToColor: '#f3f4f6', // gray-100 (Approximation for gradient)
    sectionBgColor: '#f3f4f6', // gray-100 (Approximation for section bg)
  },
  dark: {
    primaryColor: '#60a5fa', // blue-400
    secondaryColor: '#9ca3af', // gray-400
    titleColor: '#f9fafb', // gray-50 (Assuming title uses default text color in dark)
    h3TitleColor: '#f9fafb', // gray-50 (Assuming h3 uses default text color in dark)
    textColor: '#f9fafb', // gray-50
    backgroundFromColor: '#111827', // gray-900 (Approximation for gradient)
    backgroundToColor: '#1f2937', // gray-800
    sectionBgColor: '#111827', // gray-900 (Approximation for section bg)
  },
  forest: {
    primaryColor: '#34d399', // emerald-400
    secondaryColor: '#6b7280', // gray-500
    titleColor: '#064e3b', // emerald-900
    h3TitleColor: '#064e3b', // emerald-900
    textColor: '#064e3b', // emerald-900
    backgroundFromColor: '#d1fae5', // emerald-100 (Approximation for gradient)
    backgroundToColor: '#ecfdf5', // emerald-50
    sectionBgColor: '#d1fae5', // emerald-100
  },
  ocean: {
    primaryColor: '#38bdf8', // sky-400
    secondaryColor: '#94a3b8', // slate-400
    titleColor: '#0c4a6e', // sky-900
    h3TitleColor: '#0c4a6e', // sky-900
    textColor: '#0c4a6e', // sky-900
    backgroundFromColor: '#e0f2fe', // sky-100 (Approximation for gradient)
    backgroundToColor: '#f0f9ff', // sky-50
    sectionBgColor: '#e0f2fe', // sky-100
  },
  sunset: {
    primaryColor: '#fb7185', // rose-400
    secondaryColor: '#f97316', // orange-500
    titleColor: '#881337', // rose-900
    h3TitleColor: '#881337', // rose-900
    textColor: '#881337', // rose-900
    backgroundFromColor: '#ffe4e6', // rose-100 (Approximation for gradient)
    backgroundToColor: '#fff1f2', // rose-50
    sectionBgColor: '#ffe4e6', // rose-100
  },
};


const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ onThemeSelect }) => {
  const { theme: currentGlobalTheme, toggleTheme } = useSiteSettings(); // Get global theme state and toggle function

  // Available themes (UI definition) - Keep these for the switcher UI
  const themes = [
    { name: 'Light', value: 'light', icon: '☀️' },
    { name: 'Dark', value: 'dark', icon: '🌙' },
    { name: 'Forest', value: 'forest', icon: '🌲' },
    { name: 'Ocean', value: 'ocean', icon: '🌊' },
    { name: 'Sunset', value: 'sunset', icon: '🌅' }
  ];

  // Handle theme change
  const handleThemeChange = (selectedThemeValue: string) => {
    // console.log(`[ThemeSwitcher handleThemeChange] Clicked: ${selectedThemeValue}, Current Global Theme: ${currentGlobalTheme}`); // Log values (Removed)
    const newThemeData = themeConfigs[selectedThemeValue];
    if (newThemeData) {
      // Call the original callback for admin style editor updates
      onThemeSelect(newThemeData);

      // If 'light' or 'dark' was clicked, toggle the global theme if it's different
      if (selectedThemeValue === 'light' && currentGlobalTheme !== 'light') {
        // console.log('[ThemeSwitcher handleThemeChange] Condition met: Toggling theme to light.'); // Log before toggle (Removed)
        toggleTheme();
      } else if (selectedThemeValue === 'dark' && currentGlobalTheme !== 'dark') {
        // console.log('[ThemeSwitcher handleThemeChange] Condition met: Toggling theme to dark.'); // Log before toggle (Removed)
        toggleTheme();
      } else {
        // console.log('[ThemeSwitcher handleThemeChange] Condition NOT met for toggling global theme.'); // Log if condition fails (Removed)
      }
      // Note: Clicking 'Forest', 'Ocean', 'Sunset' will update the admin preview via onThemeSelect
      // but won't change the global light/dark mode unless we add specific logic for it.
      // The current requirement is only about persisting light/dark.

    } else {
      console.warn(`Theme data not found for: ${selectedThemeValue}`);
    }
  };

  // Determine active button based on global theme for light/dark,
  // or potentially a separate state if other themes should show as active.
  // For now, only highlight light/dark based on global context.
  const getActiveClass = (themeValue: string) => {
    if (themeValue === 'light' && currentGlobalTheme === 'light') return 'bg-[var(--color-primary)] text-white shadow-md';
    if (themeValue === 'dark' && currentGlobalTheme === 'dark') return 'bg-[var(--color-primary)] text-white shadow-md';
    // Default/inactive style
    return 'bg-[var(--color-background-secondary)] text-[var(--color-text)] hover:bg-[var(--color-secondary)] hover:text-white';
  };


  return (
    <div className="theme-switcher">
      {/* Outer container styling might need adjustment based on StyleEditorTab layout */}
      <div className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 bg-[var(--color-background-secondary)] rounded-lg border border-gray-300 dark:border-gray-700">
        <div className="flex space-x-1">
          {themes.map((theme) => (
            <button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              // Styling uses CSS variables for theme awareness and active state from context
              className={`p-1 sm:p-2 rounded-md text-xs sm:text-sm transition-colors duration-150 ${getActiveClass(theme.value)}`}
              title={theme.name}
            >
              <span className="flex items-center">
                <span className="mr-1">{theme.icon}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;
