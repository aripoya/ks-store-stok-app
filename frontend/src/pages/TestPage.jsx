import { useState, useEffect } from 'react';
// Use the fixed API services instead of broken environment variable logic
import { productsAPI, categoriesAPI } from '../services/api';

/**
 * Simple test page to verify API connectivity and data rendering
 */
export default function TestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      console.log('🔍 TestPage: Starting fetchData with proper API services...');
      setLoading(true);
      setError(null);

      try {
        // Use the fixed API services
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll({ page: 1, limit: 5 })
        ]);

        console.log('✅ TestPage: API success - Categories:', categoriesResponse?.length || 0, 'Products:', productsResponse?.data?.length || 0);
        
        setData({
          categories: categoriesResponse || [],
          products: productsResponse?.data || [],
          totalProducts: productsResponse?.total || 0
        });
      } catch (err) {
        console.error('❌ TestPage: API error:', err);
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        <p>Loading test data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Test Page</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Test Page</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Categories Test</h2>
          <p className="mb-2">✅ Loaded {data?.categories?.length || 0} categories</p>
          <div className="space-y-2">
            {data?.categories?.slice(0, 3).map((category) => (
              <div key={category.id} className="p-2 bg-gray-50 rounded">
                {category.name}
              </div>
            ))}
            {data?.categories?.length > 3 && (
              <p className="text-sm text-gray-600">... and {data.categories.length - 3} more</p>
            )}
          </div>
        </div>

        <div className="p-4 border rounded-lg bg-white shadow">
          <h2 className="text-xl font-semibold mb-4">Products Test</h2>
          <p className="mb-2">✅ Loaded {data?.products?.length || 0} products (of {data?.totalProducts || 0} total)</p>
          <div className="space-y-2">
            {data?.products?.slice(0, 3).map((product) => (
              <div key={product.id} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-gray-600">Rp {product.price?.toLocaleString('id-ID')}</div>
              </div>
            ))}
            {data?.products?.length > 3 && (
              <p className="text-sm text-gray-600">... and {data.products.length - 3} more</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <p>✅ Using centralized API services from services/api.js</p>
        <p>✅ No more broken VITE_API_URL dependencies</p>
        <p>✅ Concurrent API calls with Promise.all</p>
        <p>Categories: {data?.categories?.length || 0} | Products: {data?.products?.length || 0}/{data?.totalProducts || 0}</p>
      </div>
    </div>
  );
}
