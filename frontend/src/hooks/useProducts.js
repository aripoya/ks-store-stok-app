import { useState, useEffect, useCallback } from 'react';
// Use the fixed API service instead of broken environment variable logic
import { productsAPI } from '../services/api';

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
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0
  });

  // Fallback products data
  const fallbackProducts = [
    { 
      id: 1, 
      name: 'Bakpia Pathok Klasik', 
      category_id: 1, 
      price: 25000, 
      description: 'Bakpia klasik rasa kacang hijau',
      barcode: 'BP001',
      stock: 100
    },
    { 
      id: 2, 
      name: 'Bakpia Premium Coklat', 
      category_id: 2, 
      price: 35000, 
      description: 'Bakpia premium dengan isian coklat',
      barcode: 'BP002', 
      stock: 50
    }
  ];

  // Fetch products with pagination and filters
  const fetchProducts = useCallback(async () => {
    console.log('🔍 DEBUG - fetchProducts called with:', {
      page, limit, searchTerm, selectedCategory
    });
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Making API call to get products...');
      // Make the API call using consistent method
      const data = await productsAPI.getAll({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category_id: selectedCategory })
      });
      
      console.log('✅ API Response:', data);
      
      // Ensure we have valid pagination data even if the API response is missing fields
      if (data && data.products && Array.isArray(data.products)) {
        // Expected API format with pagination
        setProducts(data.products);
        
        // Ensure pagination values are valid and safe
        // Correctly access the nested pagination object
        const paginationData = data.pagination || {};
        const safeTotal = typeof paginationData.total === 'number' ? paginationData.total : data.products.length;
        const safePage = typeof paginationData.page === 'number' ? paginationData.page : page;
        const safeLimit = typeof paginationData.limit === 'number' ? paginationData.limit : limit;
        const safeTotalPages = typeof paginationData.totalPages === 'number' 
          ? paginationData.totalPages 
          : Math.max(1, Math.ceil(safeTotal / safeLimit));
        
        // Log for debug purposes
        console.log('📊 Pagination data:', {
          page: safePage,
          limit: safeLimit,
          total: safeTotal,
          totalPages: safeTotalPages,
          productsLength: data.products.length
        });
        
        setPagination({
          page: safePage,
          limit: safeLimit,
          total: safeTotal,
          totalPages: safeTotalPages
        });
      } else if (Array.isArray(data)) {
        // Fallback for array format
        setProducts(data);
        setPagination({
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1
        });
      } else {
        console.log('⚠️ useProducts: No data returned, using fallback products');
        setProducts(fallbackProducts);
        setPagination({
          page: 1,
          limit: fallbackProducts.length,
          total: fallbackProducts.length,
          totalPages: 1
        });
      }
    } catch (err) {
      console.error('❌ useProducts: API error, using fallback:', err);
      setError(err.message);
      setProducts(fallbackProducts);
      setPagination({
        page: 1,
        limit: fallbackProducts.length,
        total: fallbackProducts.length,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, selectedCategory]);

  // Define state setters that reset page when params change
  // Define state setters that reset page when params change
  const setPageState = useCallback((newPage) => {
    if (page !== newPage) {
      console.log(`📄 Setting page to ${newPage} (was ${page})`);
      if (newPage < 1) newPage = 1;
      setPage(newPage);
    }
  }, [page]);

  const setLimitState = useCallback((newLimit) => {
    if (limit !== newLimit) {
      console.log(`📏 Setting limit to ${newLimit} (was ${limit})`);
      const currentStartItem = (page - 1) * limit + 1;
      const newPage = Math.max(1, Math.ceil(currentStartItem / newLimit));
      setLimit(newLimit);
      setPage(newPage);
    }
  }, [limit, page]);

  const setSearchState = useCallback((newSearch) => {
    if (searchTerm !== newSearch) {
      console.log(`🔍 Setting search to \"${newSearch}\"`);
      setPage(1);
      setSearchTerm(newSearch);
    }
  }, [searchTerm]);

  const setCategoryIdState = useCallback((newCategoryId) => {
    if (selectedCategory !== newCategoryId) {
      console.log(`🏷️ Setting category ID to ${newCategoryId}`);
      setPage(1);
      setSelectedCategory(newCategoryId);
    }
  }, [selectedCategory]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Only depend on memoized fetchProducts

  
  useEffect(() => {
    if (initialSearch !== searchTerm) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch, searchTerm]);

  // Add Product function - optimistically update without immediate refetch
  const addProduct = async (productData) => {
    try {
      // productsAPI.create returns parsed JSON data, not raw Response
      const newProduct = await productsAPI.create(productData);
      
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
      // productsAPI.update returns parsed JSON data, not raw Response
      const updatedProduct = await productsAPI.update(productId, productData);
      
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
      // productsAPI.delete returns parsed JSON data, not raw Response
      await productsAPI.delete(productId);
      
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
    selectedCategory, // Expose selectedCategory to consumers of the hook
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
