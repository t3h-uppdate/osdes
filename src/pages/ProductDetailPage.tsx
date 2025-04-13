import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import supabase from '../config/supabaseConfig'; // Adjust path
import { Product, ProductImage } from '../types/productTypes'; // Adjust path, ensure ProductImage is imported
import LoadingSpinner from '../components/common/LoadingSpinner'; // Adjust path
import NotFoundPage from './NotFoundPage'; // For handling product not found
import { useSite } from '../contexts/SiteSettingsContext'; // Import useSite

const ProductDetailPage: React.FC = () => {
  // Get category and productSlug from URL params
  const { category, productSlug } = useParams<{ category: string; productSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Access t function for potential translations later
  const { t } = useSite(); // Assuming SiteProvider wraps this route

  useEffect(() => {
    const fetchProduct = async () => {
      // Check for slug instead of ID
      if (!productSlug) {
        setError('Product slug is missing.');
        setLoading(false);
        return;
      }
      if (!supabase) {
        setError('Supabase client not initialized.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch using the slug
        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('slug', productSlug) // Use slug for lookup
          // Optionally filter by category as well for extra safety, though slug should be unique
          // .eq('category', category)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') { // PostgREST code for "Resource Not Found"
            setError('Product not found.');
          } else {
            throw fetchError;
          }
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err: any) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to fetch product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Depend on productSlug and category (if used in query)
  }, [productSlug, category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size={48} />
      </div>
    );
  }

  if (error === 'Product not found.') {
      return <NotFoundPage />; // Show 404 if product doesn't exist
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    // This case might be redundant due to the error handling above, but good as a fallback
    return <NotFoundPage />;
  }

  // Ensure images is an array of ProductImage for rendering
  const productImages = (Array.isArray(product.images) ? product.images : []) as ProductImage[];
  const primaryImageUrl = productImages.length > 0 ? productImages[0].url : null; // Get first image URL

  return (
      <div className="container mx-auto px-4 py-8 min-h-screen"> {/* Added min-h-screen */}
        {/* Breadcrumbs (Optional) */}
        <nav className="text-sm mb-4" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400">Home</a>
              <svg className="fill-current w-3 h-3 mx-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
            </li>
            {product.category && (
              <li className="flex items-center">
                {/* TODO: Link category if category pages exist */}
                <span className="text-gray-500 dark:text-gray-400">{product.category}</span>
                <svg className="fill-current w-3 h-3 mx-3 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
              </li>
            )}
            <li>
              <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery Placeholder */}
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
             {/* TODO: Implement Image Gallery/Carousel */}
             {primaryImageUrl ? (
                 <img src={primaryImageUrl} alt={product.name} className="max-h-full max-w-full object-contain rounded-lg"/>
             ) : (
                 <span className="text-gray-500">Image coming soon</span>
             )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">{product.name}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{product.short_description}</p>

            {/* Price */}
            <div className="mb-4">
                <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {product.currency} {(product.sale_price ?? product.price).toFixed(2)}
                </span>
                {product.sale_price && (
                    <span className="text-xl text-gray-500 dark:text-gray-400 line-through ml-3">
                        {product.currency} {product.price.toFixed(2)}
                    </span>
                )}
            </div>

            {/* Availability */}
            <div className="mb-4">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    product.availability_status === 'In Stock' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' :
                    product.availability_status === 'Out of Stock' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                }`}>
                    {product.availability_status}
                </span>
                {product.availability_status === 'In Stock' && product.stock_quantity > 0 && (
                    <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">({product.stock_quantity} available)</span>
                )}
            </div>

            {/* TODO: Add Variant Selection UI */}
            {/* TODO: Add Quantity Selector */}
            {/* TODO: Add "Add to Cart" Button */}

            {/* Full Description */}
            {product.full_description && (
                <div className="mt-6 pt-6 border-t dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">Description</h2>
                    {/* Use dangerouslySetInnerHTML ONLY if description is trusted HTML, otherwise render as text */}
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{product.full_description}</p>
                </div>
            )}

             {/* Other Details (Tags, Material, etc.) */}
             <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {product.sku && <p><strong>SKU:</strong> {product.sku}</p>}
                {product.material && <p><strong>Material:</strong> {product.material}</p>}
                {product.tags && product.tags.length > 0 && (
                    <p><strong>Tags:</strong> {product.tags.join(', ')}</p>
                )}
                {/* Add Dimensions, Weight, etc. here */}
             </div>

          </div>
        </div>

        {/* Optional Sections: Reviews, Related Products, etc. */}

      </div>
  );
};

export default ProductDetailPage;
