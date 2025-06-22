import { useState, useEffect } from 'react';
// Import categoriesAPI directly to avoid potential 'global' issues
// import { categoriesAPI } from '../services/api';

// Use the environment variable when available, otherwise use a relative path for local dev with proxy
// This ensures our code works in both development and production environments
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
console.log('useCategories: API_BASE_URL =', API_BASE_URL);

/**
 * A hook for fetching and managing category data
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fallback categories data
  const fallbackCategories = [
    { id: 1, name: 'Bakpia Klasik', description: 'Bakpia dengan rasa klasik khas Yogyakarta' },
    { id: 2, name: 'Bakpia Premium', description: 'Bakpia dengan bahan premium dan rasa istimewa' },
    { id: 3, name: 'Bakpia Spesial', description: 'Bakpia dengan varian rasa spesial' },
    { id: 4, name: 'Paket Oleh-oleh', description: 'Bakpia untuk oleh-oleh dan buah tangan' },
  ];

  // Fetch all categories directly (without using the API service)
  const fetchCategories = async () => {
    console.log('useCategories: Starting fetchCategories...');
    setLoading(true);
    setError(null);
    
    try {
      // Use the API_BASE_URL for proper path construction
      const url = `${API_BASE_URL}/api/categories`;
      console.log('useCategories: Fetching from URL:', url);
      const response = await fetch(url);
      console.log('useCategories: Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('useCategories: API data received:', data);
      setCategories(data);
    } catch (err) {
      console.error('useCategories: API failed, using fallback:', err);
      setError(err.message || 'Failed to load categories');
      
      // Set fallback categories when API fails
      console.log('useCategories: Setting fallback categories:', fallbackCategories);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
      console.log('useCategories: fetchCategories completed');
    }
  };

  // Load categories on component mount
  useEffect(() => {
    console.log('useCategories: useEffect triggered, calling fetchCategories');
    fetchCategories();
  }, []);

  // Debug current state
  useEffect(() => {
    console.log('useCategories: State update - categories:', categories, 'loading:', loading, 'error:', error);
  }, [categories, loading, error]);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};

export default useCategories;
