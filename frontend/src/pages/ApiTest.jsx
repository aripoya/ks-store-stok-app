import { useState, useEffect } from 'react';
// Use the fixed API services instead of broken environment variable logic
import { categoriesAPI, productsAPI } from '../services/api';

export default function ApiTest() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [productsError, setProductsError] = useState(null);

  // Test fetching categories
  useEffect(() => {
    async function fetchCategories() {
      console.log('🔍 ApiTest: Starting fetchCategories with proper API service...');
      setCategoriesLoading(true);
      setCategoriesError(null);

      try {
        // Use the fixed categoriesAPI service
        const data = await categoriesAPI.getAll();
        console.log('✅ ApiTest: Categories API success, received:', data?.length || 0);
        
        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          console.log('⚠️ ApiTest: No categories data returned, setting empty array');
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ ApiTest: Categories API error:', err);
        setCategoriesError(err.message);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  // Test fetching products
  useEffect(() => {
    async function fetchProducts() {
      console.log('🔍 ApiTest: Starting fetchProducts with proper API service...');
      setProductsLoading(true);
      setProductsError(null);

      try {
        // Use the fixed productsAPI service with pagination
        const response = await productsAPI.getAll({ page: 1, limit: 10 });
        console.log('✅ ApiTest: Products API success, received:', response?.data?.length || 0);
        
        if (response?.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.log('⚠️ ApiTest: No products data returned, setting empty array');
          setProducts([]);
        }
      } catch (err) {
        console.error('❌ ApiTest: Products API error:', err);
        setProductsError(err.message);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories Test</h2>
        {categoriesLoading ? (
          <p>Loading categories...</p>
        ) : categoriesError ? (
          <p className="text-red-600">Error: {categoriesError}</p>
        ) : (
          <div>
            <p className="mb-2">✅ Categories loaded successfully: {categories.length} items</p>
            <div className="grid gap-2">
              {categories.slice(0, 3).map((category) => (
                <div key={category.id} className="p-2 border rounded bg-gray-50">
                  {category.name} (ID: {category.id})
                </div>
              ))}
              {categories.length > 3 && <p className="text-sm text-gray-600">... and {categories.length - 3} more</p>}
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Products Test</h2>
        {productsLoading ? (
          <p>Loading products...</p>
        ) : productsError ? (
          <p className="text-red-600">Error: {productsError}</p>
        ) : (
          <div>
            <p className="mb-2">✅ Products loaded successfully: {products.length} items</p>
            <div className="grid gap-2">
              {products.slice(0, 3).map((product) => (
                <div key={product.id} className="p-2 border rounded bg-gray-50">
                  {product.name} - Rp {product.price?.toLocaleString('id-ID')} (ID: {product.id})
                </div>
              ))}
              {products.length > 3 && <p className="text-sm text-gray-600">... and {products.length - 3} more</p>}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <p>✅ Using centralized API services from services/api.js</p>
        <p>✅ No more broken VITE_API_URL dependencies</p>
        <p>Categories: {categories.length} | Products: {products.length}</p>
      </div>
    </div>
  );
}
