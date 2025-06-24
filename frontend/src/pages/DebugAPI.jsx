import React, { useState, useEffect } from 'react';

/**
 * Debug page untuk test API connectivity di production
 */
export default function DebugAPI() {
  const [testResults, setTestResults] = useState({
    categories: null,
    products: null,
    error: null,
    logs: []
  });

  const addLog = (message) => {
    console.log(message);
    setTestResults(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()}: ${message}`]
    }));
  };

  const testAPI = async () => {
    addLog('🔍 Starting API test...');
    
    try {
      // Test current environment detection
      const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE_URL = isLocalDev 
        ? 'http://localhost:8787' 
        : 'https://bakpia-stok-api.wahwooh.workers.dev';
      
      addLog(`🌍 Environment detected: ${isLocalDev ? 'LOCAL' : 'PRODUCTION'}`);
      addLog(`🔗 API Base URL: ${API_BASE_URL}`);
      addLog(`🏠 Current hostname: ${window.location.hostname}`);

      // Test Categories API
      addLog('📁 Testing Categories API...');
      const categoriesResponse = await fetch(`${API_BASE_URL}/api/categories`);
      addLog(`📁 Categories response status: ${categoriesResponse.status}`);
      
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        addLog(`✅ Categories success: ${categoriesData?.length || 0} items`);
        setTestResults(prev => ({ ...prev, categories: categoriesData }));
      } else {
        const errorText = await categoriesResponse.text();
        addLog(`❌ Categories error: ${categoriesResponse.status} - ${errorText}`);
        setTestResults(prev => ({ ...prev, error: `Categories: ${errorText}` }));
      }

      // Test Products API
      addLog('📦 Testing Products API...');
      const productsResponse = await fetch(`${API_BASE_URL}/api/products?limit=5`);
      addLog(`📦 Products response status: ${productsResponse.status}`);
      
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        addLog(`✅ Products success: ${productsData?.products?.length || 0} items`);
        setTestResults(prev => ({ ...prev, products: productsData }));
      } else {
        const errorText = await productsResponse.text();
        addLog(`❌ Products error: ${productsResponse.status} - ${errorText}`);
        setTestResults(prev => ({ ...prev, error: prev.error ? `${prev.error}, Products: ${errorText}` : `Products: ${errorText}` }));
      }

    } catch (error) {
      addLog(`🚨 Network error: ${error.message}`);
      setTestResults(prev => ({ ...prev, error: error.message }));
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 API Debug Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📊 Test Results</h2>
          
          <div className="space-y-2">
            <div className={`p-3 rounded ${testResults.categories ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Categories:</strong> {testResults.categories?.length || 0} items
            </div>
            
            <div className={`p-3 rounded ${testResults.products ? 'bg-green-100' : 'bg-red-100'}`}>
              <strong>Products:</strong> {testResults.products?.products?.length || 0} items
            </div>
            
            {testResults.error && (
              <div className="p-3 bg-red-100 rounded">
                <strong>❌ Error:</strong> {testResults.error}
              </div>
            )}
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📝 Debug Logs</h2>
          
          <div className="max-h-64 overflow-y-auto text-sm font-mono">
            {testResults.logs.map((log, index) => (
              <div key={index} className="mb-1 text-gray-700">{log}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Raw Data */}
      {(testResults.categories || testResults.products) && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">📄 Raw API Data</h2>
          
          {testResults.categories && (
            <div className="mb-4">
              <h3 className="font-semibold">Categories (first 3):</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.categories.slice(0, 3), null, 2)}
              </pre>
            </div>
          )}
          
          {testResults.products && (
            <div>
              <h3 className="font-semibold">Products (first 2):</h3>
              <pre className="text-xs bg-white p-2 rounded overflow-x-auto">
                {JSON.stringify(testResults.products.products?.slice(0, 2), null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <button 
          onClick={testAPI}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          🔄 Run Test Again
        </button>
      </div>
    </div>
  );
}
