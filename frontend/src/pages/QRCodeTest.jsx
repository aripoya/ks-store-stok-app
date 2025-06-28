import { useState } from 'react'
import QRCodeGenerator from '../components/QRCodeGenerator'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'

const QRCodeTest = () => {
  const [productData, setProductData] = useState([
    { id: 1, name: 'Bakpia Kurniasari Premium', qrData: 'https://kurniasari-bakpia.com/p/1', price: 45000 },
    { id: 2, name: 'Bakpia Kurniasari Spesial', qrData: 'https://kurniasari-bakpia.com/p/2', price: 35000 },
    { id: 3, name: 'Bakpia Kurniasari Klasik', qrData: 'https://kurniasari-bakpia.com/p/3', price: 25000 },
  ])
  
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [qrValue, setQrValue] = useState('')
  const [includeEntryDate, setIncludeEntryDate] = useState(false)
  
  const handleSelectProduct = (product) => {
    setSelectedProduct(product)
    updateQrValue(product)
  }
  
  const updateQrValue = (product) => {
    if (!product) return
    
    let qrData = product.qrData
    
    // Add entry date if option is enabled
    if (includeEntryDate) {
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD format
      qrData = `${qrData}?entryDate=${dateStr}`
    }
    
    setQrValue(qrData)
  }
  
  const handleQrChange = (newValue) => {
    if (selectedProduct) {
      // Extract base URL without params
      const baseUrl = newValue.value.split('?')[0]
      
      // Update product QR data in list
      const updatedProducts = productData.map(p => 
        p.id === selectedProduct.id ? {...p, qrData: baseUrl} : p
      )
      setProductData(updatedProducts)
      
      // Update selected product
      setSelectedProduct({...selectedProduct, qrData: baseUrl})
      
      // Re-apply the entry date if needed
      updateQrValue({...selectedProduct, qrData: baseUrl})
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">QR Code Generator Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Product List */}
        <Card>
          <CardHeader>
            <CardTitle>Produk Sample</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Klik item untuk melihat atau membuat QR code-nya
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
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[200px] inline-block">
                        {product.qrData || 'No QR Data'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-8">
                <Label htmlFor="qr-data">QR Code Data</Label>
                <div className="flex mt-2">
                  <Input 
                    id="qr-data"
                    value={qrValue}
                    onChange={e => setQrValue(e.target.value)}
                    placeholder="Enter QR code data value"
                  />
                </div>
                
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-date"
                    checked={includeEntryDate}
                    onChange={(e) => {
                      setIncludeEntryDate(e.target.checked)
                      if (selectedProduct) {
                        updateQrValue(selectedProduct)
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="include-date" className="cursor-pointer">
                    Include Entry Date (Tanggal Masuk)
                  </Label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {includeEntryDate && qrValue.includes('entryDate=') ? 
                    `Entry date included: ${qrValue.split('entryDate=')[1]}` : 
                    'Add tanggal masuk to QR code for product traceability'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Side: QR Code Generator */}
        <div>
          {selectedProduct ? (
            <>
              <h2 className="text-xl font-semibold mb-4">
                QR Code: {selectedProduct.name}
              </h2>
              <QRCodeGenerator 
                value={qrValue} 
                errorCorrection="M"
                onChange={handleQrChange}
              />
              <div className="mt-4 text-sm text-gray-500">
                <p>✅ Download PNG: untuk stiker dan label</p>
                <p>✅ Print: untuk cetak langsung ke printer</p>
                <p>✅ Includes product tracking information via QR</p>
              </div>
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center p-8">
                <p className="text-gray-500">
                  Silakan pilih produk dari daftar untuk melihat atau membuat QR code
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default QRCodeTest
