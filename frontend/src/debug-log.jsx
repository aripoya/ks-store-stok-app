import React, { useEffect } from 'react';

/**
 * Component to debug API connections and responses
 */
export default function DebugLog() {
  useEffect(() => {
    // Log environment variables
    console.log('=== DEBUG LOG START ===');
    console.log('Environment Variables:', {
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      VITE_API_URL: import.meta.env.VITE_API_URL,
    });
    
    // Test Backend API connection
    const testBackendConnection = async () => {
      console.log('Testing backend connection...');
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
        console.log('Using API URL:', API_BASE_URL);
        
        // Test categories endpoint
        console.log('Testing categories endpoint...');
        try {
          const categoryResponse = await fetch(`${API_BASE_URL}/api/categories`, {
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
          });
          console.log('Categories Response Status:', categoryResponse.status, categoryResponse.statusText);
          console.log('Categories Response Headers:', Object.fromEntries([...categoryResponse.headers]));
          
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            console.log('Categories API Response Data:', categoryData);
          } else {
            console.error('Categories API Error Response:', await categoryResponse.text());
          }
        } catch (catError) {
          console.error('Categories API Connection Error:', catError);
        }
        
        // Test products endpoint
        console.log('Testing products endpoint...');
        try {
          const productResponse = await fetch(`${API_BASE_URL}/api/products`, {
            headers: { 'Accept': 'application/json' },
            mode: 'cors'
          });
          console.log('Products Response Status:', productResponse.status, productResponse.statusText);
          console.log('Products Response Headers:', Object.fromEntries([...productResponse.headers]));
          
          if (productResponse.ok) {
            const productData = await productResponse.json();
            console.log('Products API Response Data:', productData);
          } else {
            console.error('Products API Error Response:', await productResponse.text());
          }
        } catch (prodError) {
          console.error('Products API Connection Error:', prodError);
        }
        
        console.log('All API tests complete');
      } catch (error) {
        console.error('General API Testing Error:', error);
      }
      console.log('=== DEBUG LOG END ===');
    };
    
    // Run tests with a slight delay to allow React to render
    setTimeout(testBackendConnection, 1000);
    
    // Also test useProducts hook data flow
    console.log('Registering network request interceptor for debugging...');
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      const url = args[0];
      console.log(`🔍 Intercepted fetch request to: ${url}`);
      const result = await originalFetch.apply(this, args);
      console.log(`✅ Fetch response from ${url}: ${result.status} ${result.statusText}`);
      return result;
    };
    
    // Cleanup interceptor when component unmounts
    return () => {
      window.fetch = originalFetch;
      console.log('Removed network request interceptor');
    };
  }, []);
  
  return null; // This component doesn't render anything
}
