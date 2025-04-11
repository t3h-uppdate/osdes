import { defineConfig, loadEnv } from 'vite'; // Import loadEnv
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => { // Use function form to access mode
  // Load env file based on the mode (development, production)
  const env = loadEnv(mode, process.cwd(), ''); // Load all env vars, prefix ''

  return {
    base: '/', // Use absolute paths for assets with client-side routing
    // Define env variables for client-side access
    // Make sure to only expose variables prefixed with VITE_
    // Provide default empty strings to handle potential undefined values during build
    define: {
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY || ''),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN || ''),
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID || ''),
      'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET || ''),
      'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID || ''),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID || ''),
      'import.meta.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(env.VITE_FIREBASE_MEASUREMENT_ID || ''),
      // Add other VITE_ prefixed variables here if needed
    }, // Added comma after define block
    plugins: [react()], // Comma already present
    // Removed optimizeDeps.exclude for lucide-react
  }; // Added semicolon after return object's closing brace
}); // Removed extra semicolons
