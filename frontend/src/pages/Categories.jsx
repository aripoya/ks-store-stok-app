import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Plus, Pencil, Trash, X, Check, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
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
} from '@/components/ui/alert-dialog'
import { categoriesAPI } from '../services/api';

// Categories component with CRUD functionality
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCategories() {
      console.log('🔍 Categories: Starting fetchCategories with proper API service...');
      setLoading(true);
      setError(null);

      try {
        // Use the fixed categoriesAPI service
        const data = await categoriesAPI.getAll();
        console.log('✅ Categories: API success, received categories:', data?.length || 0);
        
        if (data && Array.isArray(data)) {
          setCategories(data);
        } else {
          console.log('⚠️ Categories: No data returned, setting empty array');
          setCategories([]);
        }
      } catch (err) {
        console.error('❌ Categories: API error:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Create new category
  async function createCategory(formData) {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await categoriesAPI.create(formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast({
        title: "Sukses",
        description: "Kategori berhasil ditambahkan.",
      });

      // Reload categories
      await fetchCategories();

    } catch (err) {
      console.error('Create category error:', err);
      setFormError(err.message || 'Gagal menambahkan kategori');
    } finally {
      setFormLoading(false);
    }
  }

  // Update existing category
  async function updateCategory(id, formData) {
    setFormLoading(true);
    setFormError(null);
    try {
      const response = await categoriesAPI.update(id, formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast({
        title: "Sukses",
        description: "Kategori berhasil diperbarui.",
      });

      // Reload categories
      await fetchCategories();
      setEditingCategory(null);

    } catch (err) {
      console.error('Update category error:', err);
      setFormError(err.message || 'Gagal memperbarui kategori');
    } finally {
      setFormLoading(false);
    }
  }

  // Delete category
  async function deleteCategory(id) {
    setDeleteLoading(true);
    try {
      const response = await categoriesAPI.delete(id);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      toast({
        title: "Sukses",
        description: "Kategori berhasil dihapus.",
      });

      // Reload categories
      await fetchCategories();

    } catch (err) {
      console.error('Delete category error:', err);
      toast({
        variant: "destructive",
        title: "Gagal menghapus kategori",
        description: err.message || "Terjadi kesalahan saat menghapus kategori.",
      });
    } finally {
      setDeleteLoading(false);
      setCategoryToDelete(null);
    }
  }

  // Form handlers
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
    };
    
    if (editingCategory) {
      updateCategory(editingCategory.id, data);
    } else {
      createCategory(data);
      // Reset form after submission
      event.target.reset();
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setFormError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormError(null);
  };

  // Confirmation for category deletion
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kategori Produk</h1>
          <p className="text-muted-foreground">
            Kelola kategori produk bakpia
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus size={16} />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
              <DialogDescription>
                Tambahkan kategori produk baru ke sistem
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              {formError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2 mb-4">
                  <AlertCircle size={16} />
                  {formError}
                </div>
              )}
              
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Nama Kategori</label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Contoh: Bakpia Premium" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Deskripsi singkat kategori"
                  />
                </div>
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={formLoading}>
                  {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Memuat kategori...</span>
            </div>
          ) : error ? (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md">
              <p className="text-destructive font-medium">Error: {error}</p>
              <p className="text-muted-foreground text-sm">Menggunakan data kategori lokal</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  Belum ada kategori. Klik tombol "Tambah Kategori" untuk menambahkan kategori baru.
                </div>
              ) : (
                categories.map((category) => (
                  <div 
                    key={category.id}
                    className="p-4 border rounded-md hover:bg-muted/50 flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditClick(category)}
                          >
                            <Pencil size={14} className="mr-1" /> Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Kategori</DialogTitle>
                            <DialogDescription>
                              Ubah informasi kategori produk
                            </DialogDescription>
                          </DialogHeader>

                          <form onSubmit={handleSubmit}>
                            {formError && (
                              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2 mb-4">
                                <AlertCircle size={16} />
                                {formError}
                              </div>
                            )}
                            
                            <div className="space-y-4 py-2">
                              <div className="space-y-2">
                                <label htmlFor="edit-name" className="text-sm font-medium">Nama Kategori</label>
                                <Input 
                                  id="edit-name" 
                                  name="name" 
                                  defaultValue={editingCategory?.name}
                                  required 
                                />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="edit-description" className="text-sm font-medium">Deskripsi</label>
                                <Textarea 
                                  id="edit-description" 
                                  name="description" 
                                  defaultValue={editingCategory?.description}
                                />
                              </div>
                            </div>

                            <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={handleCancelEdit}
                                >
                                  Batal
                                </Button>
                              </DialogClose>
                              <Button type="submit" disabled={formLoading}>
                                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Simpan
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => confirmDelete(category)}
                          >
                            <Trash size={14} className="mr-1" /> Hapus
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Yakin ingin menghapus kategori ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Kategori "{categoryToDelete?.name}" akan dihapus permanen dari sistem. 
                              Produk yang terkait dengan kategori ini mungkin akan terpengaruh.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => deleteCategory(categoryToDelete?.id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
