import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

// Use the environment variable when available, otherwise use a relative path for local dev with proxy
// This ensures our code works in both development and production environments
const EFFECTIVE_API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

// Log API URL configuration
console.log('Products hook environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  EFFECTIVE_API_URL: EFFECTIVE_API_URL,
});

/**
 * A hook for fetching and managing product data
 * @param {Object} options - Options for fetching products
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Page size (default: 10)
 * @param {string} options.search - Search term (optional)
 * @param {number} options.categoryId - Filter by category ID (optional)
 * @returns {Object} Products data, loading state, error state, and pagination
 */
export function useProducts({ 
  page: initialPage = 1, 
  limit: initialLimit = 10, 
  search: initialSearch = '', 
  categoryId: initialCategoryId = null 
} = {}) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Fallback products data if API fails
  const localProducts = [
    { id: 1, name: 'Bakpia Klasik Kacang Hijau', category_id: 1, category_name: 'Bakpia Klasik', price: 45000, current_stock: 50 },
    { id: 2, name: 'Bakpia Premium Coklat', category_id: 2, category_name: 'Bakpia Premium', price: 65000, current_stock: 25 },
    { id: 3, name: 'Bakpia Spesial Keju', category_id: 3, category_name: 'Bakpia Spesial', price: 55000, current_stock: 35 },
    { id: 4, name: 'Paket Oleh-oleh Box Kecil', category_id: 4, category_name: 'Paket Oleh-oleh', price: 85000, current_stock: 15 },
  ];
  
  // Define state setters that reset page when params change
  const setPageState = (newPage) => {
    if (page !== newPage) {
      setPage(newPage);
    }
  };
  
  const setLimitState = (newLimit) => {
    if (limit !== newLimit) {
      setPage(1); // Reset to page 1 when changing limit
      setLimit(newLimit);
    }
  };
  
  const setSearchState = (newSearch) => {
    if (searchTerm !== newSearch) {
      setPage(1); // Reset to page 1 when changing search
      setSearchTerm(newSearch);
    }
  };
  
  const setCategoryIdState = (newCategoryId) => {
    if (selectedCategory !== newCategoryId) {
      setPage(1); // Reset to page 1 when changing category
      setSelectedCategory(newCategoryId);
    }
  };
  
  // Memoize fetchProducts with useCallback to prevent infinite loops
  const fetchProducts = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category_id', selectedCategory);
        if (searchTerm) queryParams.append('search', searchTerm);
        if (page) queryParams.append('page', page);
        if (limit) queryParams.append('limit', limit);
        
        const queryString = queryParams.toString();
        const url = `${EFFECTIVE_API_URL}/api/products${queryString ? `?${queryString}` : ''}`;
        
        console.log('🔍 Intercepted fetch request to:', url);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          console.log('API response data:', data);
          
          if (data && data.products && Array.isArray(data.products)) {
            // Expected API format with pagination
            console.log(`Received ${data.products.length} products (paginated format)`);
            setProducts(data.products);
            setPagination({
              page: data.page || page,
              limit: data.limit || limit,
              total: data.total || data.products.length,
              totalPages: data.totalPages || Math.ceil((data.total || data.products.length) / limit)
            });
          } else if (Array.isArray(data)) {
            // Fallback for array format
            console.log(`Received ${data.length} products (array format)`);
            setProducts(data);
            setPagination({
              page,
              limit,
              total: data.length,
              totalPages: Math.ceil(data.length / limit)
            });
          } else {
            console.error('Unexpected API response format:', data);
            throw new Error('Invalid API response format');
          }
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          // Handle different fetch error types
          if (fetchErr.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds');
          }
          throw fetchErr;
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to load products');
        
        // Fallback to local products
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    }, [page, limit, searchTerm, selectedCategory]); // Stable dependencies

    // Fetch data when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Only depend on memoized fetchProducts
  
  // Sync with external prop changes
  useEffect(() => {
    if (initialCategoryId !== selectedCategory) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialCategoryId, selectedCategory]);
  
  useEffect(() => {
    if (initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch, searchTerm]);

  // Add Product function - optimistically update without immediate refetch
  const addProduct = async (productData) => {
    try {
      const response = await fetch(`${EFFECTIVE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }
      
      const newProduct = await response.json();
      
      // Optimistically update the products list instead of refetching
      setProducts(prevProducts => [newProduct, ...prevProducts]);
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: prev.total + 1,
        totalPages: Math.ceil((prev.total + 1) / prev.limit)
      }));
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };
  
  // Update Product function - optimistically update without immediate refetch  
  const updateProduct = async (productId, productData) => {
    try {
      const response = await fetch(`${EFFECTIVE_API_URL}/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }
      
      const updatedProduct = await response.json();
      
      // Optimistically update the products list
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId ? updatedProduct : product
        )
      );
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };
  
  // Delete Product function - optimistically update without immediate refetch
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`${EFFECTIVE_API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      
      // Optimistically update the products list
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      // Update pagination total
      setPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        totalPages: Math.ceil(Math.max(0, prev.total - 1) / prev.limit)
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    products,
    loading,
    error,
    pagination,
    setPage: setPageState,
    setLimit: setLimitState,
    setSearch: setSearchState,
    setCategoryId: setCategoryIdState,
    refresh: fetchProducts, // Expose refresh function to manually trigger data reload
    addProduct,
    updateProduct,
    deleteProduct
  };
}
