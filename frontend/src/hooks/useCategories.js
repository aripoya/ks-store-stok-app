import { useState, useEffect } from 'react';
// Import categoriesAPI directly to avoid potential 'global' issues
// import { categoriesAPI } from '../services/api';

// API base URL - Use localhost for development, production URL for deployment
// Log the environment variable to debug
console.log('Environment variables:', import.meta.env);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
console.log('Using API base URL:', API_BASE_URL);

/**
 * A hook for fetching and managing category data
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all categories directly (without using the API service)
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Direct fetch implementation instead of using the API service
      console.log('Fetching from:', `${API_BASE_URL}/api/categories`);
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to load categories');
      
      // Fallback to hardcoded categories in case of API error
      setCategories([
        { id: 1, name: 'Bakpia Klasik', description: 'Bakpia dengan rasa klasik khas Yogyakarta' },
        { id: 2, name: 'Bakpia Premium', description: 'Bakpia dengan bahan premium dan rasa istimewa' },
        { id: 3, name: 'Bakpia Spesial', description: 'Bakpia dengan varian rasa spesial' },
        { id: 4, name: 'Paket Oleh-oleh', description: 'Bakpia untuk oleh-oleh dan buah tangan' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: fetchCategories
  };
};

export default useCategories;
