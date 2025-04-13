import React from 'react';
import useFetchProducts from '../hooks/useFetchProducts';
import ProductCard from './ProductCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // Adjust path as needed

const ProductsSection: React.FC = () => {
  const { products, loading, error, refetch } = useFetchProducts();

  return (
    <section id="products" className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8 md:mb-12">
          Our Products
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-10">
            <LoadingSpinner size={40} color="text-indigo-500" />
            <span className="ml-4 text-gray-600 dark:text-gray-400">Loading Products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 mb-4 text-center text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
            <span className="font-medium">Error loading products:</span> {error}
            <button
              onClick={refetch}
              disabled={loading}
              className="ml-4 font-semibold underline hover:text-red-900 dark:hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Products State */}
        {!loading && !error && products.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-10">
            No products available at the moment. Please check back later!
          </p>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
