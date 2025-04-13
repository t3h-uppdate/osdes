import React, { useCallback } from 'react';
import { DndProvider, useDrag, useDrop, DragSourceMonitor, DropTargetMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import IconRenderer from '../../../../components/common/IconRenderer';
import { SiteConfigData } from '../../hooks/useAdminData'; // Import SiteConfigData type
// Removed non-existent imports for Input and Label

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
  listKey: 'nav_links' | 'footer_links'; // Added listKey to differentiate drag types if needed, though maybe not strictly necessary here
  moveLink: (listKey: 'nav_links' | 'footer_links', dragIndex: number, hoverIndex: number) => void;
  onUpdate: (listKey: 'nav_links' | 'footer_links', index: number, updatedLink: LinkItem) => void;
  onDelete: (listKey: 'nav_links' | 'footer_links', index: number) => void;
}> = ({ link, index, listKey, moveLink, onUpdate, onDelete }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [, drop] = useDrop<{ index: number; listKey: 'nav_links' | 'footer_links' }, void, unknown>({
    accept: `LINK_ITEM_${listKey.toUpperCase()}`, // Unique accept type per list
    hover(item, monitor: DropTargetMonitor) {
      if (!ref.current || item.listKey !== listKey) return; // Ensure we only interact with items from the same list
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveLink(listKey, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: `LINK_ITEM_${listKey.toUpperCase()}`, // Unique type per list
    item: { index, listKey },
    collect: (monitor: DragSourceMonitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(listKey, index, { ...link, text: e.target.value });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(listKey, index, { ...link, url: e.target.value });
  };

  return (
    <div
      ref={ref}
      className={`flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded mb-2 bg-white dark:bg-gray-700 shadow-sm ${isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'}`}
    >
      <IconRenderer iconName="GripVertical" size={16} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
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
      <button
        onClick={() => onDelete(listKey, index)}
        className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
        aria-label="Delete link"
      >
        <IconRenderer iconName="Trash2" size={16} className="text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 flex-shrink-0"  /> 
      </button>
    </div>
  );
};


// --- EditableLinkList Component (Copied and adapted) ---
interface EditableLinkListProps {
  listKey: 'nav_links' | 'footer_links';
  links: LinkItem[] | null | undefined;
  onChange: (key: 'nav_links' | 'footer_links', links: LinkItem[]) => void;
  moveLinkHandler: (listKey: 'nav_links' | 'footer_links', dragIndex: number, hoverIndex: number) => void;
  updateLinkHandler: (listKey: 'nav_links' | 'footer_links', index: number, updatedLink: LinkItem) => void;
  deleteLinkHandler: (listKey: 'nav_links' | 'footer_links', index: number) => void;
}

const EditableLinkList: React.FC<EditableLinkListProps> = ({
  listKey,
  links = [],
  onChange,
  moveLinkHandler,
  updateLinkHandler,
  deleteLinkHandler
}) => {
  const currentLinks = links ?? [];

  const handleAddLink = () => {
    onChange(listKey, [...currentLinks, { text: '', url: '' }]);
  };

  return (
    // DndProvider is now wrapping the whole section
    <div className="space-y-2">
      {currentLinks.map((link, index) => (
        <DraggableLinkItem
          key={`${listKey}-${index}`} // More specific key
          index={index}
          link={link}
          listKey={listKey}
          moveLink={moveLinkHandler}
          onUpdate={updateLinkHandler}
          onDelete={deleteLinkHandler}
        />
      ))}
      <button
        onClick={handleAddLink}
        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        <IconRenderer iconName="Plus" size={16} className="mr-1" /> Add Link
      </button>
    </div>
  );
};


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

  const moveLink = useCallback((listKey: 'nav_links' | 'footer_links', dragIndex: number, hoverIndex: number) => {
    const currentLinks = siteConfig[listKey] ?? [];
    const draggedLink = currentLinks[dragIndex];
    const updatedLinks = [...currentLinks];
    updatedLinks.splice(dragIndex, 1);
    updatedLinks.splice(hoverIndex, 0, draggedLink);
    handleLinkListChange(listKey, updatedLinks);
  }, [siteConfig, handleLinkListChange]);

  const isSaveDisabled = isLoading || saveStatus.includes('Saving');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 text-gray-900 dark:text-gray-100">

        {/* Navigation Links Card */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border border-gray-200 dark:border-gray-600 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white capitalize border-b border-gray-300 dark:border-gray-600 pb-2 mb-4 flex items-center gap-2">
            <IconRenderer iconName="Navigation" size={18} className="text-blue-500" />
            Navigation Links
          </h3>
          <EditableLinkList
            listKey="nav_links"
            links={siteConfig.nav_links}
            onChange={handleLinkListChange}
            moveLinkHandler={moveLink}
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
          <EditableLinkList
            listKey="footer_links"
            links={siteConfig.footer_links}
            onChange={handleLinkListChange}
            moveLinkHandler={moveLink}
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
    </DndProvider>
  );
};

export default LinkManagementSection;
