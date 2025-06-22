import { useState, useEffect } from 'react';

export function useProductsSimple() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('useProductsSimple: Fetching products...');
        const response = await fetch('http://localhost:8080/api/products');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('useProductsSimple: Products data received:', data);
        
        setProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error('useProductsSimple: Error fetching products:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error
  };
}
