import { useState, useEffect } from 'react';

// With the Vite proxy configuration, we can use relative URLs instead of absolute URLs
// This avoids CORS issues and makes development easier
const API_BASE_URL = '';  // Empty base URL will use the current domain

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
  
  useEffect(() => {
    // Fetch products when dependencies change
    const fetchProducts = async () => {
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
        const url = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;
        
        console.log('Fetching products from:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Products data:', data);
        
        // Check if the response has the expected structure
        if (data && Array.isArray(data.products)) {
          console.log(`Received ${data.products.length} products`);
          setProducts(data.products);
          setPagination(data.pagination || {
            page,
            limit,
            total: data.products.length,
            totalPages: Math.ceil(data.products.length / limit)
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
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to load products');
        
        // Fallback to local products
        setProducts(localProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit, searchTerm, selectedCategory]);
  
  // Sync with external prop changes
  useEffect(() => {
    if (initialCategoryId !== selectedCategory) {
      setSelectedCategory(initialCategoryId);
    }
  }, [initialCategoryId]);
  
  useEffect(() => {
    if (initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  return {
    products,
    loading,
    error,
    pagination,
    setPage: setPageState,
    setLimit: setLimitState,
    setSearch: setSearchState,
    setCategoryId: setCategoryIdState
  };
}
