import React, { useMemo, useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
// Remove direct icon imports
import IconRenderer from '../../../components/common/IconRenderer'; // Import central renderer
import supabase from '../../../config/supabaseConfig'; // Corrected path
import { useNotifications } from '../../../contexts/NotificationContext'; // Corrected path

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  className?: string;
}

const MIN_HEIGHT = 100; // Minimum editor height in pixels
const MAX_HEIGHT = 800; // Maximum editor height in pixels
const DEFAULT_HEIGHT = 200; // Default editor height in pixels

const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter content here...",
  style = {}, // Remove default minHeight from here, controlled by state now
  className = "mt-1" // Remove bg-white, applied directly to editor below
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [editorHeight, setEditorHeight] = useState(DEFAULT_HEIGHT);
  const { showToast } = useNotifications(); // Get toast function

  // --- Prevent page jump on picker click ---
  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const toolbar = editor?.getModule('toolbar')?.container;

    if (!toolbar) return;

    let scrollYBeforeClick = 0;

    const handleToolbarMouseDown = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement.closest('.ql-picker')) {
        scrollYBeforeClick = window.scrollY;
      }
    };

    const handleToolbarMouseUp = (event: MouseEvent) => {
      const targetElement = event.target as HTMLElement;
      if (targetElement.closest('.ql-picker')) {
        setTimeout(() => {
          if (window.scrollY !== scrollYBeforeClick) {
            window.scrollTo(window.scrollX, scrollYBeforeClick);
          }
        }, 0);
      }
    };

    toolbar.addEventListener('mousedown', handleToolbarMouseDown);
    toolbar.addEventListener('mouseup', handleToolbarMouseUp);

    return () => {
      toolbar.removeEventListener('mousedown', handleToolbarMouseDown);
      toolbar.removeEventListener('mouseup', handleToolbarMouseUp);
    };
  }, []); // Run once on mount

  // Define Quill Modules & Formats INSIDE the component using useMemo
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'video'], // Keep image button
        ['clean']
      ],
      handlers: {
        // Custom image handler for uploads
        image: function() {
          const quill = quillRef.current?.getEditor();
          if (!quill) {
            console.error("Quill editor instance not found.");
            showToast("Editor not available.", "error");
            return;
          }

          const range = quill.getSelection(true); // Get cursor position
          if (!range) return;

          // Create a file input element dynamically
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.style.display = 'none'; // Hide the input

          // Handle file selection
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file || !supabase) {
              if (!supabase) showToast("Storage service not configured.", "error");
              document.body.removeChild(input); // Clean up input
              return;
            }

            // Show uploading feedback (optional)
            // quill.formatText(range.index, 0, { 'placeholder': 'Uploading...' }); // Placeholder text idea
            showToast("Uploading image...", "success"); // Changed "info" to "success"

            const timestamp = Date.now();
            const BUCKET_NAME = 'img'; // Consistent with useImageUpload
            const filePath = `public/${timestamp}_${file.name}`;

            try {
              // Upload to Supabase
              const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false,
                });

              if (uploadError) throw uploadError;

              // Get public URL
              const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

              if (!urlData || !urlData.publicUrl) {
                throw new Error('Failed to retrieve public URL after upload.');
              }

              const publicUrl = urlData.publicUrl;

              // Insert image into editor
              quill.insertEmbed(range.index, 'image', publicUrl, 'user');
              quill.setSelection(range.index + 1, 0); // Move cursor after image
              showToast("Image uploaded successfully!", "success");

            } catch (err) {
              console.error("Image upload failed:", err);
              const errorMessage = `Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`;
              showToast(errorMessage, "error");
            } finally {
              // Clean up the input element
              document.body.removeChild(input);
            }
          };

          // Append to body and trigger click
          document.body.appendChild(input);
          input.click();

          // Optional: Add listener to remove input if user cancels file dialog
          // This is tricky across browsers, often the 'onchange' not firing is the indicator.
          // A simple timeout or focus check could work but isn't foolproof.
          // The current cleanup in `onchange` handles the success/error cases.
        }
      }
    }
  }), [showToast]); // Add showToast to dependency array

  const formats = useMemo(() => [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block', 'list', 'bullet', 'script', 'indent',
    'direction', 'align', 'color', 'background', 'link', 'image', 'video'
  ], []);

  // Note: For optimal mobile toolbar layout, global CSS might be needed if the toolbar overflows, e.g.:
  // .ql-toolbar { flex-wrap: wrap; padding: 4px; } /* Allow toolbar items to wrap */
  // .ql-snow .ql-formats { margin-right: 8px !important; margin-bottom: 4px; } /* Adjust spacing when wrapped */

  return (
    <div className={`quill-editor-container ${className} dark:text-gray-300`}> {/* Added dark mode text color for slider */}
      {/* Wrapper div controls the height */}
      <div
        className="quill-editor-wrapper border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden" // Added dark mode border
        style={{ ...style, height: `${editorHeight}px`, display: 'flex', flexDirection: 'column' }} // Apply dynamic height, use flex column
      >
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          ref={quillRef}
          modules={modules}
          formats={formats}
          className="bg-white flex-grow" // Use flex-grow to fill height
          placeholder={placeholder}
          style={{ height: 'calc(100% - 42px)' }} // Adjust height calculation based on toolbar height (approx 42px)
        />
      </div>
      {/* Height Adjustment Slider */}
      <div className="flex items-center space-x-2 mt-2 text-gray-600 dark:text-gray-400"> {/* Added dark mode text color */}
        <IconRenderer iconName="Minimize2" size={16} />
        <input
          type="range"
          min={MIN_HEIGHT}
          max={MAX_HEIGHT}
          value={editorHeight}
          onChange={(e) => setEditorHeight(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          aria-label="Adjust editor height"
        />
        <IconRenderer iconName="Maximize2" size={16} />
        <span className="text-xs w-12 text-right">{editorHeight}px</span> {/* Text color handled by parent div */}
      </div>
    </div>
  );
};

export default QuillEditor;
