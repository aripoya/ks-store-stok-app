import { useState, useEffect } from 'react';

// Use the environment variable when available, otherwise use a relative path for local dev with proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
      setCategoriesLoading(true);
      try {
        const url = `${API_BASE_URL}/api/categories`;
        console.log('Test fetch categories from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        setCategories(data);
        setCategoriesError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
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
      setProductsLoading(true);
      try {
        const url = `${API_BASE_URL}/api/products`;
        console.log('Test fetch products from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        // Handle different response formats
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          throw new Error('Invalid API response format');
        }
        setProductsError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setProductsError(err.message);
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    }
    
    fetchProducts();
  }, []);

  return (
    <div className="container p-4">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <div className="bg-gray-100 p-3 rounded">
          <p>VITE_API_URL: {import.meta.env.VITE_API_URL || '(not set)'}</p>
          <p>API_BASE_URL: {API_BASE_URL || '(empty string)'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Categories Test</h2>
          {categoriesLoading ? (
            <p>Loading categories...</p>
          ) : categoriesError ? (
            <div className="text-red-500">
              <p>Error: {categoriesError}</p>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-green-600 font-medium">✓ Successfully fetched {categories.length} categories</p>
              <ul className="list-disc pl-5">
                {categories.map(category => (
                  <li key={category.id}>{category.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="border p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-4">Products Test</h2>
          {productsLoading ? (
            <p>Loading products...</p>
          ) : productsError ? (
            <div className="text-red-500">
              <p>Error: {productsError}</p>
            </div>
          ) : (
            <div>
              <p className="mb-2 text-green-600 font-medium">✓ Successfully fetched {products.length} products</p>
              <ul className="list-disc pl-5">
                {products.slice(0, 5).map(product => (
                  <li key={product.id}>{product.name}</li>
                ))}
                {products.length > 5 && <li>...and {products.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
