import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KeyboardBarcodeScanner from '../components/KeyboardBarcodeScanner'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Label } from '../components/ui/label'
import { useToast } from '../components/ui/use-toast'
import { ArrowUp, ArrowDown, Loader2, Search } from 'lucide-react'

// Import API utilities
import { getProductByBarcode, updateProductStock } from '../lib/api'

const BarcodeScannerPage = () => {
  const [lastScannedCode, setLastScannedCode] = useState('')
  const [manualBarcode, setManualBarcode] = useState('')
  const [productInfo, setProductInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  // Handle barcode detection from scanner
  const handleBarcodeDetected = ({ code }) => {
    setLastScannedCode(code)
    lookupProduct(code)
  }

  // Handle manual barcode entry
  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      lookupProduct(manualBarcode)
    }
  }

  // Lookup product using API
  const lookupProduct = async (barcode) => {
    setIsLoading(true)
    
    try {
      const product = await getProductByBarcode(barcode)
      
      if (product) {
        setProductInfo(product)
        toast({
          title: "Produk Ditemukan!",
          description: `${product.name} - Rp${product.price?.toLocaleString('id-ID') || 'Harga tidak tersedia'}`,
        })
      }
    } catch (error) {
      console.error('Error looking up product:', error)
      setProductInfo(null)
      toast({
        variant: "destructive",
        title: "Produk Tidak Ditemukan",
        description: `Barcode ${barcode} tidak terdaftar dalam sistem.`
      })
      
      // Fallback to demo data if API fails or in development
      if (import.meta.env.DEV) {
        // Demo products for testing
        const demoProducts = [
          { id: 1, name: 'Bakpia Kurniasari Premium', barcode: '5901234123457', price: 45000, stock: 120 },
          { id: 2, name: 'Bakpia Kurniasari Spesial', barcode: '1234567890128', price: 35000, stock: 85 },
          { id: 3, name: 'Bakpia Kurniasari Klasik', barcode: '5901234123433', price: 25000, stock: 200 },
        ]
        
        const demoProduct = demoProducts.find(p => p.barcode === barcode)
        if (demoProduct) {
          setProductInfo({...demoProduct, isDemoData: true})
          toast({
            title: "Demo: Produk Ditemukan",
            description: `${demoProduct.name} - Rp${demoProduct.price.toLocaleString('id-ID')} (Data Demo)`,
          })
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle stock update using actual API
  const handleStockUpdate = async (type) => {
    if (!productInfo) return
    
    // Don't allow updates for demo data
    if (productInfo.isDemoData) {
      toast({
        variant: "warning",
        title: "Mode Demo",
        description: "Tidak dapat memperbarui stok pada data demo. Silakan gunakan produk dari database.",
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      // Calculate new stock value
      const quantity = 1 // Default to changing 1 unit at a time
      
      // Call API to update stock
      const updatedProduct = await updateProductStock(
        productInfo.id, 
        quantity, 
        type
      )
      
      // Update local state with new stock value
      const newStock = type === 'in' ? productInfo.stock + quantity : productInfo.stock - quantity
      
      setProductInfo({
        ...productInfo,
        stock: updatedProduct?.stock || newStock // Use API response or calculate locally as fallback
      })
      
      toast({
        title: `Stok ${type === 'in' ? 'Masuk' : 'Keluar'}`,
        description: `${productInfo.name} stok diperbarui menjadi ${updatedProduct?.stock || newStock}`,
      })
    } catch (error) {
      console.error('Error updating stock:', error)
      toast({
        variant: "destructive",
        title: "Gagal Memperbarui Stok",
        description: error.message || "Terjadi kesalahan saat memperbarui stok produk.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Scanner Barcode</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Scanner */}
        <div>
          <KeyboardBarcodeScanner 
            onDetected={handleBarcodeDetected}
          />
          
          {/* Manual Input */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Input Manual Barcode</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Masukkan kode barcode"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>Cari</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Product Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent>
              {lastScannedCode && (
                <div className="mb-4 p-3 bg-muted rounded-md">
                  <Label>Barcode Terakhir</Label>
                  <p className="font-mono text-xl">{lastScannedCode}</p>
                </div>
              )}
              
              {isLoading ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : productInfo ? (
                <div className="space-y-4">
                  <div>
                    <Label>Nama Produk</Label>
                    <p className="text-xl font-semibold">{productInfo.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Barcode</Label>
                      <p className="font-mono">{productInfo.barcode}</p>
                    </div>
                    <div>
                      <Label>Harga</Label>
                      <p className="text-lg font-semibold">
                        Rp{productInfo.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Stok Tersedia</Label>
                    <p className={`text-2xl font-bold ${productInfo.stock <= 10 ? 'text-destructive' : ''}`}>
                      {productInfo.stock}
                    </p>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleStockUpdate('in')}
                      disabled={isLoading}
                    >
                      + Stok Masuk
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleStockUpdate('out')}
                      disabled={isLoading || productInfo.stock <= 0}
                    >
                      - Stok Keluar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-center">
                  <div>
                    <p className="text-muted-foreground">
                      Scan barcode produk atau masukkan kode secara manual untuk melihat informasi produk.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full" onClick={() => navigate('/barcode-test')}>
                Ke Halaman Generator Barcode
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BarcodeScannerPage
