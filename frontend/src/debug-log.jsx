import { useState, useEffect } from 'react';
// Use the fixed API services instead of broken environment variable logic
import { categoriesAPI } from './services/api';

/**
 * Debug component for API testing - should be removed from production builds
 * This component is for development debugging only
 */
export default function DebugLog() {
  const [logs, setLogs] = useState([]);
  const [apiTest, setApiTest] = useState({ loading: false, result: null, error: null });

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { message, type, timestamp }]);
  };

  // Test backend connection using proper API service
  const testBackendConnection = async () => {
    console.log('🔍 DebugLog: Testing backend connection with proper API service...');
    setApiTest({ loading: true, result: null, error: null });
    addLog('🔍 Testing backend connection with proper API service...', 'info');

    try {
      // Use the fixed categoriesAPI service
      const data = await categoriesAPI.getAll();
      console.log('✅ DebugLog: API success, received categories:', data?.length || 0);
      
      const result = {
        success: true,
        categoriesCount: data?.length || 0,
        sampleCategory: data?.[0]?.name || 'N/A'
      };
      
      setApiTest({ loading: false, result, error: null });
      addLog(`✅ Backend connection successful! Categories: ${result.categoriesCount}`, 'success');
    } catch (err) {
      console.error('❌ DebugLog: API error:', err);
      setApiTest({ loading: false, result: null, error: err.message });
      addLog(`❌ Backend connection failed: ${err.message}`, 'error');
    }
  };

  useEffect(() => {
    addLog('🚀 DebugLog component mounted (development only)', 'info');
    addLog('✅ Using centralized API services from services/api.js', 'success');
    addLog('✅ No more broken VITE_API_URL dependencies', 'success');
  }, []);

  // Don't render in production - use safer check to avoid runtime crash
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden z-50">
      <div className="bg-gray-100 px-3 py-2 border-b">
        <h3 className="text-sm font-semibold">Debug Log (Dev Only)</h3>
      </div>
      
      <div className="p-3">
        <button
          onClick={testBackendConnection}
          disabled={apiTest.loading}
          className="w-full mb-3 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {apiTest.loading ? 'Testing...' : 'Test Backend Connection'}
        </button>
        
        {apiTest.result && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
            <p>✅ Categories: {apiTest.result.categoriesCount}</p>
            <p>Sample: {apiTest.result.sampleCategory}</p>
          </div>
        )}
        
        {apiTest.error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm">
            <p className="text-red-600">❌ Error: {apiTest.error}</p>
          </div>
        )}
        
        <div className="max-h-40 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className={`text-xs mb-1 ${
              log.type === 'error' ? 'text-red-600' : 
              log.type === 'success' ? 'text-green-600' : 
              'text-gray-600'
            }`}>
              <span className="text-gray-400">{log.timestamp}</span> {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
