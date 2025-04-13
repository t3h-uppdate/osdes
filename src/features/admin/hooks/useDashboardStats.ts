import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../config/supabaseConfig'; // Adjust path as needed

export interface PageViewDataPoint { // Added export
  view_date: string; // YYYY-MM-DD
  count: number;
}

interface DashboardStats {
  pageViewsToday: number; // Renamed for clarity
  pageViewsLast7Days: PageViewDataPoint[]; // Added data for chart
  totalPages: number;
  totalProjects: number;
  totalServices: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check if Supabase client is available
    if (!supabase) {
      setError('Supabase client is not initialized.');
      setIsLoading(false);
      setStats(null);
      return;
    }

    try {
      // --- Fetch Page Views ---
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

      // Fetch page views for the last 7 days
      const { data: pageViewsData7Days, error: pageViews7DaysError } = await supabase
        .from('page_views')
        .select('view_date, count')
        .gte('view_date', sevenDaysAgoStr) // Greater than or equal to 7 days ago
        .lte('view_date', todayStr)       // Less than or equal to today
        .order('view_date', { ascending: true });

      if (pageViews7DaysError) {
        console.error('Error fetching last 7 days page views:', pageViews7DaysError);
        // Decide if this error is critical or if we can proceed with empty data
        // throw new Error(`Error fetching last 7 days page views: ${pageViews7DaysError.message}`);
      }

      // Find today's views from the 7-day data
      const todayViewsData = pageViewsData7Days?.find(d => d.view_date === todayStr);
      const currentViewsToday = todayViewsData?.count ?? 0;

      // --- Fetch Counts ---
      // Fetch total pages count
      const { count: pagesCount, error: pagesError } = await supabase
        .from('pages')
        .select('*', { count: 'exact', head: true }); // Use head:true for count only

      if (pagesError) {
        console.error('Error fetching pages count:', pagesError);
        throw new Error(`Error fetching pages count: ${pagesError.message}`);
      }

      // Fetch total projects count
      const { count: projectsCount, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true }); // Use head:true for count only

      if (projectsError) {
        console.error('Error fetching projects count:', projectsError);
        throw new Error(`Error fetching projects count: ${projectsError.message}`);
      }

      // Fetch total services count
      const { count: servicesCount, error: servicesError } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true }); // Use head:true for count only

      if (servicesError) {
        console.error('Error fetching services count:', servicesError);
        throw new Error(`Error fetching services count: ${servicesError.message}`);
      }

      setStats({
        pageViewsToday: currentViewsToday,
        pageViewsLast7Days: pageViewsData7Days ?? [], // Default to empty array
        totalPages: pagesCount ?? 0,
        totalProjects: projectsCount ?? 0,
        totalServices: servicesCount ?? 0,
      });

    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err.message || 'An unknown error occurred while fetching stats.');
      setStats(null); // Clear stats on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
};
