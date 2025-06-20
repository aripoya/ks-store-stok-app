import { useState, useEffect } from 'react';

// API base URL from environment variables (with fallback)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Log API URL configuration
console.log('Products hook environment variables:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
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
  page = 1, 
  limit = 10, 
  search = '', 
  categoryId = null 
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      
      try {
        // Build the query string
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (search) {
          params.append('search', search);
        }
        
        if (categoryId) {
          params.append('category_id', categoryId);
        }
        
        // Enhanced debugging - show all environment variables
        console.log('Environment variables:', {
          VITE_API_URL: import.meta.env.VITE_API_URL,
          MODE: import.meta.env.MODE,
          DEV: import.meta.env.DEV,
        });
        
        // Direct fetch implementation with full URL logging
        const fullUrl = `${API_BASE_URL}/api/products?${params.toString()}`;
        console.log('Fetching from:', fullUrl);
        
        const response = await fetch(fullUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          // Try to get response text for more detailed error info
          const errorText = await response.text();
          console.error('API Error response:', errorText);
          throw new Error(`API Error: ${response.status}\nDetails: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Products data:', data);
        
        // Ensure data is processed correctly
        const productsList = data.products || [];
        console.log('Products list:', productsList);
        
        setProducts(productsList);
        setPagination(data.pagination || {
          page,
          limit,
          total: productsList.length,
          totalPages: 1
        });
        
        // Log the state update
        console.log('State updated with products:', productsList.length);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to load products');
        
        // Fallback hardcoded products for development
        setProducts([
          { id: 1, name: 'Bakpia Klasik Kacang Hijau', category_id: 1, category_name: 'Bakpia Klasik', price: 45000, current_stock: 50 },
          { id: 2, name: 'Bakpia Premium Coklat', category_id: 2, category_name: 'Bakpia Premium', price: 65000, current_stock: 25 },
          { id: 3, name: 'Bakpia Spesial Keju', category_id: 3, category_name: 'Bakpia Spesial', price: 55000, current_stock: 35 },
          { id: 4, name: 'Paket Oleh-oleh Box Kecil', category_id: 4, category_name: 'Paket Oleh-oleh', price: 85000, current_stock: 15 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, limit, search, categoryId]);

  return {
    products,
    loading,
    error,
    pagination,
    setPage: (newPage) => page !== newPage && setProducts([]),
    setLimit: (newLimit) => limit !== newLimit && setProducts([]),
    setSearch: (newSearch) => search !== newSearch && setProducts([]),
    setCategoryId: (newCategoryId) => categoryId !== newCategoryId && setProducts([])
  };
}
