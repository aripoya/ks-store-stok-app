import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Plus, Search } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
import { useState, useEffect } from 'react'
import NonBakpiaCategories from '@/components/products/NonBakpiaCategories'

export default function Products() {
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch products with the useProducts hook
  const { 
    products, 
    loading: productsLoading, 
    error: productsError,
    pagination,
    setPage, // Add the correct page setter function
    setLimit // Add the limit setter function
  } = useProducts({ 
    categoryId: selectedCategory,
    search: searchTerm
  });

  // Debug output
  console.log('Products component state:', {
    selectedCategory,
    searchTerm,
    productsCount: products?.length,
    isLoading: productsLoading,
    error: productsError,
    paginationInfo: pagination
  });
  
  // Reset page to 1 when category or search changes
  useEffect(() => {
    console.log('Category or search changed, resetting to page 1');
    if (setPage) {
      setPage(1);
    }
  }, [selectedCategory, searchTerm, setPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Produk</h1>
        <p className="text-muted-foreground">
          Kelola produk bakpia dan kategori
        </p>
      </div>

      {/* Bakpia Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Produk Bakpia</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <p className="text-muted-foreground">Memuat kategori...</p>
          ) : categoriesError ? (
            <div className="text-red-500">
              <p>Error: {categoriesError}</p>
              <p className="text-muted-foreground text-sm">Menggunakan data kategori lokal</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {/* Filter to show only Bakpia categories (ids 1-4) */}
              {categories
                .filter(category => category.id <= 4)
                .map((category) => (
                  <Badge 
                    key={category.id} 
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    className="text-sm py-1 px-3 cursor-pointer hover:bg-muted"
                    onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                  >
                    {category.name}
                  </Badge>
                ))
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Non-Bakpia Categories Tabs */}
      {!categoriesLoading && !categoriesError && (
        <NonBakpiaCategories 
          categories={categories} 
          onSelectCategory={(category) => setSelectedCategory(category.id === selectedCategory ? null : category.id)} 
        />
      )}

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Produk</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Cari produk..."
                className="pl-8 h-8 rounded-md border border-input bg-background text-sm ring-offset-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" className="h-8">
              <Plus className="mr-1 h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedCategory ? (
            <p className="flex items-center text-muted-foreground mb-4">
              <Package className="mr-2 h-4 w-4" />
              Menampilkan produk untuk kategori: {categories.find(c => c.id === selectedCategory)?.name || ''}              
            </p>
          ) : (
            <p className="flex items-center text-muted-foreground mb-4">
              <Package className="mr-2 h-4 w-4" />
              {searchTerm ? `Hasil pencarian untuk: ${searchTerm}` : 'Semua produk'}
            </p>
          )}
          
          {productsLoading ? (
            <p className="text-muted-foreground">Memuat produk...</p>
          ) : productsError ? (
            <div className="text-red-500">
              <p>Error: {productsError}</p>
              <p className="text-muted-foreground text-sm">Menggunakan data produk lokal</p>
            </div>
          ) : !products || products.length === 0 ? (
            <div>
              <p className="text-muted-foreground">Tidak ada produk yang ditemukan</p>
              <p className="text-sm text-muted-foreground mt-2">Coba pilih kategori lain atau ubah kriteria pencarian</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg p-3 hover:bg-muted/50">
                    <h3 className="font-medium">{product.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Badge variant="outline" className="mr-2">{product.category_name}</Badge>
                      <span>Rp {product.price.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className={`${product.current_stock > 20 ? 'text-green-600' : product.current_stock > 5 ? 'text-amber-600' : 'text-red-600'}`}>
                        Stok: {product.current_stock}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {pagination && pagination.totalPages > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Menampilkan {products.length} dari {pagination.total || products.length} produk
                  </p>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={pagination.page <= 1}
                      onClick={() => setPage && setPage(pagination.page - 1)}
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-2 py-1 text-sm">
                      Halaman {pagination.page} dari {pagination.totalPages || 1}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={!pagination.totalPages || pagination.page >= pagination.totalPages}
                      onClick={() => setPage && setPage(pagination.page + 1)}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

