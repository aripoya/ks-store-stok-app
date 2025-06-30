import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Separator } from '../components/ui/separator'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Scan, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  DollarSign,
  Smartphone
} from 'lucide-react'
import KeyboardBarcodeScanner from '../components/KeyboardBarcodeScanner'

const POS = () => {
  // State Management
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [cashAmount, setCashAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load products on component mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts([])
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode?.includes(searchTerm)
      )
      setFilteredProducts(filtered.slice(0, 5)) // Limit to 5 results
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data = await response.json()
      setProducts(data.products || data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Gagal memuat produk')
    } finally {
      setLoading(false)
    }
  }

  const handleBarcodeDetected = (barcode) => {
    console.log('Barcode detected in POS:', barcode)
    
    // Find product by barcode
    const product = products.find(p => p.barcode === barcode)
    
    if (product) {
      addToCart(product)
      toast.success(`Produk ditambahkan: ${product.name}`)
    } else {
      // Try to add to search if no exact match
      setSearchTerm(barcode)
      toast.warning(`Barcode ${barcode} tidak ditemukan. Coba cari manual.`)
    }
  }

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
    
    // Clear search after adding
    setSearchTerm('')
    setFilteredProducts([])
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCashAmount('')
  }

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + tax

  // Calculate change for cash payments
  const cashAmountNum = parseFloat(cashAmount) || 0
  const change = paymentMethod === 'cash' ? Math.max(0, cashAmountNum - total) : 0

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong!');
      return;
    }

    if (paymentMethod === 'cash' && cashAmountNum < total) {
      toast.error('Jumlah uang tunai tidak mencukupi!');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Memproses transaksi...');

    const transactionPayload = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      payment_method: paymentMethod,
      notes: `Pembayaran via ${paymentMethod}`,
    };

    try {
      const response = await fetch('http://localhost:8080/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add Authorization header when auth is re-enabled
        },
        body: JSON.stringify(transactionPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal memproses transaksi.');
      }

      toast.success(`Transaksi berhasil! Kode: ${data.transactionCode}`, {
        id: toastId,
      });
      
      clearCart();

    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat sistem kasir...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistem Kasir (POS)</h1>
        <p className="text-muted-foreground">Scan barcode atau cari produk untuk memulai transaksi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Scanner */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Scanner Barcode
              </CardTitle>
              <CardDescription>
                Scanner siap menerima input dari barcode scanner Anda.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyboardBarcodeScanner
                onScan={handleBarcodeDetected}
                isActive={true}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Klik di mana saja pada halaman ini untuk memastikan scanner aktif, lalu mulai scan.
              </p>
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Cari Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Ketik nama produk atau barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filteredProducts.length > 0 && (
                <div className="mt-4 space-y-2">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <Button size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart & Checkout */}
        <div className="space-y-6">
          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Keranjang Belanja
                {cart.length > 0 && (
                  <Badge variant="secondary">{cart.length}</Badge>
                )}
              </CardTitle>
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCart}
                  className="self-start"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Kosongkan
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Keranjang masih kosong
                </p>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFromCart(item.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Checkout */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Method */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Metode Pembayaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                      className="text-xs"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Tunai
                    </Button>
                    <Button
                      size="sm"
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className="text-xs"
                    >
                      <CreditCard className="h-3 w-3 mr-1" />
                      Kartu
                    </Button>
                    <Button
                      size="sm"
                      variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('digital')}
                      className="text-xs"
                    >
                      <Smartphone className="h-3 w-3 mr-1" />
                      Digital
                    </Button>
                  </div>
                </div>

                {/* Cash Amount Input */}
                {paymentMethod === 'cash' && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Jumlah Uang Diterima</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                    />
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pajak (10%):</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  
                  {paymentMethod === 'cash' && cashAmountNum > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>Uang Diterima:</span>
                        <span>{formatCurrency(cashAmountNum)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Kembalian:</span>
                        <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(change)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full" 
                  size="lg"
                  disabled={(paymentMethod === 'cash' && cashAmountNum < total) || isSubmitting}
                >
                  {isSubmitting ? 'Memproses...' : 'Selesaikan Transaksi'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default POS
