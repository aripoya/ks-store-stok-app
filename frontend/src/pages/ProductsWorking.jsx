import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertTriangle
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
  
  const { products, loading, error, pagination, setPage, setSearch, setCategoryId, fetchProducts, addProduct, updateProduct, deleteProduct } = useProducts({
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
    description: '',
    price: '',
    stock: '',
    category_id: ''
  });

  // Handle Add Product
  const handleAddProduct = async () => {
    try {
      await addProduct(formData);
      setShowAddDialog(false);
      setFormData({ name: '', description: '', price: '', stock: '', category_id: '' });
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
    } catch (error) {
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
      await updateProduct(selectedProduct.id, formData);
      setShowEditDialog(false);
      setSelectedProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '', category_id: '' });
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } catch (error) {
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
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id.toString()
    });
    setShowEditDialog(true);
  };

  // Open Delete Dialog
  const openDeleteDialog = (product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search products..."
                className="w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
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
                      {categories?.find(c => c.id === product.category_id)?.name || 'Unknown'}
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
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
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

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <p className="text-sm text-gray-500">
          Showing page {pagination?.page || 1} of {pagination?.totalPages || 1} 
          ({pagination?.total || 0} total products)
        </p>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(pagination.page - 1)}
            disabled={!pagination || pagination.page <= 1}
          >
            Previous
          </Button>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            Page {pagination?.page || 1}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setPage(pagination.page + 1)}
            disabled={!pagination || pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Create a new product for your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Product description"
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
                type="number" 
                value={formData.stock} 
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                placeholder="Stock quantity"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Product description"
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
              <Label htmlFor="edit-stock">Stock</Label>
              <Input 
                id="edit-stock"
                type="number" 
                value={formData.stock} 
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })} 
                placeholder="Stock quantity"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditProduct}>Update Product</Button>
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
