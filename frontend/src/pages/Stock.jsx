import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Plus, Package, TrendingUp, History } from 'lucide-react'
import { useStock, useStockMovements } from '../hooks/useStock'
import { useToast } from '@/components/ui/use-toast'

export default function Stock() {
  const { stock, loading, error, refetch, addStock } = useStock()
  const { movements } = useStockMovements(null, 1, 10)
  const { toast } = useToast()
  
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [addStockForm, setAddStockForm] = useState({
    productId: '',
    quantity: '',
    notes: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displayStock = showLowStockOnly 
    ? stock.filter(item => item.current_stock <= item.min_stock)
    : stock

  const lowStockCount = stock.filter(item => item.current_stock <= item.min_stock).length

  const handleAddStock = async (e) => {
    e.preventDefault()
    
    if (!addStockForm.productId || !addStockForm.quantity) {
      toast('Error', 'Product and quantity are required', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await addStock(
        parseInt(addStockForm.productId),
        parseInt(addStockForm.quantity),
        addStockForm.notes
      )
      
      toast('Success', 'Stock added successfully!', 'success')
      setAddStockForm({ productId: '', quantity: '', notes: '' })
      setShowAddForm(false)
    } catch (err) {
      toast('Error', `Failed to add stock: ${err.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStockStatus = (item) => {
    if (item.current_stock === 0) return { label: 'Habis', variant: 'destructive' }
    if (item.current_stock <= item.min_stock) return { label: 'Stok Rendah', variant: 'secondary' }
    return { label: 'Normal', variant: 'default' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Stok</h1>
          <p className="text-muted-foreground">Monitor dan kelola stok produk</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Stok</h1>
          <p className="text-muted-foreground">Monitor dan kelola stok produk</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gagal Memuat Data Stok</h3>
              <p className="text-muted-foreground mb-4">Error: {error}</p>
              <Button onClick={refetch}>Coba Lagi</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Stok</h1>
          <p className="text-muted-foreground">Monitor dan kelola stok produk secara real-time</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Stok
        </Button>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Produk</p>
                <p className="text-2xl font-bold">{stock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Stok Rendah</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Stok</p>
                <p className="text-2xl font-bold">
                  {stock.reduce((sum, item) => sum + item.current_stock, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Peringatan: {lowStockCount} produk memiliki stok rendah atau habis!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Stock Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Stok</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Produk</label>
                  <select
                    value={addStockForm.productId}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, productId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Pilih Produk</option>
                    {stock.map(item => (
                      <option key={item.product_id} value={item.product_id}>
                        {item.product_name} (Stok: {item.current_stock})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Jumlah</label>
                  <Input
                    type="number"
                    min="1"
                    value={addStockForm.quantity}
                    onChange={(e) => setAddStockForm(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="Masukkan jumlah"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Catatan (Opsional)</label>
                <Textarea
                  value={addStockForm.notes}
                  onChange={(e) => setAddStockForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan tambahan..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Menambah...' : 'Tambah Stok'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Stok Produk</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={showLowStockOnly ? "outline" : "default"}
                size="sm"
                onClick={() => setShowLowStockOnly(false)}
              >
                Semua
              </Button>
              <Button
                variant={showLowStockOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLowStockOnly(true)}
              >
                Stok Rendah ({lowStockCount})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Produk</th>
                  <th className="text-left py-3 px-4 font-medium">Kategori</th>
                  <th className="text-left py-3 px-4 font-medium">Harga</th>
                  <th className="text-left py-3 px-4 font-medium">Stok Saat Ini</th>
                  <th className="text-left py-3 px-4 font-medium">Min. Stok</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Terakhir Update</th>
                </tr>
              </thead>
              <tbody>
                {displayStock.map((item) => {
                  const status = getStockStatus(item)
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.product_name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.category_name}</td>
                      <td className="py-3 px-4">{formatCurrency(item.price)}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${item.current_stock === 0 ? 'text-red-600' : item.current_stock <= item.min_stock ? 'text-orange-600' : 'text-green-600'}`}>
                          {item.current_stock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{item.min_stock}</td>
                      <td className="py-3 px-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">
                        {formatDate(item.last_updated)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {displayStock.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {showLowStockOnly ? 'Tidak ada produk dengan stok rendah' : 'Tidak ada data stok'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Stock Movements */}
      {movements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Riwayat Pergerakan Stok Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movements.slice(0, 5).map((movement) => (
                <div key={movement.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{movement.product_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {movement.movement_type === 'in' ? '+' : '-'}{movement.quantity} • {movement.notes || 'Tanpa catatan'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDate(movement.movement_date)}</p>
                    <p className="text-xs text-muted-foreground">{movement.user_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
