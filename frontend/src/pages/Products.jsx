import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Package, 
  Search, 
  Loader2, 
  AlertCircle,
  Plus,
  Pencil,
  Trash
} from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useProductsSimple } from '@/hooks/useProductsSimple';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Products() {
  const { toast } = useToast();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Product form state
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    initial_stock: 10
  });
  
  // Edit product state
  const [editProductOpen, setEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Delete product state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  
  // Products with filtering - using simple hook for debugging
  const { 
    products, 
    loading: productsLoading, 
    error: productsError
  } = useProductsSimple();

  // Debug logging
  console.log('Products component state:', {
    products,
    productsLoading,
    productsError,
    productsLength: products?.length,
    isArray: Array.isArray(products)
  });

  return (
    <div className="container py-4 px-4 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-col gap-4 pb-4">
          {/* Title and Add Button Row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Daftar Produk</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Kelola produk bakpia Anda</p>
            </div>
            
            <Button 
              size="sm" 
              className="w-full sm:w-auto"
              onClick={() => setAddProductOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
          
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari produk..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Category filter */}
            <div className="w-full sm:w-[200px]">
              <Select 
                value={selectedCategory || ''} 
                onValueChange={(value) => setSelectedCategory(value ? parseInt(value) : null)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Semua kategori</SelectItem>
                  {!categoriesLoading && categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {productsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Memuat produk...</p>
              </div>
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <div className="text-red-500">
                <p className="font-medium">Error: {productsError}</p>
                <p className="text-muted-foreground text-sm mt-1">Menggunakan data produk lokal</p>
              </div>
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">Tidak ada produk yang ditemukan</p>
              <p className="text-muted-foreground text-sm mt-1">Mulai dengan menambahkan produk baru</p>
            </div>
          ) : (
            <div>
              {/* Product Count */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {products.length} produk
                </p>
              </div>
              
              {/* Product Grid - Enhanced Mobile Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <div key={product.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    {/* Product Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-medium text-base leading-tight truncate">{product.name}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {product.category_name}
                        </Badge>
                      </div>
                      
                      {/* Action Buttons - Improved Mobile Layout */}
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => {
                            setEditingProduct(product);
                            setEditProductOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setDeletingProduct(product);
                            setDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Product Price */}
                    <div className="mb-3">
                      <span className="text-lg font-semibold text-green-600">
                        Rp {product.price?.toLocaleString() || 0}
                      </span>
                    </div>
                    
                    {/* Stock Information - Enhanced Mobile Display */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Stok: </span>
                        <span className={`font-medium ${
                          (product.current_stock || 0) > 20 
                            ? 'text-green-600' 
                            : (product.current_stock || 0) > 5 
                            ? 'text-amber-600' 
                            : 'text-red-600'
                        }`}>
                          {product.current_stock || 0}
                        </span>
                      </div>
                      
                      {/* Stock Status Badge */}
                      {(product.current_stock || 0) <= 5 && (
                        <Badge variant="destructive" className="text-xs">
                          Stok Rendah
                        </Badge>
                      )}
                    </div>
                    
                    {/* Product Description - Show on larger screens */}
                    {product.description && (
                      <div className="mt-3 hidden sm:block">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add Product Dialog */}
      <Dialog open={addProductOpen} onOpenChange={setAddProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Produk Baru</DialogTitle>
            <DialogDescription>
              Tambahkan produk baru dengan mengisi form berikut.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                Nama
              </label>
              <Input
                id="name"
                placeholder="Nama produk"
                className="col-span-3"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium">
                Kategori
              </label>
              <Select
                value={newProduct.category_id}
                onValueChange={(value) => setNewProduct({ ...newProduct, category_id: value })}
                className="col-span-3"
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {!categoriesLoading && categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="price" className="text-right text-sm font-medium">
                Harga (Rp)
              </label>
              <Input
                id="price"
                type="number"
                placeholder="Harga produk"
                className="col-span-3"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="stock" className="text-right text-sm font-medium">
                Stok Awal
              </label>
              <Input
                id="stock"
                type="number"
                placeholder="Stok awal"
                className="col-span-3"
                value={newProduct.initial_stock}
                onChange={(e) => setNewProduct({ ...newProduct, initial_stock: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium">
                Deskripsi
              </label>
              <Textarea
                id="description"
                placeholder="Deskripsi produk"
                className="col-span-3"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  // Validate input
                  if (!newProduct.name) {
                    toast({
                      title: "Input tidak valid",
                      description: "Nama produk wajib diisi",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (!newProduct.category_id) {
                    toast({
                      title: "Input tidak valid",
                      description: "Kategori produk wajib dipilih",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  await addProduct({
                    ...newProduct,
                    category_id: parseInt(newProduct.category_id)
                  });
                  
                  toast({
                    title: "Berhasil menambahkan produk baru",
                    description: `${newProduct.name} telah ditambahkan ke database`,
                  });
                  
                  // Reset form and close dialog
                  setNewProduct({
                    name: '',
                    description: '',
                    price: 0,
                    category_id: '',
                    initial_stock: 10
                  });
                  setAddProductOpen(false);
                  
                  // Refresh product list
                  refresh();
                } catch (error) {
                  console.error('Error adding product:', error);
                  toast({
                    title: "Gagal menambahkan produk",
                    description: error.message || "Terjadi kesalahan saat menambahkan produk",
                    variant: "destructive"
                  });
                }
              }}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Product Dialog */}
      <Dialog open={editProductOpen} onOpenChange={setEditProductOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
            <DialogDescription>
              Edit informasi produk "{editingProduct?.name}"
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-name" className="text-right text-sm font-medium">
                  Nama
                </label>
                <Input
                  id="edit-name"
                  placeholder="Nama produk"
                  className="col-span-3"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-category" className="text-right text-sm font-medium">
                  Kategori
                </label>
                <Select
                  value={editingProduct.category_id?.toString()}
                  onValueChange={(value) => setEditingProduct({ ...editingProduct, category_id: parseInt(value) })}
                  className="col-span-3"
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {!categoriesLoading && categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-price" className="text-right text-sm font-medium">
                  Harga (Rp)
                </label>
                <Input
                  id="edit-price"
                  type="number"
                  placeholder="Harga produk"
                  className="col-span-3"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="edit-description" className="text-right text-sm font-medium">
                  Deskripsi
                </label>
                <Textarea
                  id="edit-description"
                  placeholder="Deskripsi produk"
                  className="col-span-3"
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  // Validate input
                  if (!editingProduct.name) {
                    toast({
                      title: "Input tidak valid",
                      description: "Nama produk wajib diisi",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  if (!editingProduct.category_id) {
                    toast({
                      title: "Input tidak valid",
                      description: "Kategori produk wajib dipilih",
                      variant: "destructive"
                    });
                    return;
                  }
                  
                  await updateProduct(editingProduct.id, editingProduct);
                  
                  toast({
                    title: "Berhasil mengubah produk",
                    description: `${editingProduct.name} telah diperbarui`,
                  });
                  
                  // Close dialog
                  setEditProductOpen(false);
                  setEditingProduct(null);
                  
                  // Refresh product list
                  refresh();
                } catch (error) {
                  console.error('Error updating product:', error);
                  toast({
                    title: "Gagal mengubah produk",
                    description: error.message || "Terjadi kesalahan saat mengubah produk",
                    variant: "destructive"
                  });
                }
              }}
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus produk "{deletingProduct?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProduct(null)}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={async () => {
                if (!deletingProduct) return;
                
                try {
                  await deleteProduct(deletingProduct.id);
                  
                  toast({
                    title: "Berhasil menghapus produk",
                    description: `${deletingProduct.name} telah dihapus`,
                  });
                  
                  // Reset state and close dialog
                  setDeletingProduct(null);
                  setDeleteConfirmOpen(false);
                  
                  // Refresh product list
                  refresh();
                } catch (error) {
                  console.error('Error deleting product:', error);
                  toast({
                    title: "Gagal menghapus produk",
                    description: error.message || "Terjadi kesalahan saat menghapus produk",
                    variant: "destructive"
                  });
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
