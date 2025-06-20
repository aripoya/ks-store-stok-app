import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Simple Categories component that doesn't rely on any external services
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL from environment variables (with fallback)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  console.log('Categories using API URL:', API_BASE_URL);

  useEffect(() => {
    // Direct fetch implementation
    async function fetchCategories() {
      setLoading(true);
      try {
        // Simple fetch with correct API path
        console.log('Fetching from:', `${API_BASE_URL}/api/categories`);
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Categories data:', data);
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err.message || 'Failed to load categories');
        
        // Fallback hardcoded categories
        setCategories([
          { id: 1, name: 'Bakpia Klasik', description: 'Bakpia dengan rasa klasik khas Yogyakarta' },
          { id: 2, name: 'Bakpia Premium', description: 'Bakpia dengan bahan premium dan rasa istimewa' },
          { id: 3, name: 'Bakpia Spesial', description: 'Bakpia dengan varian rasa spesial' },
          { id: 4, name: 'Paket Oleh-oleh', description: 'Bakpia untuk oleh-oleh dan buah tangan' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Kategori Produk</h1>
        <p className="text-muted-foreground">
          Daftar kategori produk bakpia
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Memuat kategori...</p>
          ) : error ? (
            <div>
              <p className="text-red-500">Error: {error}</p>
              <p className="text-muted-foreground text-sm">Menggunakan data kategori lokal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="p-4 border rounded-md hover:bg-muted/50"
                >
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
