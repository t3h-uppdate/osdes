import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../config/supabaseConfig'; // Adjust path as needed
import { Product } from '../../../types/productTypes'; // Adjust path as needed

const useFetchProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      setProducts([]);
      return;
    }
    try {
      // Fetch only products that might be considered 'active' or 'available'
      // Example: Fetch all for now, but could filter by status later e.g., .in('availability_status', ['In Stock', 'Pre-order'])
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        // Optionally add filters here, e.g., for status or category
        .order('created_at', { ascending: false }); // Or order by name, price, etc.

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products for frontend:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts, // Expose refetch capability
  };
};

export default useFetchProducts;
