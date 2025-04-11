import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNotifications } from '../../../../contexts/NotificationContext'; // Import notification hook
import supabase from '../../../../config/supabaseConfig'; // Import supabase client
// Removed Firebase imports

// Define Supabase table names used in this component
const SITE_CONTENT_TABLE = 'site_content';
const SOCIAL_LINKS_TABLE = 'social_links';
const PAGES_TABLE = 'pages';
const BACKUP_BUCKET = 'backups'; // Define bucket name

const ArchiveSection: React.FC = () => {
  const { showToast, requestConfirmation } = useNotifications();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [availableBackups, setAvailableBackups] = useState<{ name: string; created_at: string }[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  // Function to fetch all relevant data from Supabase tables
  const fetchAllSiteData = async () => {
    if (!supabase) {
      throw new Error("Supabase client is not available.");
    }
    const backupData: { [key: string]: any } = {};
    const tablesToBackup = [SITE_CONTENT_TABLE, SOCIAL_LINKS_TABLE, PAGES_TABLE]; // Add other tables if needed

    try {
      for (const tableName of tablesToBackup) {
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) {
          console.error(`Error fetching data from Supabase table ${tableName}:`, error);
          // Decide if you want to continue or throw error
          // For backup, maybe log and continue?
          continue; // Skip this table on error
        }
        if (data && data.length > 0) {
          backupData[tableName] = data; // Store the array of rows
        } else {
          console.warn(`No data found in Supabase table '${tableName}'`);
        }
      }
      console.log('Data fetched from Supabase for backup:', backupData);
      return backupData;
    } catch (error) {
      console.error("Error during Supabase data fetch:", error);
      throw new Error("Failed to fetch site data from Supabase for backup.");
    }
  };

  // Function to list backups from Supabase Storage
  const listBackups = useCallback(async () => { // Wrap in useCallback
      if (!supabase) return;
      try {
          const { data: files, error: listError } = await supabase.storage
              .from(BACKUP_BUCKET) // Use constant
              .list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });

          if (listError) throw listError;

          if (files) {
              // Filter out potential placeholder files if Supabase Storage adds them
              const validBackups = files.filter(f => f.name !== '.emptyFolderPlaceholder');
              setAvailableBackups(validBackups.map(f => ({ name: f.name, created_at: f.created_at || new Date().toISOString() })));
          } else {
              setAvailableBackups([]);
          }
      } catch (error: any) {
          console.error('Failed to list backups:', error);
          showToast(`Failed to list backups: ${error.message}`, 'error');
          setAvailableBackups([]);
      }
  // Add dependencies for useCallback
  }, [showToast]); // supabase is stable

  // Fetch backups on component mount
  useEffect(() => {
      listBackups();
  }, [listBackups]); // Add listBackups to dependency array


  const handleBackup = async () => {
    console.log("Backup process started."); // Log start
    if (!supabase) {
      console.error("handleBackup: Supabase client is null."); // Log error
      showToast('Supabase client not initialized.', 'error');
      return;
    }
    setIsBackingUp(true);
    // Assuming 'info' maps to 'success' for ToastType
    showToast('Starting site backup...', 'success');

    try {
      console.log("handleBackup: Attempting to fetch site data..."); // Log fetch attempt
      const siteData = await fetchAllSiteData();
      console.log("handleBackup: Site data fetched:", siteData); // Log fetched data

      if (!siteData || Object.keys(siteData).length === 0) {
         console.warn("handleBackup: No site data found or fetch failed."); // Log warning
         // Assuming 'warning' maps to 'error' for ToastType
         showToast('No data found to backup.', 'error');
         setIsBackingUp(false);
         return;
      }

      const jsonData = JSON.stringify(siteData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.json`;
      console.log(`handleBackup: Preparing to upload file: ${fileName}`); // Log upload prep

      // supabase is checked at the start of the function
      const { data, error } = await supabase.storage
        .from(BACKUP_BUCKET) // Use constant
        .upload(fileName, blob, { cacheControl: '3600', upsert: false });

      if (error) {
        console.error("handleBackup: Supabase upload error:", error);
        throw new Error(error.message || 'Failed to upload backup to Supabase.');
      }

      console.log('handleBackup: Supabase upload successful:', data); // Log success
      showToast('Site backup successful!', 'success');
      await listBackups(); // Refresh backup list

    } catch (error: any) {
      console.error('Backup failed:', error);
      showToast(`Backup failed: ${error.message || 'Unknown error'}`, 'error');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Function to write restored data back to Supabase tables
  const writeDataToSupabase = async (dataToRestore: { [key: string]: any[] }) => {
      if (!supabase) {
        throw new Error("Supabase client is not available for writing.");
      }

      // Process tables sequentially for simplicity, could be parallelized with Promise.all
      for (const tableName in dataToRestore) {
          const tableData = dataToRestore[tableName]; // This should be an array of row objects

          if (!Array.isArray(tableData)) {
              console.warn(`Skipping restore for ${tableName}: Data is not an array.`);
              continue;
          }

          console.log(`Restoring data for table: ${tableName}`);

          try {
              // 1. Delete existing data in the table
              // CAUTION: This deletes ALL data in the table before restoring.
              // Ensure this is the desired behavior. Adjust filter if needed.
              // Using a placeholder condition that should always be true to delete all rows.
              // Make sure the column used (e.g., 'id') exists and is suitable.
              console.log(`Deleting existing data from ${tableName}...`);
              const { error: deleteError } = await supabase
                  .from(tableName)
                  .delete()
                  .neq('id', -9999); // Placeholder condition, assumes 'id' exists and is not -9999

              if (deleteError) {
                  console.error(`Error deleting data from ${tableName}:`, deleteError);
                  throw new Error(`Failed to clear table ${tableName} before restore.`);
              }
              console.log(`Existing data deleted from ${tableName}.`);

              // 2. Insert restored data
              if (tableData.length > 0) {
                  console.log(`Inserting ${tableData.length} rows into ${tableName}...`);
                  const { error: insertError } = await supabase
                      .from(tableName)
                      .insert(tableData);

                  if (insertError) {
                      console.error(`Error inserting data into ${tableName}:`, insertError);
                      throw new Error(`Failed to insert data into table ${tableName} during restore.`);
                  }
                  console.log(`Data inserted into ${tableName}.`);
              } else {
                  console.log(`No data to insert into ${tableName}.`);
              }
          } catch (error) {
              // Log intermediate errors and re-throw to stop the restore process
              console.error(`Error during restore process for table ${tableName}:`, error);
              throw error; // Stop restore on first table failure
          }
      }
      console.log("Supabase data restore completed for all tables.");
  };


  const handleRestore = async () => {
    if (!selectedBackup) {
        // Assuming 'warning' maps to 'error' for ToastType
        showToast('Please select a backup file to restore.', 'error');
        return;
    }
    if (!supabase) {
      showToast('Supabase client not initialized.', 'error');
      return;
    }

    requestConfirmation({
        title: 'Confirm Restore',
        message: `Are you sure you want to restore the site from backup "${selectedBackup}"? This will overwrite current site data. This action cannot be undone.`,
        confirmText: 'Restore Now',
        cancelText: 'Cancel',
        onConfirm: async () => {
            setIsRestoring(true);
            // Assuming 'info' maps to 'success' for ToastType
            showToast(`Starting restore from ${selectedBackup}...`, 'success');

            try {
                // 1. Download the selected backup file
                // Add explicit null check for supabase inside the callback
                if (!supabase) {
                    showToast('Supabase client is not available.', 'error');
                    setIsRestoring(false);
                    return;
                }
                const { data: downloadData, error: downloadError } = await supabase.storage
                    .from(BACKUP_BUCKET) // Use constant
                    .download(selectedBackup);

                if (downloadError) throw downloadError;
                if (!downloadData) throw new Error('Failed to download backup file.');

                // 2. Parse the JSON data
                const text = await downloadData.text();
                const restoredData = JSON.parse(text);
                console.log("Data to restore:", restoredData);

                if (typeof restoredData !== 'object' || restoredData === null) {
                    throw new Error('Invalid backup file format.');
                }

                // 3. Write data back to Supabase
                await writeDataToSupabase(restoredData);

                showToast('Site restore successful!', 'success');

            } catch (error: any) {
                console.error('Restore failed:', error);
                showToast(`Restore failed: ${error.message || 'Unknown error'}`, 'error');
            } finally {
                setIsRestoring(false);
            }
        },
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Backup & Restore (Supabase)</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Backup your site configuration and data from Supabase tables to Supabase Storage, or restore from a previous backup.
      </p>

      {/* Backup Button */}
      <div className="mb-6">
        <button
          onClick={handleBackup}
          className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 flex items-center justify-center w-full md:w-auto ${isBackingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isBackingUp || isRestoring}
        >
          {isBackingUp ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Backing up...
            </>
          ) : (
            'Backup Site Data Now'
          )}
        </button>
      </div>

      {/* Restore Section */}
      <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">Restore from Backup</h3>
          {availableBackups.length > 0 ? (
              <>
                  <label htmlFor="backup-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Backup File:</label>
                  <select
                      id="backup-select"
                      value={selectedBackup || ''}
                      onChange={(e) => setSelectedBackup(e.target.value)}
                      className="block w-full md:w-1/2 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={isRestoring || isBackingUp}
                  >
                      <option value="" disabled>-- Select a backup --</option>
                      {availableBackups.map((backup) => (
                          <option key={backup.name} value={backup.name}>
                              {backup.name} ({new Date(backup.created_at).toLocaleString()})
                          </option>
                      ))}
                  </select>

                  <button
                      onClick={handleRestore}
                      className={`mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 flex items-center justify-center w-full md:w-auto ${isRestoring || !selectedBackup ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isRestoring || isBackingUp || !selectedBackup}
                  >
                      {isRestoring ? (
                          <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Restoring...
                          </>
                      ) : (
                          'Restore Selected Backup'
                      )}
                  </button>
                  <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                      Warning: Restoring will overwrite all current site data with the content from the selected backup.
                  </p>
              </>
          ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No backups found in Supabase Storage bucket '{BACKUP_BUCKET}'.</p>
          )}
      </div>
    </div>
  );
};

export default ArchiveSection;
