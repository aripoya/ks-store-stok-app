import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BarcodeGenerator from '@/components/BarcodeGenerator';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Package,
  Loader2,
  AlertTriangle,
  Barcode,
  QrCode
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsWorking() {
  // Test hooks one at a time to isolate crash
  const { toast } = useToast();
  
  const { categories, loading: categoriesLoading } = useCategories();
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  
  const { products, loading, error, pagination, setPage, setSearch, setCategoryId, fetchProducts, addProduct, updateProduct, deleteProduct, refresh } = useProducts({
    search: debouncedSearchTerm,
    categoryId: selectedCategoryId
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // CRUD Dialog State Management
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category_id: '',
    barcode: ''
  });

  // Handle Add Product
  const handleAddProduct = async () => {
    try {
      // Prepare data payload to match backend POST endpoint expectations
      const addPayload = {
        name: formData.name,
        price: formData.price ? parseInt(formData.price) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        barcode: formData.barcode || null,
        stock: formData.stock ? parseInt(formData.stock) : null,
        image_url: null // API requires this field
      };

      console.log('🚀 ADD PRODUCT PAYLOAD:', addPayload);
      
      // Use addProduct from useProducts hook for optimistic update
      await addProduct(addPayload);
      
      setShowAddDialog(false);
      setFormData({ name: '', price: '', stock: '', category_id: '', barcode: '' });
      
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
    } catch (error) {
      console.error('🚨 ADD PRODUCT ERROR:', error);
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  // Handle Edit Product
  const handleEditProduct = async () => {
    try {
      // Prepare data payload to match backend PUT endpoint expectations
      const updatePayload = {
        name: formData.name,
        price: formData.price ? parseInt(formData.price) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        barcode: formData.barcode || null,
        stock: formData.stock ? parseInt(formData.stock) : null,
        image_url: null // API requires this field
      };
      
      await updateProduct(selectedProduct.id, updatePayload);
      setShowEditDialog(false);
      setSelectedProduct(null);
      setFormData({ name: '', price: '', stock: '', category_id: '', barcode: '' });
      // Refresh products list to show updated product
      await refresh();
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } catch (error) {
      console.error('🚨 UPDATE ERROR:', error);
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      setShowDeleteDialog(false);
      setSelectedProduct(null);
      // Refresh products list to remove deleted product
      await refresh();
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  // Open Edit Dialog
  const openEditDialog = (product) => {
    console.log('🎯 EDIT BUTTON CLICKED!', product);
    console.log('🎯 Product data:', product);
    console.log('🎯 Setting showEditDialog to true');
    
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      price: product.price ? product.price.toString() : '',
      stock: product.stock ? product.stock.toString() : '',
      category_id: product.category_id ? product.category_id.toString() : '',
      barcode: product.barcode || ''
    });
    setShowEditDialog(true);
    
    console.log('🎯 Edit dialog state should now be open');
  };

  // Open Delete Dialog
  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700 self-start sm:self-auto" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={selectedCategoryId === null ? "default" : "outline"}
                size="sm" 
                onClick={() => setSelectedCategoryId(null)}
              >
                All
              </Button>
              {categories?.map((category) => (
                <Button 
                  key={category.id} 
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategoryId(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading products...</span>
          </div>
        ) : error ? (
          <div className="col-span-full flex justify-center items-center py-8 text-red-600">
            <AlertTriangle className="w-8 h-8 mr-2" />
            <span>Error: {error}</span>
          </div>
        ) : products && products.length > 0 ? (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {(() => {
                        // Ensure both IDs are numbers for proper comparison
                        const productCategoryId = parseInt(product.category_id);
                        const foundCategory = categories?.find(c => parseInt(c.id) === productCategoryId);
                        return foundCategory?.name || 'Unknown';
                      })()}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(product)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(product)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>

                <p className="text-lg font-semibold text-green-600">
                  Rp {product.price?.toLocaleString('id-ID') || '0'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Stock: {product.stock || 0}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col justify-center items-center py-12 text-gray-500">
            <Package className="w-16 h-16 mb-4" />
            <p className="text-lg">No products found</p>
            <p className="text-sm">Add your first product to get started</p>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 border-t pt-6">
        <div className="flex flex-col items-start">
          <p className="text-sm text-gray-500">
            Showing page {pagination?.page || 1} of {pagination?.totalPages || 1} 
            ({pagination?.total || 0} total products)
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Displaying products {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {/* Page size selector */}
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-500">Show:</span>
            <select 
              value={pagination.limit} 
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                // When changing page size, keep user on current data set as much as possible
                const currentStartItem = (pagination.page - 1) * pagination.limit + 1;
                const newPage = Math.max(1, Math.ceil(currentStartItem / newLimit));
                setLimit(newLimit);
                setPage(newPage);
              }}
              className="px-2 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            {/* First page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={!pagination || pagination.page <= 1}
            >
              <span className="sr-only">First Page</span>
              <span aria-hidden="true">«</span>
            </Button>
            
            {/* Previous button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(pagination.page - 1)}
              disabled={!pagination || pagination.page <= 1}
            >
              Previous
            </Button>
            
            {/* Page number buttons */}
            <div className="flex items-center gap-1 mx-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Show 2 pages before and after current page, adjusting for boundaries
                let pageNumbers = [];
                const totalPageButtons = Math.min(5, pagination.totalPages);
                
                if (pagination.totalPages <= totalPageButtons) {
                  // If we have 5 or fewer total pages, show all of them
                  pageNumbers = Array.from({ length: pagination.totalPages }, (_, i) => i + 1);
                } else if (pagination.page <= 3) {
                  // If we're near the start, show first 5 pages
                  pageNumbers = [1, 2, 3, 4, 5];
                } else if (pagination.page >= pagination.totalPages - 2) {
                  // If we're near the end, show last 5 pages
                  pageNumbers = Array.from(
                    { length: totalPageButtons }, 
                    (_, i) => pagination.totalPages - totalPageButtons + i + 1
                  );
                } else {
                  // Otherwise, show 2 before and 2 after current page
                  pageNumbers = [
                    pagination.page - 2,
                    pagination.page - 1,
                    pagination.page,
                    pagination.page + 1,
                    pagination.page + 2
                  ];
                }
                
                return pageNumbers.map(pageNum => (
                  <Button 
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    className={pageNum === pagination.page ? "bg-blue-600 hover:bg-blue-700" : ""}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                ));
              })}
            </div>
            
            {/* Next button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination || pagination.page >= pagination.totalPages}
            >
              Next
            </Button>
            
            {/* Last page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(pagination.totalPages)}
              disabled={!pagination || pagination.page >= pagination.totalPages}
            >
              <span className="sr-only">Last Page</span>
              <span aria-hidden="true">»</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Create a new product for your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name"
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Product name"
              />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input 
                id="price"
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                placeholder="Price in IDR"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input 
                id="stock"
                name="stock"
                type="number" 
                min="0"
                step="1"
                value={formData.stock || ''} 
                onChange={(e) => {
                  const value = e.target.value;
                  console.log('Stock input changed:', value);
                  setFormData({ ...formData, stock: value });
                }} 
                placeholder="Stock quantity"
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input 
                id="barcode"
                type="text" 
                value={formData.barcode} 
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} 
                placeholder="Product barcode"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select 
                id="category"
                value={formData.category_id} 
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Barcode and QR Code Tabs */}
          <div className="mt-6 col-span-1 md:col-span-2">
            <Tabs defaultValue="barcode" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="barcode"><Barcode className="h-4 w-4 mr-2" />Barcode</TabsTrigger>
                <TabsTrigger value="qrcode"><QrCode className="h-4 w-4 mr-2" />QR Code</TabsTrigger>
              </TabsList>
              <TabsContent value="barcode" className="border rounded-md p-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Product Barcode</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Generate and customize product barcode. Recommended format: EAN-13 for retail products.
                    </p>
                    <Input 
                      type="text" 
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Enter barcode or generate one"
                      className="mb-2"
                    />
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                    <BarcodeGenerator 
                      value={formData.barcode || 'SAMPLE'}
                      format="EAN13"
                      onChange={(newValue) => setFormData({ ...formData, barcode: newValue.value })}
                    />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="qrcode" className="border rounded-md p-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Product QR Code</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Generate QR code for this product. Contains product URL and details.
                    </p>
                    <div className="text-xs text-gray-500 mt-4">
                      <p>Note: Final QR code will be available after product creation</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center p-2 bg-white rounded-lg border">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://kurniasari-bakpia.com/product/${encodeURIComponent(formData.name || 'New Product')}`}
                      alt="QR Code Produk"
                      className="border border-gray-200 rounded-md w-32 h-32"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <DialogFooter className="mt-6 justify-end">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-4xl overflow-hidden">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name"
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Product name"
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Price</Label>
              <Input 
                id="edit-price"
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} 
                placeholder="Price in IDR"
              />
            </div>
            <div>
              <Label htmlFor="edit-stock">Stock Quantity</Label>
              <Input 
                id="edit-stock"
                name="stock"
                type="number" 
                min="0"
                step="1"
                value={formData.stock || ''} 
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                placeholder="Stock quantity"
                className="w-full"
                autoComplete="off"
              />
            </div>
            <div>
              <Label htmlFor="edit-barcode">Barcode</Label>
              <Input 
                id="edit-barcode"
                type="text" 
                value={formData.barcode} 
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} 
                placeholder="Product barcode"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <select 
                id="edit-category"
                value={formData.category_id} 
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabs for Barcode and QR Code with improved layout */}
          <div className="mt-6 border rounded-md">
            <Tabs defaultValue="barcode" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-t-md">
                <TabsTrigger value="barcode" className="text-sm font-medium">Barcode</TabsTrigger>
                <TabsTrigger value="qrcode" className="text-sm font-medium">QR Code</TabsTrigger>
              </TabsList>
              <TabsContent value="barcode" className="p-4 bg-white rounded-lg">
                <div className="mb-4">
                  <Label htmlFor="edit-barcode" className="text-sm font-medium">Kode Barcode</Label>
                  <Input
                    id="edit-barcode"
                    className="mt-1"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Masukkan kode barcode..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Masukkan kode barcode produk (opsional)</p>
                </div>
                
                {/* Barcode preview */}
                <div className="bg-slate-50 p-4 rounded-lg text-center border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-3">Preview Barcode</p>
                  <div className="flex justify-center mb-3">
                    <BarcodeGenerator value={formData.barcode || selectedProduct?.id?.toString() || ''} format="CODE128" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format CODE128 mendukung angka, huruf, dan simbol</p>
                  <p className="text-xs text-gray-400">Jika kosong, ID produk akan digunakan</p>
                </div>
              </TabsContent>
              <TabsContent value="qrcode" className="p-4 bg-white rounded-lg">
                <div className="mb-4">
                  <p className="text-sm font-medium">QR Code Otomatis</p>
                  <p className="text-xs text-gray-500 mt-1">QR Code dibuat otomatis berdasarkan ID produk dan URL toko</p>
                </div>
                
                {/* QR Code preview */}
                <div className="bg-slate-50 p-4 rounded-lg text-center border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-3">Preview QR Code</p>
                  <div className="flex justify-center mb-3">
                    {selectedProduct?.id ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedProduct.id}`}
                        alt="QR Code Produk"
                        className="border border-gray-200 rounded-md w-32 h-32"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-white border border-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-500">QR Code akan muncul setelah simpan</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">QR Code dapat digunakan untuk:</p>
                  <ul className="list-disc pl-5 mt-1 text-xs text-gray-500 text-left">
                    <li>Pemindaian inventaris cepat</li>
                    <li>Identifikasi produk</li>
                    <li>Pengecekan harga</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditProduct} className="bg-green-600 hover:bg-green-700">Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Product Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-red-600 hover:bg-red-700">
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Debug info - remove later */}
      <div className="mt-8 p-4 bg-gray-50 rounded text-xs">
        <p>Categories: {categories?.length || 0} | Products: {products?.length || 0} | Error: {error || 'None'}</p>
      </div>
    </div>
  );
}
