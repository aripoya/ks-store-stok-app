import React, { useEffect } from 'react';

export default function Test() {
  useEffect(() => {
    console.log('Test page loaded successfully');
  }, []);

  return (
    <div className="p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to verify that React and routing are working correctly.</p>
      <div className="p-4 bg-green-100 border border-green-400 rounded">
        If you can see this page, the React application is loading correctly!
      </div>
    </div>
  );
}
