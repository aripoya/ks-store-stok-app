import { useState, useEffect } from 'react';

/**
 * Simple test page to verify API connectivity and data rendering
 */
export default function TestPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        console.log('Test Page using API URL:', API_BASE_URL);
        
        // Fetch categories
        const categoryRes = await fetch(`${API_BASE_URL}/api/categories`);
        if (!categoryRes.ok) throw new Error(`Categories API error: ${categoryRes.status}`);
        const categoryData = await categoryRes.json();
        setCategories(categoryData);
        
        // Fetch products
        const productRes = await fetch(`${API_BASE_URL}/api/products`);
        if (!productRes.ok) throw new Error(`Products API error: ${productRes.status}`);
        const productData = await productRes.json();
        setProducts(productData.products || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Test Page Error:', err);
        setError(err.message);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Categories ({categories.length})</h2>
          <div className="border rounded-lg p-4">
            {categories.length > 0 ? (
              <ul className="list-disc list-inside">
                {categories.map(category => (
                  <li key={category.id}>
                    {category.id}: {category.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No categories found</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-2">Products ({products.length})</h2>
          <div className="border rounded-lg p-4">
            {products.length > 0 ? (
              <ul className="list-disc list-inside">
                {products.map(product => (
                  <li key={product.id}>
                    {product.id}: {product.name} ({product.category_name})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No products found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
