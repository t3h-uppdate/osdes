import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Product, ProductImage } from '../../../types/productTypes'; // Adjust path as needed
import IconRenderer from '../../../components/common/IconRenderer'; // For placeholder icon
import { generateSlug } from '../../admin/utils/helpers'; // Import slug generator

interface ProductCardProps {
  product: Product;
}

// Helper to get the primary image URL
const getPrimaryImageUrl = (images: ProductImage[] | string[] | undefined): string | null => {
  if (!images || images.length === 0) {
    return null;
  }
  // If it's an array of strings, return the first one
  if (typeof images[0] === 'string') {
    return images[0];
  }
  // If it's an array of ProductImage objects, return the url of the first one
  if (typeof images[0] === 'object' && images[0] !== null && 'url' in images[0]) {
    return (images[0] as ProductImage).url;
  }
  return null;
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = getPrimaryImageUrl(product.images);

  const displayPrice = product.sale_price ?? product.price;
  const originalPrice = product.sale_price ? product.price : null;

  // Generate slugs for URL
  const categorySlug = product.category ? generateSlug(product.category) : 'uncategorized';
  // Use existing slug or generate from name as fallback (ensure product has name)
  const productSlug = product.slug || (product.name ? generateSlug(product.name) : '');

  // If slug is still empty/invalid, we might not want to render a link
  if (!productSlug) {
      console.warn(`Product "${product.name}" (ID: ${product.id}) is missing a slug.`);
      // Render a non-linked version or null? For now, proceed but link will be broken.
  }

  return (
    // Wrap the entire card content in a Link using category and slug
    <Link
        to={`/product/${encodeURIComponent(categorySlug)}/${encodeURIComponent(productSlug || 'invalid-slug')}`}
        className="block group"
        aria-label={`View details for ${product.name}`} // Add aria-label for accessibility
    >
      <div className="border rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white dark:bg-gray-800 dark:border-gray-700 h-full flex flex-col"> {/* Added h-full and flex flex-col */}
        <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0"> {/* Added flex-shrink-0 */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name} // Consider adding alt text to ProductImage type
              className="w-full h-full object-cover"
            />
          ) : (
            // Placeholder Icon
            <IconRenderer iconName="Image" size={48} className="text-gray-400 dark:text-gray-500" />
          )}
           {/* Optional: Add Sale Badge */}
           {originalPrice && (
             <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded z-10"> {/* Added z-index */}
               SALE
             </span>
           )}
        </div>
        {/* Added flex-grow to make this section fill remaining space */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate" title={product.name}>
            {product.name}
          </h3>
          {/* Adjusted description height and added flex-grow */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-10 overflow-hidden flex-grow">
            {product.short_description || 'No description available.'}
          </p>
          {/* Added mt-auto to push price to bottom */}
          <div className="flex items-baseline justify-between mt-auto">
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            {product.currency} {displayPrice.toFixed(2)}
          </p>
          {originalPrice && (
            <p className="text-sm text-gray-500 dark:text-gray-400 line-through ml-2">
              {product.currency} {originalPrice.toFixed(2)}
            </p>
          )}
        </div>
         {/* Optional: Add View Details Button */}
           {/* Removed View Details Button as the whole card is a link */}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
