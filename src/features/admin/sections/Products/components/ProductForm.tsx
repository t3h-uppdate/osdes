import React, { useState, useEffect } from 'react';
import { Product, NewProduct, UpdateProduct } from '../../../../../types/productTypes'; // Adjust path as needed

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
  // Initialize form state based on whether we are editing or creating
  const [formData, setFormData] = useState<Partial<Product>>(() => {
    if (productToEdit) {
      // If editing, populate form with existing product data
      return { ...productToEdit };
    } else {
      // If creating, start with default/empty values
      return {
        name: '',
        sku: '',
        price: 0,
        stock_quantity: 0,
        availability_status: 'Out of Stock',
        currency: 'USD',
        // Add other fields with sensible defaults or empty states
        short_description: '',
        full_description: '',
        category: '',
        sale_price: undefined, // Optional numeric
        discount_percentage: undefined, // Optional numeric
        tags: [], // Array of strings
        material: '',
        video_url: '',
        return_policy: '',
        shipping_cost: undefined, // Optional numeric
        estimated_delivery_time: '',
        images: [], // Keep for future image handling
        // ... other fields like variants, dimensions, weight, subscription
      };
    }
  });

  // Update form data if productToEdit changes (e.g., user selects a different product to edit)
  useEffect(() => {
    if (productToEdit) {
      setFormData({ ...productToEdit });
    } else {
      // Reset form if switching from edit to create mode
      setFormData({
        name: '', sku: '', price: 0, stock_quantity: 0, availability_status: 'Out of Stock', currency: 'USD',
        short_description: '', full_description: '', category: '', sale_price: undefined,
        discount_percentage: undefined, tags: [], material: '', video_url: '', return_policy: '',
        shipping_cost: undefined, estimated_delivery_time: '', images: [],
      });
    }
  }, [productToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Handle checkbox type specifically if needed later
    // const targetValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    const targetValue = value; // For now, assume text/select/textarea

    setFormData((prev) => ({
      ...prev,
      [name]: targetValue,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Store undefined if empty, otherwise parse as float/int. Handle potential NaN.
    const parsedValue = parseFloat(value);
    const finalValue = value === '' ? undefined : (isNaN(parsedValue) ? undefined : parsedValue);
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation example (expand as needed)
    // Check only for undefined for numeric fields, as '' is no longer stored for them
    if (!formData.name || !formData.sku || formData.price === undefined || formData.stock_quantity === undefined) {
      alert('Please fill in all required fields (Name, SKU, Price, Stock Quantity).');
      return;
    }

    // Prepare data for submission (remove empty strings for optional fields if necessary)
    const submissionData = { ...formData };

    // Convert numeric fields back to numbers, handling undefined
    // Ensure price is a number, defaulting to 0 if undefined
    submissionData.price = formData.price === undefined ? 0 : Number(formData.price);
    // Ensure stock_quantity is a number, defaulting to 0 if undefined
    submissionData.stock_quantity = formData.stock_quantity === undefined ? 0 : Number(formData.stock_quantity);

    // Add similar conversions for other OPTIONAL numeric fields
    submissionData.sale_price = formData.sale_price === undefined ? undefined : Number(formData.sale_price);
    submissionData.discount_percentage = formData.discount_percentage === undefined ? undefined : Number(formData.discount_percentage);
    submissionData.shipping_cost = formData.shipping_cost === undefined ? undefined : Number(formData.shipping_cost);
    // Handle tags - assuming comma-separated input for now
    if (typeof submissionData.tags === 'string') {
       submissionData.tags = (submissionData.tags as string).split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    } else if (!Array.isArray(submissionData.tags)) {
        submissionData.tags = []; // Default to empty array if not string or array
    }


    // Type assertion needed here because formData is Partial<Product>, but we've ensured required numeric fields are numbers
    await onSubmit(submissionData as NewProduct | UpdateProduct);
  };

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
            value={formData.price ?? ''} // Use ?? '' to handle potential undefined/null and show empty string
            onChange={handleNumberChange}
            required
            step="0.01" // Allow decimals for price
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
            step="1" // Whole numbers for stock
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
          // Join array for display, handle potential non-array state defensively
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


      {/* Placeholder for more complex fields: Images, Variants, Dimensions, Weight, Subscription */}
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm pt-4">More complex fields (Images, Variants, Dimensions, etc.) will be added later.</p>

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
    </form>
  );
};

export default ProductForm;
