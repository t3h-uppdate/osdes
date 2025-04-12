import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'; // Import icons

export type ToastType = 'success' | 'error' | 'warning' | null; // Add 'warning'

interface ToastNotificationProps {
  message: string | null;
  type: ToastType;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, type }) => {
  if (!message || !type) return null;

  let bgColor = '';
  let icon = null;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      icon = <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />;
      break;
    case 'error':
      bgColor = 'bg-red-500';
      icon = <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />;
      break;
    case 'warning':
      bgColor = 'bg-yellow-500'; // Use yellow for warning
      icon = <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />;
      break;
    default:
      return null; // Should not happen if type is validated
  }


  // Ensure animation class is present in a global CSS file (e.g., index.css)
  // .animate-fade-in-out { animation: fadeInOut 3s ease-in-out forwards; }
  // @keyframes fadeInOut { ... }

  return (
    <div className={`fixed bottom-5 right-5 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center z-[100] transition-opacity duration-300 animate-fade-in-out max-w-sm`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;
