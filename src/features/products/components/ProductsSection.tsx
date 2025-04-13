import React, { useState, useMemo } from 'react'; // Import useState and useMemo
import useFetchProducts from '../hooks/useFetchProducts';
import ProductCard from './ProductCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner'; // Adjust path as needed
import IconRenderer from '../../../components/common/IconRenderer'; // For icons
import { Product } from '../../../types/productTypes'; // Import Product type

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const ProductsSection: React.FC = () => {
  const { products: allProducts, loading, error, refetch } = useFetchProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOption>('default');

  // --- Filtering ---
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>(['all']); // Start with 'all'
    allProducts.forEach(p => {
      if (p.category) {
        uniqueCategories.add(p.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts;
    }
    return allProducts.filter(p => p.category === selectedCategory);
  }, [allProducts, selectedCategory]);

  // --- Sorting ---
  const sortedProducts = useMemo(() => {
    let sorted: Product[] = [...filteredProducts]; // Create a typed copy to sort
    switch (sortOrder) {
      case 'price-asc':
        sorted.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'default':
      default:
        // Keep original order (fetched as created_at desc) or apply default sort
        // Example: sort by creation date if needed, otherwise do nothing
        // sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return sorted;
  }, [filteredProducts, sortOrder]);

  // Use 'sortedProducts' for rendering the grid
  const productsToDisplay = sortedProducts;

  return (
    <section id="products" className="py-12 md:py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8 md:mb-12">
          Our Products
        </h2>

        {/* Filter and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category:</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              // Correct boolean logic for disabled prop
              disabled={loading || !!error || categories.length <= 1}
              className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Order */}
          <div className="flex items-center space-x-2">
             <label htmlFor="sort-order" className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
             <select
               id="sort-order"
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as SortOption)}
               // Correct boolean logic for disabled prop
               disabled={loading || !!error || productsToDisplay.length === 0}
               className="block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 dark:text-white disabled:opacity-50"
             >
               <option value="default">Default</option>
               <option value="price-asc">Price: Low to High</option>
               <option value="price-desc">Price: High to Low</option>
               <option value="name-asc">Name: A to Z</option>
               <option value="name-desc">Name: Z to A</option>
             </select>
          </div>
        </div>


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
              disabled={loading} // Only disable retry based on loading state
              className="ml-4 font-semibold underline hover:text-red-900 dark:hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Products State (considering filters) */}
        {!loading && !error && productsToDisplay.length === 0 && (
           <p className="text-center text-gray-500 dark:text-gray-400 py-10">
             {selectedCategory === 'all'
               ? 'No products available at the moment. Please check back later!'
               : `No products found in the "${selectedCategory}" category.`}
           </p>
        )}

        {/* Products Grid */}
        {!loading && !error && productsToDisplay.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {productsToDisplay.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductsSection;
