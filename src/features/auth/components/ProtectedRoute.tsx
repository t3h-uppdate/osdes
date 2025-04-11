import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '../../../config/supabaseConfig'; // Import Supabase client
import { Session } from '@supabase/supabase-js'; // Import Session type

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Store the Supabase session instead of Firebase user
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase client is available
    if (!supabase) {
      console.error("ProtectedRoute: Supabase client is not initialized.");
      setLoading(false);
      return;
    }

    // Check initial session state
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false); // Initial check done

      // Add null check again before setting up listener
      if (!supabase) {
          console.error("ProtectedRoute (listener setup): Supabase client became null unexpectedly.");
          return; // Should not happen if initial check passed, but satisfy TS
      }

      // Start listening for auth changes *after* the initial check
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
        setSession(updatedSession);
        // No need to setLoading here as the listener updates state continuously
      });

      // Cleanup subscription on unmount
      return () => {
        subscription?.unsubscribe();
      };
    }).catch(error => {
        console.error("ProtectedRoute: Error getting initial session:", error);
        setLoading(false); // Ensure loading stops even on error
    });

    // Note: The listener setup is now inside the .then() to avoid race conditions
    // where the listener might fire before the initial session check completes.

  }, []); // Empty dependency array ensures this runs only once on mount

  if (loading) {
    // Consistent loading indicator (can be customized)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login page if no active session
    return <Navigate to="/admin/login" replace />;
  }

  // Render children if there is an active session
  return <>{children}</>;
};

export default ProtectedRoute;
