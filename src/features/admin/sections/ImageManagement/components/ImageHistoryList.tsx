import React from 'react';
import { FileObject, HistoryCopyStatus } from '../types/imageUploaderTypes'; // Assuming types are exported correctly

interface ImageHistoryListProps {
  fileHistory: FileObject[];
  historyLoading: boolean;
  historyError: string | null;
  selectedHistoryFiles: string[];
  editingFileId: string | null; // Full path like 'public/name.jpg'
  newName: string;
  renameError: string | null;
  historyCopyStatus: HistoryCopyStatus | null;
  getPublicUrl: (filePath: string) => string | null;
  handleHistorySelectionChange: (filePath: string, isSelected: boolean) => void;
  handleUseSelected: () => void;
  handleDeleteSelected: () => void;
  handleCopyHistoryLink: (filePath: string) => void;
  handleEditClick: (fileId: string, currentName: string) => void; // fileId is full path
  handleCancelEdit: () => void;
  handleSaveRename: (oldFilePath: string) => void;
  handleDeleteFile: (filePath: string) => void;
  setNewName: (name: string) => void;
}

// Helper to format bytes
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ImageHistoryList: React.FC<ImageHistoryListProps> = ({
  fileHistory,
  historyLoading,
  historyError,
  selectedHistoryFiles,
  editingFileId,
  newName,
  renameError,
  historyCopyStatus,
  getPublicUrl,
  handleHistorySelectionChange,
  handleUseSelected,
  handleDeleteSelected,
  handleCopyHistoryLink,
  handleEditClick,
  handleCancelEdit,
  handleSaveRename,
  handleDeleteFile,
  setNewName,
}) => {

  if (historyLoading) {
    return <div className="text-center p-4 text-gray-500 dark:text-gray-400">Loading history...</div>;
  }

  if (historyError) {
    // Use a more styled error box
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg text-center">
        <p className="text-red-700 dark:text-red-200 font-medium">Error loading history:</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-1">{historyError}</p>
      </div>
    );
  }

  const getFilePath = (file: FileObject): string => `public/${file.name}`;

  return (
    <div className="mt-8 border-t dark:border-gray-600 pt-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100 mb-4">Image History</h3>

      {/* Bulk Actions */}
      {selectedHistoryFiles.length > 0 && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-between border border-gray-200 dark:border-gray-600">
           <span className="text-sm text-gray-700 dark:text-gray-200">{selectedHistoryFiles.length} file(s) selected</span>
           <div>
             <button
                onClick={handleUseSelected}
                className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700"
                title="Use selected image URL(s)"
             >
                Use Selected
             </button>
             <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-700"
                title="Delete selected files"
             >
                Delete Selected
             </button>
           </div>
        </div>
      )}

      {fileHistory.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto p-1">
          {fileHistory.map((file) => {
            // Define variables within the map scope
            const filePath = getFilePath(file);
            const publicUrl = getPublicUrl(filePath);
            const isSelected = selectedHistoryFiles.includes(filePath);
            const isEditing = editingFileId === filePath;
            const copyStatus = historyCopyStatus?.fileId === filePath ? historyCopyStatus.message : 'Copy Link';

            // Return the JSX for each grid item
            return (
              <div key={filePath} className={`relative group bg-white dark:bg-gray-700/50 rounded-lg shadow-sm border transition-colors flex flex-col overflow-hidden ${isSelected ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-500/50' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}`}>
                 {/* Checkbox - Positioned top-left */}
                 <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleHistorySelectionChange(filePath, e.target.checked)}
                    className="absolute top-2 left-2 z-10 form-checkbox h-4 w-4 text-indigo-600 bg-white dark:bg-gray-600 border-gray-400 dark:border-gray-400 rounded focus:ring-indigo-500 focus:ring-offset-0 checked:border-transparent"
                    aria-label={`Select ${file.name}`}
                    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
                 />

                 {/* Image Preview Area */}
                 <div className="relative w-full aspect-square bg-gray-100 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                   {publicUrl ? (
                      <img src={publicUrl} alt={file.name} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />
                   ) : (
                      <div className="h-full w-full bg-gray-200 dark:bg-gray-500 flex items-center justify-center text-gray-400 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                   )}
                 </div>

                 {/* Content Area */}
                 <div className="p-2 flex flex-col flex-grow">
                   {isEditing ? (
                     // Editing State
                     <div className="flex flex-col space-y-1 flex-grow">
                       <input
                         type="text"
                         value={newName}
                         onChange={(e) => setNewName(e.target.value)}
                         className="text-xs p-1 border border-gray-300 dark:border-gray-500 rounded w-full focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                         aria-label="New file name"
                         onClick={(e) => e.stopPropagation()} // Prevent card click
                       />
                       {renameError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{renameError}</p>}
                       <div className="flex justify-end space-x-1 mt-auto pt-1">
                         <button onClick={(e) => { e.stopPropagation(); handleSaveRename(filePath); }} className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-0.5" title="Save">✓</button>
                         <button onClick={(e) => { e.stopPropagation(); handleCancelEdit(); }} className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-0.5" title="Cancel">✕</button>
                       </div>
                     </div>
                   ) : (
                     // Normal State
                     <>
                       <p className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate mb-0.5" title={file.name}>{file.name}</p>
                       <p className="text-xxs text-gray-500 dark:text-gray-400 mb-1"> {/* Adjusted text size */}
                         {formatBytes(file.metadata?.size ?? 0)} - {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'Invalid Date'}
                       </p>
                       {/* Action Buttons - Placed at the bottom */}
                       <div className="mt-auto pt-1 flex items-center justify-between space-x-1">
                         <button
                           onClick={(e) => { e.stopPropagation(); handleCopyHistoryLink(filePath); }}
                           className={`text-xxs px-1.5 py-0.5 rounded transition-colors flex-grow text-center ${copyStatus === 'Copied!' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' : copyStatus === 'Failed!' || copyStatus === 'Error!' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800'}`}
                           disabled={copyStatus !== 'Copy Link'}
                           title="Copy image URL"
                         >
                           {copyStatus === 'Copy Link' ? 'Copy' : copyStatus} {/* Shorter text */}
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleEditClick(filePath, file.name); }}
                           className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-0.5"
                           title="Rename file"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </button>
                         <button
                           onClick={(e) => { e.stopPropagation(); handleDeleteFile(filePath); }}
                           className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-0.5"
                           title="Delete file"
                         >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </div>
                     </>
                   )}
                 </div>
              </div> // End Grid Item Card
            ); // End return
          })} {/* End map */}
        </div> // End Grid container
      )}
    </div> // End main container
  );
}; // End component
