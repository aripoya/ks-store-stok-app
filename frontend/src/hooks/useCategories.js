import { useState, useEffect } from 'react';
// Use the fixed API service instead of broken environment variable logic
import { categoriesAPI } from '../services/api';

/**
 * A hook for fetching and managing category data
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🎯 useCategories: Hook initialized - categories:', categories.length, 'loading:', loading);

  // Fallback categories data
  const fallbackCategories = [
    { id: 1, name: 'Bakpia Klasik', description: 'Bakpia dengan rasa klasik khas Yogyakarta' },
    { id: 2, name: 'Bakpia Premium', description: 'Bakpia dengan bahan premium dan rasa istimewa' },
    { id: 3, name: 'Bakpia Spesial', description: 'Bakpia dengan varian rasa spesial' },
    { id: 4, name: 'Paket Oleh-oleh', description: 'Bakpia untuk oleh-oleh dan buah tangan' },
  ];

  // Fetch all categories using proper API service
  const fetchCategories = async () => {
    console.log('🔍 useCategories: Starting fetchCategories with proper API service...');
    console.log('🔍 useCategories: Current window.location:', window.location.href);
    console.log('🔍 useCategories: Environment check - hostname:', window.location.hostname);
    
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 useCategories: Calling categoriesAPI.getAll()...');
      // Use the fixed categoriesAPI service instead of custom fetch logic
      const data = await categoriesAPI.getAll();
      console.log('✅ useCategories: API success, received data type:', typeof data, 'isArray:', Array.isArray(data));
      console.log('✅ useCategories: API success, received categories:', data?.length || 0, 'data:', data);
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log('✅ useCategories: Setting categories state with', data.length, 'items');
        setCategories(data);
        console.log('✅ useCategories: Categories state set successfully');
      } else {
        console.log('⚠️ useCategories: No data returned, using fallback categories');
        setCategories(fallbackCategories);
      }
    } catch (err) {
      console.error('❌ useCategories: API error, using fallback:', err);
      console.error('❌ useCategories: Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message);
      setCategories(fallbackCategories);
    } finally {
      console.log('🔍 useCategories: Setting loading to false');
      setLoading(false);
      console.log('🔍 useCategories: Loading set to false');
    }
  };

  // Load categories on component mount
  useEffect(() => {
    console.log('useCategories: useEffect triggered, calling fetchCategories');
    fetchCategories();
  }, []);

  // Debug log every state change
  useEffect(() => {
    console.log('🎯 useCategories: State update - categories:', categories.length, 'loading:', loading, 'error:', error);
  }, [categories, loading, error]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};

export default useCategories;
