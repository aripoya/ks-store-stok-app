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
      console.log('✅ useProducts: API success, received data:', data);
      
      if (data && data.products && Array.isArray(data.products)) {
        // Expected API format with pagination
        setProducts(data.products);
        setPagination({
          page: data.page || page,
          limit: data.limit || limit,
          total: data.total || data.products.length,
          totalPages: data.totalPages || Math.ceil((data.total || data.products.length) / limit)
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
