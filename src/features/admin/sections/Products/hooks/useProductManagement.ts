import { useState, useEffect, useCallback } from 'react';
import supabase from '../../../../../config/supabaseConfig'; // Use default import
import { Product, NewProduct, UpdateProduct } from '../../../../../types/productTypes'; // Adjust path as needed

const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      setProducts([]); // Ensure products is empty if client fails
      return;
    }
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (newProductData: NewProduct): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      return null;
    }
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([newProductData])
        .select()
        .single(); // Assuming insert returns the created row

      if (insertError) throw insertError;

      if (data) {
        setProducts((prev) => [data, ...prev]); // Add to start of list
        return data;
      }
      return null;
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (updatedProductData: UpdateProduct): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      return null;
    }
    try {
      const { data, error: updateError } = await supabase
        .from('products')
        .update(updatedProductData)
        .eq('id', updatedProductData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.id ? data : p))
        );
        return data;
      }
      return null;
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    if (!supabase) {
      setError('Supabase client not initialized.');
      setLoading(false);
      return false;
    }
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return true;
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts, // Expose refetch capability
    addProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useProductManagement;
