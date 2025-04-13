import React, { useCallback, useState } from 'react'; // Removed useEffect
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from 'react-beautiful-dnd'; // Import react-beautiful-dnd components
import IconRenderer from '../../../../components/common/IconRenderer';
import { SiteConfigData } from '../../hooks/useAdminData'; // Import SiteConfigData type

// Define a type for a single link item
type LinkItem = { text: string; url: string };

// --- Props Interface ---
interface LinkManagementSectionProps {
  siteConfig: SiteConfigData;
  handleLinkListChange: (key: 'nav_links' | 'footer_links', links: LinkItem[]) => void;
  // Add a generic handler for simple input changes
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  saveSiteConfig: () => Promise<void>;
  isLoading: boolean;
  saveStatus: string;
}

// --- DraggableLinkItem Component (Copied from GeneralInfoSection) ---
const DraggableLinkItem: React.FC<{
  link: LinkItem;
  index: number;
  listKey: 'nav_links' | 'footer_links';
  // Removed moveLink prop
  onUpdate: (listKey: 'nav_links' | 'footer_links', index: number, updatedLink: LinkItem) => void;
  onDelete: (listKey: 'nav_links' | 'footer_links', index: number) => void;
  // Add props from react-beautiful-dnd Draggable
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
}> = ({ link, index, listKey, onUpdate, onDelete, provided, snapshot }) => {
  // Removed react-dnd hooks and refs

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(listKey, index, { ...link, text: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(listKey, index, { ...link, url: e.target.value });
  };

  // Removed duplicate handlers

  return (
    // Apply Draggable props here
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 border border-gray-200 dark:border-gray-600 rounded mb-2 transition-shadow duration-200 ${
        snapshot.isDragging
          ? 'bg-blue-50 dark:bg-blue-900 shadow-lg ring-2 ring-blue-500' // Style when dragging
          : 'bg-gray-100 dark:bg-gray-700 shadow-sm' // Default style
      }`}
    >
      {/* Drag Handle - Apply dragHandleProps here */}
      <div
        {...provided.dragHandleProps}
        className={`flex-shrink-0 self-center sm:self-auto p-1 cursor-grab text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200`}
        
        aria-label="Drag to reorder link"
      >
        <IconRenderer iconName="GripVertical" size={16} className="text-gray-400 dark:text-gray-500" />
      </div>

      {/* Inputs Container */}
      <div className="flex flex-col sm:flex-row flex-grow gap-2">
        <input
          type="text"
          placeholder="Link Text"
          value={link.text}
          onChange={handleTextChange}
          className="flex-1 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm p-1 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
        />
        <input
          type="text"
          placeholder="URL (e.g., /about or https://...)"
          value={link.url}
          onChange={handleUrlChange}
          className="flex-1 rounded border-gray-300 dark:border-gray-500 shadow-sm sm:text-sm p-1 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
        />
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(listKey, index)}
        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 self-center sm:self-auto flex-shrink-0" // Center vertically in col layout
        aria-label="Delete link"
      >
        <IconRenderer iconName="Trash2" size={16} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300" />
      </button>
    </div>
  );
};


// --- EditableLinkList Component (Copied and adapted) ---
interface EditableLinkListProps {
  listKey: 'nav_links' | 'footer_links';
  links: LinkItem[] | null | undefined;
  onChange: (key: 'nav_links' | 'footer_links', links: LinkItem[]) => void;
  // Removed moveLinkHandler as it's handled by DragDropContext
  updateLinkHandler: (listKey: 'nav_links' | 'footer_links', index: number, updatedLink: LinkItem) => void;
  deleteLinkHandler: (listKey: 'nav_links' | 'footer_links', index: number) => void;
}

const EditableLinkList: React.FC<EditableLinkListProps> = ({
  listKey,
  links = [],
  onChange,
  // Removed moveLinkHandler prop
  updateLinkHandler,
  deleteLinkHandler
}) => {
  const currentLinks = links ?? [];

  const handleAddLink = () => {
    onChange(listKey, [...currentLinks, { text: '', url: '' }]);
  };

  return (
    // Wrap list items in Droppable and Draggable
    <Droppable droppableId={listKey}>
      {(providedDrop: DroppableProvided) => (
        <div
          {...providedDrop.droppableProps}
          ref={providedDrop.innerRef}
          className="space-y-2"
        >
          {currentLinks.map((link, index) => (
            // Use a stable key if possible, e.g., link.id if available, otherwise index is fallback
            <Draggable key={`${listKey}-${index}`} draggableId={`${listKey}-${index}`} index={index}>
              {(providedDrag: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                <DraggableLinkItem
                  index={index}
                  link={link}
                  listKey={listKey}
                  onUpdate={updateLinkHandler}
                  onDelete={deleteLinkHandler}
                  provided={providedDrag} // Pass Draggable provided props
                  snapshot={snapshot}     // Pass Draggable snapshot
                  // Removed moveLink prop
                />
              )}
            </Draggable>
          ))}
          {providedDrop.placeholder}
          <button
            onClick={handleAddLink}
            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <IconRenderer iconName="Plus" size={16} className="mr-1" /> Add Link
          </button>
        </div>
      )}
    </Droppable>
  );
};
// Removed stray code block that was here


// --- LinkManagementSection Component ---
const LinkManagementSection: React.FC<LinkManagementSectionProps> = ({
  siteConfig,
  handleLinkListChange,
  handleInputChange, // Destructure the new handler
  saveSiteConfig,
  isLoading,
  saveStatus,
}) => {

  // Handlers that incorporate the listKey
  const updateLink = (listKey: 'nav_links' | 'footer_links', index: number, updatedLink: LinkItem) => {
    const currentLinks = siteConfig[listKey] ?? [];
    const newLinks = [...currentLinks];
    newLinks[index] = updatedLink;
    handleLinkListChange(listKey, newLinks);
  };

  const deleteLink = (listKey: 'nav_links' | 'footer_links', index: number) => {
    const currentLinks = siteConfig[listKey] ?? [];
    const newLinks = currentLinks.filter((_, i) => i !== index);
    handleLinkListChange(listKey, newLinks);
  };

  // Removed the old moveLink useCallback

  const isSaveDisabled = isLoading || saveStatus.includes('Saving');

  // --- react-beautiful-dnd onDragEnd Handler ---
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list or no movement
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Determine which list was affected (nav_links or footer_links)
    const listKey = destination.droppableId as 'nav_links' | 'footer_links';
    const currentLinks = siteConfig[listKey] ?? [];

    // Perform the reorder
    const items = Array.from(currentLinks);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    // Update the state
    handleLinkListChange(listKey, items);
  };

  // Removed backend selection logic

  return (
    // Wrap the entire section in DragDropContext
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-gray-900 dark:text-gray-100">

        {/* Navigation Links Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center gap-2">
            <IconRenderer iconName="Navigation" size={18} className="text-blue-500" />
            Navigation Links
          </h3>
          {/* EditableLinkList now contains Droppable */}
          <EditableLinkList
            listKey="nav_links"
            links={siteConfig.nav_links}
            onChange={handleLinkListChange}
            // Removed moveLinkHandler
            updateLinkHandler={updateLink}
            deleteLinkHandler={deleteLink}
          />
        </div>

        {/* Footer Links Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center gap-2">
            <IconRenderer iconName="Link" size={18} className="text-blue-500" />
            {/* Use dynamic title, default to "Quick Links" if not set */}
            {siteConfig.footer_links_title || 'Quick Links'}
          </h3>
          {/* Input for editing the title */}
          <div className="mb-4">
             <label htmlFor="footer_links_title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Footer Links Section Title
             </label>
             <input
                id="footer_links_title"
                name="footer_links_title" // Name must match the key in siteConfig
                type="text"
                value={siteConfig.footer_links_title || ''}
                onChange={handleInputChange} // Use the generic handler
                placeholder="e.g., Quick Links"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" // Added text colors
             />
          </div>
          {/* EditableLinkList now contains Droppable */}
          <EditableLinkList
            listKey="footer_links"
            links={siteConfig.footer_links}
            onChange={handleLinkListChange}
            // Removed moveLinkHandler
            updateLinkHandler={updateLink}
            deleteLinkHandler={deleteLink}
          />
        </div>

        {/* Save Changes Area */}
        <div className="md:col-span-2 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-4">
          {saveStatus && !isLoading && (
            <span className={`text-sm italic ${saveStatus.includes('Error') ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {saveStatus}
            </span>
          )}
          <button
            onClick={saveSiteConfig} // This button saves the entire site config, including the links
            className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isSaveDisabled}
          >
            {isLoading && saveStatus.includes('Saving') ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Links...
              </>
            ) : (
              'Save Link Changes'
            )}
          </button>
        </div>
      </div>
    </DragDropContext> // Close DragDropContext
  );
};

export default LinkManagementSection;
