import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Input } from './ui/input'
import { Label } from './ui/label'

/**
 * BarcodeGenerator Component
 * 
 * Generates barcode images using JsBarcode library (loaded via CDN in index.html)
 * Supports multiple barcode formats and download functionality
 *
 * @param {Object} props Component properties
 * @param {string} props.value Initial barcode value
 * @param {string} props.format Initial barcode format
 * @param {function} props.onChange Callback when barcode value/format changes
 */
const BarcodeGenerator = ({ 
  value = '', 
  format = 'CODE128',
  onChange = null
}) => {
  const [barcodeValue, setBarcodeValue] = useState(value || '1234567890123')
  const [barcodeFormat, setBarcodeFormat] = useState(format)
  const [error, setError] = useState('')
  const svgRef = useRef(null)
  
  // Available barcode formats
  const formats = [
    { value: 'EAN13', label: 'EAN-13 (Retail Products)', validator: (val) => /^\d{13}$/.test(val) },
    { value: 'CODE128', label: 'CODE128 (Text & Numbers)', validator: (val) => val.length > 0 },
    { value: 'UPC', label: 'UPC-A (12-digit retail)', validator: (val) => /^\d{12}$/.test(val) },
    { value: 'EAN8', label: 'EAN-8 (Short format)', validator: (val) => /^\d{8}$/.test(val) },
  ]

  // Generate barcode using JsBarcode
  const generateBarcode = () => {
    if (!window.JsBarcode) {
      setError('JsBarcode library not loaded')
      return
    }

    try {
      setError('')
      
      // Get current format config and validate
      const formatConfig = formats.find(f => f.value === barcodeFormat)
      if (!formatConfig.validator(barcodeValue)) {
        throw new Error(`Invalid value for ${barcodeFormat} format`)
      }

      // Generate barcode
      window.JsBarcode(svgRef.current, barcodeValue, {
        format: barcodeFormat,
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        margin: 10,
        background: "#ffffff"
      })
      
      // Call onChange if provided
      if (onChange) {
        onChange({ value: barcodeValue, format: barcodeFormat })
      }
    } catch (err) {
      console.error('Barcode generation error:', err)
      setError(err.message)
    }
  }

  // Generate barcode when component mounts or values change
  useEffect(() => {
    if (barcodeValue) {
      generateBarcode()
    }
  }, [barcodeValue, barcodeFormat])

  // Handle format change
  const handleFormatChange = (newFormat) => {
    setBarcodeFormat(newFormat)
    
    // Set default test value for the selected format
    if (newFormat === 'EAN13') {
      setBarcodeValue('5901234123457')
    } else if (newFormat === 'UPC') {
      setBarcodeValue('590123412345')
    } else if (newFormat === 'EAN8') {
      setBarcodeValue('59012345')
    } else {
      setBarcodeValue('PRODUCT-1234')
    }
  }

  // Download barcode as PNG
  const downloadPng = () => {
    if (!svgRef.current) return
    
    // Create canvas element
    const canvas = document.createElement('canvas')
    const svg = svgRef.current
    const box = svg.getBoundingClientRect()
    
    // Set canvas size
    canvas.width = box.width
    canvas.height = box.height
    
    // Draw SVG on canvas
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Convert SVG to image
    const data = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      
      // Trigger download
      const link = document.createElement('a')
      link.download = `barcode-${barcodeValue}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`
  }
  
  // Download barcode as SVG
  const downloadSvg = () => {
    if (!svgRef.current) return
    
    // Get SVG content
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    
    // Trigger download
    const link = document.createElement('a')
    link.download = `barcode-${barcodeValue}.svg`
    link.href = url
    link.click()
    
    // Clean up
    URL.revokeObjectURL(url)
  }
  
  // Simulate print
  const printBarcode = () => {
    if (!svgRef.current) return
    
    // Create print window
    const printWin = window.open('', '_blank')
    
    // Get SVG content
    const svgData = new XMLSerializer().serializeToString(svgRef.current)
    
    // Create print document
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Barcode</title>
        <style>
          @media print {
            body { margin: 0; }
            svg { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        ${svgData}
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
        <CardTitle>Barcode Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label htmlFor="format">Format Barcode</Label>
          <Select
            value={barcodeFormat}
            onValueChange={handleFormatChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih format barcode" />
            </SelectTrigger>
            <SelectContent>
              {formats.map(format => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Barcode Value Input */}
        <div className="space-y-2">
          <Label htmlFor="barcode-value">Nilai Barcode</Label>
          <div className="flex space-x-2">
            <Input 
              id="barcode-value"
              value={barcodeValue} 
              onChange={e => setBarcodeValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateBarcode}>Generate</Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        
        {/* Barcode Display */}
        <div className="flex justify-center p-4 bg-white rounded-md overflow-hidden">
          <svg ref={svgRef} />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={downloadPng}>
          Download PNG
        </Button>
        <Button variant="outline" onClick={downloadSvg}>
          Download SVG
        </Button>
        <Button onClick={printBarcode}>
          Print
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BarcodeGenerator
