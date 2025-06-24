import { useState, useEffect } from 'react';
// Use the fixed API services instead of broken environment variable logic
import { productsAPI } from '../services/api';

/**
 * A very simple Products component to test API connectivity without the complexity
 * of the full Products page
 */
export default function SimpleProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiDetails, setApiDetails] = useState({
    url: '',
    responseStatus: '',
    responseHeaders: '',
    envVars: {}
  });

  useEffect(() => {
    async function fetchProducts() {
      console.log('🔍 SimpleProducts: Starting fetchProducts with proper API service...');
      setLoading(true);
      setError(null);

      try {
        // Use the fixed productsAPI service with pagination
        const response = await productsAPI.getAll({ page: 1, limit: 20 });
        console.log('✅ SimpleProducts: Products API success, received:', response?.data?.length || 0);
        
        if (response?.data && Array.isArray(response.data)) {
          setProducts(response.data);
        } else {
          console.log('⚠️ SimpleProducts: No products data returned, setting empty array');
          setProducts([]);
        }
      } catch (err) {
        console.error('❌ SimpleProducts: Products API error:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Simple Products Test</h1>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Simple Products Test</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Simple Products Test</h1>
      
      {/* API diagnostic information */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">API Diagnostics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium">Environment</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(apiDetails.envVars, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-medium">Request</h3>
            <p className="text-xs break-all bg-gray-100 p-2 rounded">{apiDetails.url}</p>
          </div>
          <div>
            <h3 className="font-medium">Response Status</h3>
            <p className="text-xs bg-gray-100 p-2 rounded">{apiDetails.responseStatus || 'No response received'}</p>
          </div>
          <div>
            <h3 className="font-medium">Response Headers</h3>
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {apiDetails.responseHeaders || 'No headers received'}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-lg">✅ Successfully loaded {products.length} products</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg bg-white shadow">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-2">Price: Rp {product.price?.toLocaleString('id-ID')}</p>
            <p className="text-sm text-gray-500">Stock: {product.stock || 0}</p>
            <p className="text-xs text-gray-400">ID: {product.id}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <p>✅ Using centralized API service from services/api.js</p>
        <p>✅ No more broken VITE_API_URL dependencies</p>
        <p>Total products: {products.length}</p>
      </div>
    </div>
  );
}
