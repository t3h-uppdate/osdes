import React from 'react';
// Remove direct icon imports
import IconRenderer from './IconRenderer'; // Import central renderer

export type ToastType = 'success' | 'error' | 'warning' | null; // Add 'warning'

interface ToastNotificationProps {
  message: string | null;
  type: ToastType;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type }) => {
  if (!message || !type) return null;

  let bgColor = ''; // Keep one declaration
  let iconName = ''; // Use icon name string

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      iconName = 'CheckCircle';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      iconName = 'XCircle';
      break;
    case 'warning':
      bgColor = 'bg-yellow-500'; // Use yellow for warning
      iconName = 'AlertTriangle';
      break;
    default:
      return null; // Should not happen if type is validated
  }


  // Ensure animation class is present in a global CSS file (e.g., index.css)
  // .animate-fade-in-out { animation: fadeInOut 3s ease-in-out forwards; }
  // @keyframes fadeInOut { ... }

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center z-[100] transition-opacity duration-300 animate-fade-in-out max-w-sm`}>
      <IconRenderer iconName={iconName} className="w-5 h-5 mr-2 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;
