import { useState, useEffect, useCallback } from 'react';
import { stockAPI } from '../services/api';

/**
 * Hook for managing stock data and operations
 */
export function useStock(lowStockOnly = false) {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStock = useCallback(async () => {
    console.log('🔍 useStock: Starting fetchStock with proper API service...');
    setLoading(true);
    setError(null);

    try {
      // Use the fixed stockAPI service instead of custom fetch logic
      const data = await stockAPI.getAll(lowStockOnly);
      console.log('✅ useStock: API success, received stock items:', data?.length || 0);
      
      if (data && Array.isArray(data)) {
        setStock(data);
      } else {
        console.log('⚠️ useStock: No data returned, setting empty array');
        setStock([]);
      }
    } catch (err) {
      console.error('❌ useStock: API error:', err);
      setError(err.message);
      setStock([]);
    } finally {
      setLoading(false);
    }
  }, [lowStockOnly]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const addStock = async (productId, quantity, notes = '') => {
    try {
      // Use the fixed stockAPI service
      const response = await stockAPI.addStock(productId, quantity, notes);
      console.log('✅ useStock: Stock added successfully');
      
      // Refresh stock data after adding
      await fetchStock();
      return response;
    } catch (err) {
      console.error('❌ useStock: Failed to add stock:', err);
      throw err;
    }
  };

  const refresh = fetchStock;

  return {
    stock,
    loading,
    error,
    addStock,
    refresh
  };
}

/**
 * Hook for managing stock movements/history
 */
export function useStockMovements(productId = null, page = 1, limit = 20) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMovements = useCallback(async () => {
    console.log('🔍 useStockMovements: Starting fetchMovements with proper API service...');
    setLoading(true);
    setError(null);

    try {
      // Use the fixed stockAPI service
      const data = await stockAPI.getMovements(productId, page, limit);
      console.log('✅ useStockMovements: API success, received movements:', data?.length || 0);
      
      if (data && Array.isArray(data)) {
        setMovements(data);
      } else {
        console.log('⚠️ useStockMovements: No data returned, setting empty array');
        setMovements([]);
      }
    } catch (err) {
      console.error('❌ useStockMovements: API error:', err);
      setError(err.message);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, [productId, page, limit]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    refresh: fetchMovements
  };
}
