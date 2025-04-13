import React, { useState } from 'react';
import useProductManagement from './hooks/useProductManagement';
import ProductForm from './components/ProductForm'; // Import the form
import { Product, NewProduct, UpdateProduct } from '../../../../types/productTypes'; // Import types
import LoadingSpinner from '../../../../components/common/LoadingSpinner'; // Import spinner
import IconRenderer from '../../../../components/common/IconRenderer'; // For icons

const ProductsSection: React.FC = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, fetchProducts } = useProductManagement();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Separate loading state for form submission

  const handleAddNewClick = () => {
    setProductToEdit(null); // Ensure we are in "add" mode
    setShowForm(true);
  };

  const handleEditClick = (product: Product) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setProductToEdit(null);
  };

  const handleDeleteClick = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setIsSubmitting(true); // Use isSubmitting to disable buttons during delete
      const success = await deleteProduct(productId);
      if (success) {
        // Optionally show a success notification
        console.log('Product deleted successfully');
      } else {
        // Optionally show an error notification
        console.error('Failed to delete product');
        alert('Failed to delete product. See console for details.');
      }
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (productData: NewProduct | UpdateProduct) => {
    setIsSubmitting(true);
    let success = false;
    try {
      if (productToEdit) {
        // Update existing product
        const result = await updateProduct({ ...productData, id: productToEdit.id } as UpdateProduct);
        success = !!result;
      } else {
        // Add new product
        const result = await addProduct(productData as NewProduct);
        success = !!result;
      }

      if (success) {
        setShowForm(false);
        setProductToEdit(null);
        // Optionally show success notification
        console.log(`Product ${productToEdit ? 'updated' : 'added'} successfully`);
        // No need to call fetchProducts here as the hook updates the state internally
      } else {
        // Error handled within the hook, but maybe show a generic error here
        alert(`Failed to ${productToEdit ? 'update' : 'add'} product. See console for details.`);
      }
    } catch (err) {
      console.error('Error submitting product form:', err);
      alert(`An unexpected error occurred. Failed to ${productToEdit ? 'update' : 'add'} product.`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-6 bg-white dark:bg-gray-800 shadow rounded-lg min-h-[calc(100vh-150px)]"> {/* Added min-height */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Manage Products
        </h2>
        {!showForm && (
          <button
            onClick={handleAddNewClick}
            disabled={loading || isSubmitting} // Disable if loading products or submitting form/deleting
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconRenderer iconName="Plus" className="mr-2" />
            Add New Product
          </button>
        )}
      </div>

      {showForm ? (
        <ProductForm
          productToEdit={productToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          isLoading={isSubmitting} // Pass form submission loading state
        />
      ) : (
        <div>
          {/* Display Loading State */}
          {loading && !products.length && ( // Show initial loading spinner
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size={32} color="text-indigo-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading products...</span>
            </div>
          )}

          {/* Display Error State */}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              <span className="font-medium">Error:</span> {error}
              <button
                onClick={fetchProducts}
                disabled={loading || isSubmitting}
                className="ml-4 font-semibold underline hover:text-red-900 dark:hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Retry
              </button>
            </div>
          )}

          {/* Display Product List or No Products Message */}
          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">No products found. Add your first product!</p>
          )}

          {!error && products.length > 0 && (
            <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="py-3 px-6">Name</th>
                    <th scope="col" className="py-3 px-6">SKU</th>
                    <th scope="col" className="py-3 px-6">Price</th>
                    <th scope="col" className="py-3 px-6">Stock</th>
                    <th scope="col" className="py-3 px-6">Status</th>
                    <th scope="col" className="py-3 px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                      <th scope="row" className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {product.name}
                      </th>
                      <td className="py-4 px-6">{product.sku}</td>
                      <td className="py-4 px-6">{product.price ? `${product.currency} ${product.price.toFixed(2)}` : '-'}</td>
                      <td className="py-4 px-6">{product.stock_quantity}</td>
                      <td className="py-4 px-6">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                           product.availability_status === 'In Stock' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                           product.availability_status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                           'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' // Pre-order or other
                         }`}>
                          {product.availability_status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          disabled={isSubmitting || loading} // Disable if submitting or loading list
                          className="font-medium text-blue-600 dark:text-blue-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Edit ${product.name}`}
                        >
                          <IconRenderer iconName="Edit" size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          disabled={isSubmitting || loading} // Disable if submitting or loading list
                          className="font-medium text-red-600 dark:text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label={`Delete ${product.name}`}
                        >
                           <IconRenderer iconName="Trash2" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsSection;
