import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';

export default function Products() {
  // Basic product loading
  const { 
    products, 
    loading: productsLoading, 
    error: productsError 
  } = useProducts();

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <p className="text-muted-foreground">Memuat produk...</p>
          ) : productsError ? (
            <div className="text-red-500">
              <p>Error: {productsError}</p>
              <p className="text-muted-foreground text-sm">Menggunakan data produk lokal</p>
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div>
              <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="border rounded-lg p-3 hover:bg-muted/50">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{product.name}</h3>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>Category: {product.category_name}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span>Harga: Rp {product.price?.toLocaleString() || 0}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span>Stok: {product.current_stock || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
