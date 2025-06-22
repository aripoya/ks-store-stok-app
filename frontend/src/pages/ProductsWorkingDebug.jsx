import React from 'react';

export default function ProductsWorkingDebug() {
  console.log('🔍 ProductsWorkingDebug component starting to render...');
  
  console.log('🔍 ProductsWorkingDebug component about to return JSX...');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">ProductsWorking Debug</h1>
      <p>Component is mounting successfully!</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
