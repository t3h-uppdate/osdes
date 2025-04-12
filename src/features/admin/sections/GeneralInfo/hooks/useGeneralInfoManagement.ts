import { useState, useCallback, useEffect } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Adjust path as needed

// Define the structure for General Info data from the database
export interface GeneralInfoData {
  id?: number; // Optional ID, useful if we need it later
  site_title: string | null;
  site_role: string | null;
  logo_url: string | null;
}

// Function to fetch general info from the database
const fetchGeneralInfo = async (): Promise<GeneralInfoData | null> => {
  if (!supabase) {
    console.error("Supabase client not initialized.");
    return null;
  }
  // Assuming there's only one row for general site info, often with ID 1
  const { data, error } = await supabase
    .from('general_info')
    .select('id, site_title, site_role, logo_url')
    .limit(1) // Fetch only one row
    .single(); // Expect a single result or null

  if (error) {
    console.error('Error fetching general info:', error);
    return null;
  }
  return data;
};

// Function to update general info in the database
const updateGeneralInfo = async (info: Partial<GeneralInfoData>): Promise<boolean> => {
   if (!supabase) {
    console.error("Supabase client not initialized.");
    return false;
  }
  // Assume we always update the row with ID 1.
  const recordId = 1; // Adjust if your primary key or logic differs

  // Remove 'id' from the update payload if present
  const { id, ...updateData } = info;

  const { error } = await supabase
    .from('general_info')
    .update(updateData)
    .eq('id', recordId); // Update the specific row

  if (error) {
    console.error('Error updating general info:', error);
    return false;
  }
  return true;
};

// Hook to manage general info state
export const useGeneralInfoManagement = () => {
    const [generalInfo, setGeneralInfo] = useState<GeneralInfoData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadGeneralInfo = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchGeneralInfo();
            setGeneralInfo(data);
        } catch (err: any) {
            setError(`Failed to load general info: ${err.message}`);
            setGeneralInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveGeneralInfo = useCallback(async (info: Partial<GeneralInfoData>) => {
        setIsLoading(true); // Indicate loading during save
        setError(null);
        try {
            const success = await updateGeneralInfo(info);
            if (success) {
                // Optionally reload data after successful save
                await loadGeneralInfo();
                return true;
            } else {
                throw new Error("Update operation failed.");
            }
        } catch (err: any) {
            setError(`Failed to save general info: ${err.message}`);
            return false;
        } finally {
            // Consider keeping loading true until reload finishes if loadGeneralInfo is called
             setIsLoading(false);
        }
    }, [loadGeneralInfo]);

    useEffect(() => {
        loadGeneralInfo();
    }, [loadGeneralInfo]);

    return {
        generalInfo,
        isLoading,
        error,
        loadGeneralInfo,
        saveGeneralInfo,
    };
};
