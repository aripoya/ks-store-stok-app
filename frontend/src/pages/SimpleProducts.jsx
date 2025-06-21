import { useState, useEffect } from 'react';

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

  // Get API base URL from environment variable or fallback
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    // Show environment variables for debugging
    const envVars = {
      VITE_API_URL: import.meta.env.VITE_API_URL || 'not set',
      API_BASE_URL: API_BASE_URL,
      NODE_ENV: import.meta.env.MODE || 'unknown'
    };
    setApiDetails(prev => ({ ...prev, envVars }));
    
    const fetchProducts = async () => {
      try {
        const url = `${API_BASE_URL}/api/products`;
        setApiDetails(prev => ({ ...prev, url }));
        console.log('SimpleProducts: Fetching from', url);

        // Attempt the fetch with detailed error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors', // Try with explicit CORS mode
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Log response details
          const responseStatus = `${response.status} ${response.statusText}`;
          const responseHeaders = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });
          
          setApiDetails(prev => ({ 
            ...prev, 
            responseStatus, 
            responseHeaders: JSON.stringify(responseHeaders, null, 2)
          }));
          
          console.log('SimpleProducts: Response status:', responseStatus);
          console.log('SimpleProducts: Response headers:', responseHeaders);

          if (!response.ok) {
            // Try to parse error response if possible
            try {
              const errorData = await response.json();
              throw new Error(`API Error ${response.status}: ${errorData.error || errorData.message || response.statusText}`);
            } catch (parseErr) {
              throw new Error(`API Error ${response.status}: ${response.statusText}`);
            }
          }
          
          const data = await response.json();
          console.log('SimpleProducts: Received data', data);
          
          if (data && Array.isArray(data.products)) {
            setProducts(data.products);
          } else if (Array.isArray(data)) {
            // Handle case where API returns array directly
            setProducts(data);
          } else {
            throw new Error('Invalid data format: Expected products array');
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
        console.error('SimpleProducts: Error fetching products', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [API_BASE_URL]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Simple Products Test</h1>
      
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
      
      {/* Loading state */}
      {loading && (
        <div className="p-4 border rounded bg-blue-50 text-blue-700 mb-4">
          <p className="font-medium">Loading products from API...</p>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="p-4 border rounded bg-red-50 text-red-700 mb-4">
          <h3 className="font-medium">API Error</h3>
          <p>{error}</p>
        </div>
      )}
      
      {/* Products display */}
      {!loading && !error && (
        <div>
          <div className="p-4 border rounded bg-green-50 text-green-700 mb-4">
            <p className="font-medium">Successfully loaded {products.length} products</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(product => (
              <div key={product.id} className="border p-4 rounded-md hover:shadow transition-shadow">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">Category: {product.category_name}</p>
                <p className="text-sm">Price: Rp {product.price.toLocaleString()}</p>
                <p className="text-sm">Stock: {product.current_stock || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
