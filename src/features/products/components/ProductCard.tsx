import React from 'react';
import { Product, ProductImage } from '../../../types/productTypes'; // Adjust path as needed
import IconRenderer from '../../../components/common/IconRenderer'; // For placeholder icon

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

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name} // Consider adding alt text to ProductImage type
            className="w-full h-full object-cover"
          />
        ) : (
          // Placeholder Icon
          <IconRenderer iconName="ImageIcon" size={48} className="text-gray-400 dark:text-gray-500" />
        )}
         {/* Optional: Add Sale Badge */}
         {originalPrice && (
           <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
             SALE
           </span>
         )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 h-10 overflow-hidden"> {/* Fixed height for description */}
          {product.short_description || 'No description available.'}
        </p>
        <div className="flex items-baseline justify-between">
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
         {/* <button className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
           View Details
         </button> */}
      </div>
    </div>
  );
};

export default ProductCard;
