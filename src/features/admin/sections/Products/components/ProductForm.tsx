import React, { useState, useEffect } from 'react';
import { Product, NewProduct, UpdateProduct, ProductImage, ProductAvailabilityStatus } from '../../../../../types/productTypes'; // Adjust path, add ProductImage & ProductAvailabilityStatus
import ExistingImageSelector from './ExistingImageSelector'; // Import the selector modal
import IconRenderer from '../../../../../components/common/IconRenderer'; // For icons

interface ProductFormProps {
  productToEdit?: Product | null; // Product data if editing, null/undefined if creating
  onSubmit: (productData: NewProduct | UpdateProduct) => Promise<void>; // Function to handle form submission
  onCancel: () => void; // Function to handle cancellation
  isLoading: boolean; // Loading state from the parent/hook
}

const ProductForm: React.FC<ProductFormProps> = ({
  productToEdit,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState<boolean>(false);

  // Helper function to create the initial/reset state
  const getInitialFormData = (product: Product | null | undefined): Partial<Product> => {
    const initialData = product ? { ...product } : {
      name: '',
      sku: '',
      price: 0,
      stock_quantity: 0,
      // Explicitly type the default status
      availability_status: 'Out of Stock' as ProductAvailabilityStatus,
      currency: 'USD',
      short_description: '',
      full_description: '',
      category: '',
      sale_price: undefined,
      discount_percentage: undefined,
      tags: [],
      material: '',
      video_url: '',
      return_policy: '',
      shipping_cost: undefined,
      estimated_delivery_time: '',
      images: [], // Initialize images as empty array
    };
    // Ensure images is always an array of ProductImage (or empty)
    // The DB might store string[], but the form works with ProductImage[]
    if (!Array.isArray(initialData.images) || (initialData.images.length > 0 && typeof initialData.images[0] === 'string')) {
      // Attempt conversion if needed, or default to empty array if conversion isn't straightforward
      // For now, we assume the form receives ProductImage[] or empty/null
       initialData.images = []; // Default to empty ProductImage array if format is unexpected
    }
    // Cast to ensure it's treated as ProductImage[] within the form state
    initialData.images = initialData.images as ProductImage[];

    return initialData;
  };

  // Initialize form state
  const [formData, setFormData] = useState<Partial<Product>>(() => getInitialFormData(productToEdit));

  // Update form data if productToEdit changes
  useEffect(() => {
    setFormData(getInitialFormData(productToEdit));
  }, [productToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    const finalValue = value === '' ? undefined : (isNaN(parsedValue) ? undefined : parsedValue);
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  // Handler for when images are selected in the modal
  const handleImageSelection = (selectedImages: ProductImage[]) => {
    setFormData(prev => ({
      ...prev,
      // Ensure we are setting ProductImage[]
      images: selectedImages,
    }));
  };

  // Handler to remove an image directly from the form preview
  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => {
        // Ensure prev.images is treated as ProductImage[] or empty array
        const currentImages = (Array.isArray(prev.images) ? prev.images : []) as ProductImage[];
        return {
            ...prev,
            images: currentImages.filter((_, index) => index !== indexToRemove),
        };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || formData.price === undefined || formData.stock_quantity === undefined) {
      alert('Please fill in all required fields (Name, SKU, Price, Stock Quantity).');
      return;
    }

    const submissionData = { ...formData };

    submissionData.price = formData.price === undefined ? 0 : Number(formData.price);
    submissionData.stock_quantity = formData.stock_quantity === undefined ? 0 : Number(formData.stock_quantity);
    submissionData.sale_price = formData.sale_price === undefined ? undefined : Number(formData.sale_price);
    submissionData.discount_percentage = formData.discount_percentage === undefined ? undefined : Number(formData.discount_percentage);
    submissionData.shipping_cost = formData.shipping_cost === undefined ? undefined : Number(formData.shipping_cost);

    if (typeof submissionData.tags === 'string') {
      submissionData.tags = (submissionData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    } else if (!Array.isArray(submissionData.tags)) {
      submissionData.tags = [];
    }

    // Ensure images is an array of ProductImage before submitting
    if (!Array.isArray(submissionData.images)) {
        submissionData.images = [];
    }
    // Ensure all elements are ProductImage (might be redundant but safe)
    submissionData.images = (submissionData.images as any[]).filter(img => typeof img === 'object' && img !== null && 'url' in img) as ProductImage[];


    await onSubmit(submissionData as NewProduct | UpdateProduct);
  };

  // Cast formData.images to ProductImage[] for reliable use in JSX
  const currentFormImages = (Array.isArray(formData.images) ? formData.images : []) as ProductImage[];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
        {productToEdit ? 'Edit Product' : 'Add New Product'}
      </h3>

      {/* Basic Fields */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="sku" className="block text-sm font-medium text-gray-700 dark:text-gray-300">SKU *</label>
        <input
          type="text"
          id="sku"
          name="sku"
          value={formData.sku || ''}
          onChange={handleChange}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

       <div>
        <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Short Description</label>
        <textarea
          id="short_description"
          name="short_description"
          rows={2}
          value={formData.short_description || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

       <div>
        <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Description</label>
        <textarea
          id="full_description"
          name="full_description"
          rows={4}
          value={formData.full_description || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
        {/* TODO: Consider replacing with QuillEditor component */}
      </div>

       <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>


      {/* Pricing Fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
       <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price ?? ''}
            onChange={handleNumberChange}
            required
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sale Price</label>
          <input
            type="number"
            id="sale_price"
            name="sale_price"
            value={formData.sale_price ?? ''}
            onChange={handleNumberChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
         <div>
          <label htmlFor="discount_percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
          <input
            type="number"
            id="discount_percentage"
            name="discount_percentage"
            value={formData.discount_percentage ?? ''}
            onChange={handleNumberChange}
            step="0.01"
            min="0"
            max="100"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>


       {/* Inventory Fields */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stock Quantity *</label>
          <input
            type="number"
            id="stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity ?? ''}
            onChange={handleNumberChange}
            required
            step="1"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
       <div>
          <label htmlFor="availability_status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Availability Status</label>
          <select
            id="availability_status"
            name="availability_status"
            value={formData.availability_status || 'Out of Stock'}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Pre-order">Pre-order</option>
          </select>
        </div>
      </div>

      {/* Other Fields */}
       <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags (comma-separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || '')}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>
       <div>
        <label htmlFor="material" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Material / Ingredients</label>
        <input
          type="text"
          id="material"
          name="material"
          value={formData.material || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>
       <div>
        <label htmlFor="video_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Demo URL</label>
        <input
          type="url"
          id="video_url"
          name="video_url"
          value={formData.video_url || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* Shipping & Returns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="shipping_cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Cost</label>
          <input
            type="number"
            id="shipping_cost"
            name="shipping_cost"
            value={formData.shipping_cost ?? ''}
            onChange={handleNumberChange}
            step="0.01"
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="estimated_delivery_time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Est. Delivery Time</label>
          <input
            type="text"
            id="estimated_delivery_time"
            name="estimated_delivery_time"
            value={formData.estimated_delivery_time || ''}
            onChange={handleChange}
            placeholder="e.g., 3-5 business days"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>
       <div>
        <label htmlFor="return_policy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Return Policy</label>
        <textarea
          id="return_policy"
          name="return_policy"
          rows={3}
          value={formData.return_policy || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-800 dark:text-white"
        />
      </div>


      {/* Image Selection Area */}
      <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Product Images</label>
          {/* Display selected image previews */}
          {(currentFormImages.length > 0) ? (
             <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 mb-3">
               {currentFormImages.map((image, index) => (
                 <div key={index} className="relative group aspect-square">
                   <img
                     src={image.url}
                      alt={image.alt || `Product Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md border dark:border-gray-600"
                    />
                    {/* Removed duplicate button from here */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <IconRenderer iconName="CloseX" size={14} />
                    </button>
                  </div>
                ))}
              </div>
          ) : (
             <p className="text-sm text-gray-500 dark:text-gray-400">No images selected.</p>
          )}
          {/* Button to open the selector modal */}
          <button
            type="button"
            onClick={() => setIsImageSelectorOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <IconRenderer iconName="Image" size={16} className="mr-2" />
            Select Images from History
          </button>
      </div>


      {/* Placeholder for other complex fields: Variants, Dimensions, Weight, Subscription */}
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm pt-4">More complex fields (Variants, Dimensions, etc.) will be added later.</p>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (productToEdit ? 'Update Product' : 'Add Product')}
        </button>
      </div>

      {/* Image Selector Modal */}
      {isImageSelectorOpen && (
        <ExistingImageSelector
          onSelectImages={handleImageSelection}
          onClose={() => setIsImageSelectorOpen(false)}
          // Pass currently selected images
          currentSelectedImages={currentFormImages}
        />
      )}
    </form>
  );
};

export default ProductForm;
