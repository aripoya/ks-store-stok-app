import { useState } from 'react'
import BarcodeGenerator from '../components/BarcodeGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'

const BarcodeTest = () => {
  const [productData, setProductData] = useState([
    { id: 1, name: 'Bakpia Kurniasari Premium', barcode: '5901234123457', price: 45000 },
    { id: 2, name: 'Bakpia Kurniasari Spesial', barcode: '1234567890128', price: 35000 },
    { id: 3, name: 'Bakpia Kurniasari Klasik', barcode: '5901234123433', price: 25000 },
  ])
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [barcodeValue, setBarcodeValue] = useState('')
  
  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    setBarcodeValue(product.barcode)
  }
  
  const handleBarcodeChange = (newValue) => {
    if (selectedProduct) {
      // Update product barcode in list
      const updatedProducts = productData.map(p => 
        p.id === selectedProduct.id ? {...p, barcode: newValue.value} : p
      )
      setProductData(updatedProducts)
      
      // Update selected product
      setSelectedProduct({...selectedProduct, barcode: newValue.value})
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Barcode Generator Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Klik item untuk melihat atau membuat barcode-nya
              </p>
              
              {productData.map((product) => (
                <div 
                  key={product.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedProduct?.id === product.id ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm">Rp {product.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {product.barcode || 'No Barcode'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8">
                <Label htmlFor="new-barcode">Generate New Random Barcode</Label>
                <div className="flex mt-2">
                  <Input 
                    id="new-barcode"
                    value={barcodeValue}
                    onChange={e => setBarcodeValue(e.target.value)}
                    placeholder="Enter barcode value"
                  />
                  <Button 
                    className="ml-2"
                    onClick={() => {
                      // Generate random EAN-13 barcode
                      const randomBarcode = Array.from(
                        {length: 13}, 
                        () => Math.floor(Math.random() * 10)
                      ).join('')
                      setBarcodeValue(randomBarcode)
                    }}
                  >
                    Random
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Klik Random untuk generate EAN-13 barcode baru
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Side: Barcode Generator */}
        <div>
          {selectedProduct ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                Barcode: {selectedProduct.name}
              </h2>
              <BarcodeGenerator 
                value={barcodeValue} 
                format="EAN13"
                onChange={handleBarcodeChange}
              />
              <div className="mt-4 text-sm text-gray-500">
                <p>✅ Download PNG: untuk stiker dan label</p>
                <p>✅ Download SVG: untuk kebutuhan desain</p>
                <p>✅ Print: untuk cetak langsung ke printer</p>
              </div>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-8">
                <p className="text-gray-500">
                  Silakan pilih produk dari daftar untuk melihat atau membuat barcode
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default BarcodeTest
