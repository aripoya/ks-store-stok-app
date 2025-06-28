import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'

/**
 * QRCodeGenerator Component
 * 
 * Generates QR code images using QRCode.js library (loaded via CDN in index.html)
 * Supports various error correction levels and download/print functionality
 *
 * @param {Object} props Component properties
 * @param {string} props.value Initial QR code value
 * @param {string} props.errorCorrection Error correction level (L, M, Q, H)
 * @param {function} props.onChange Callback when QR code value changes
 */
const QRCodeGenerator = ({ 
  value = '', 
  errorCorrection = 'M',
  onChange = null
}) => {
  const [qrValue, setQrValue] = useState(value || 'https://kurniasari-bakpia.com/product/123')
  const [ecLevel, setEcLevel] = useState(errorCorrection)
  const [size, setSize] = useState(200)
  const [darkColor, setDarkColor] = useState('#000000')
  const [lightColor, setLightColor] = useState('#FFFFFF')
  const [error, setError] = useState('')
  
  const canvasRef = useRef(null)
  
  // Error correction levels
  const ecLevels = [
    { value: 'L', label: 'Low (7%)' },
    { value: 'M', label: 'Medium (15%)' },
    { value: 'Q', label: 'Quartile (25%)' },
    { value: 'H', label: 'High (30%)' }
  ]

  // Generate product URL with query parameters if productData is provided
  useEffect(() => {
    if (productData) {
      try {
        const productUrl = new URL(`${domain}/product-info.html`);
        
        // Add product data as query parameters
        if (productData.id) productUrl.searchParams.append('id', productData.id);
        if (productData.name) productUrl.searchParams.append('name', encodeURIComponent(productData.name));
        if (productData.price) productUrl.searchParams.append('price', productData.price);
        if (productData.entryDate) productUrl.searchParams.append('entry', encodeURIComponent(productData.entryDate));
        if (productData.expiryDate) productUrl.searchParams.append('expiry', encodeURIComponent(productData.expiryDate));
        if (productData.location) productUrl.searchParams.append('location', encodeURIComponent(productData.location));
        if (productData.image) productUrl.searchParams.append('image', encodeURIComponent(productData.image));
        if (productData.description) productUrl.searchParams.append('desc', encodeURIComponent(productData.description));
        if (productData.category) productUrl.searchParams.append('category', encodeURIComponent(productData.category));
        
        setQrValue(productUrl.toString());
      } catch (err) {
        console.error('Error creating product URL:', err);
        setQrValue(value); // Fallback to original value
      }
    } else {
      setQrValue(value);
    }
  }, [value, productData, domain]);

  // Generate QR code using QRCode.js
  const generateQrCode = () => {
    if (!window.QRCode) {
      setError('QRCode library not loaded')
      return
    }

    if (!qrValue) {
      setError('QR code value cannot be empty')
      return
    }

    try {
      setError('')
      
      const canvas = canvasRef.current
      if (!canvas) return

      // Clear previous QR code
      const context = canvas.getContext('2d')
      context.clearRect(0, 0, canvas.width, canvas.height)

      // Generate new QR code
      window.QRCode.toCanvas(canvas, qrValue, {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: ecLevel,
        color: {
          dark: darkColor,
          light: lightColor
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error)
          setError(error.toString())
        }
      })
      
      // Call onChange if provided
      if (onChange) {
        onChange({ value: qrValue, errorCorrection: ecLevel })
      }
    } catch (err) {
      console.error('QR code generation error:', err)
      setError(err.message)
    }
  }

  // Generate QR code when component mounts or values change
  useEffect(() => {
    if (qrValue) {
      generateQrCode()
    }
  }, [qrValue, ecLevel, qrSize, darkColor, lightColor])

  // Download QR code as PNG
  const downloadPng = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    
    // Trigger download
    const link = document.createElement('a')
    link.download = `qrcode-${qrValue.substring(0, 20)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  
  // Print QR code
  const printQrCode = () => {
    if (!canvasRef.current) return
    
    // Create print window
    const printWin = window.open('', '_blank')
    
    // Get canvas content as image
    const canvas = canvasRef.current
    const imgData = canvas.toDataURL('image/png')
    
    // Create print document
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print QR Code</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; text-align: center; }
            img { max-width: 100%; }
            .info { font-family: Arial, sans-serif; margin-top: 10px; }
          }
        </style>
      </head>
      <body>
        <img src="${imgData}" alt="QR Code" />
        <div class="info">
          <p><strong>Data:</strong> ${qrValue}</p>
        </div>
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `)
    
    printWin.document.close()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>QR Code Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Value Input */}
        <div className="space-y-2">
          <Label htmlFor="qr-value">Data QR Code</Label>
          <div className="flex space-x-2">
            <Input 
              id="qr-value"
              value={qrValue} 
              onChange={e => setQrValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateQrCode}>Generate</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        {/* Error Correction Level */}
        <div className="space-y-2">
          <Label htmlFor="ec-level">Error Correction Level</Label>
          <Select
            value={ecLevel}
            onValueChange={setEcLevel}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih level koreksi error" />
            </SelectTrigger>
            <SelectContent>
              {ecLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="size">Ukuran: {size}px</Label>
          </div>
          <Slider
            id="size"
            min={100}
            max={400}
            step={10}
            value={[size]}
            onValueChange={(values) => setSize(values[0])}
          />
        </div>
        
        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dark-color">Warna Gelap</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="dark-color"
                type="color"
                value={darkColor}
                onChange={e => setDarkColor(e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input 
                type="text"
                value={darkColor}
                onChange={e => setDarkColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="light-color">Warna Terang</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="light-color"
                type="color"
                value={lightColor}
                onChange={e => setLightColor(e.target.value)}
                className="w-12 h-8 p-1"
              />
              <Input 
                type="text"
                value={lightColor}
                onChange={e => setLightColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white rounded-md overflow-hidden">
          <canvas ref={canvasRef} />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={downloadPng}>
          Download PNG
        </Button>
        <Button onClick={printQrCode}>
          Print
        </Button>
      </CardFooter>
    </Card>
  )
}

export default QRCodeGenerator
