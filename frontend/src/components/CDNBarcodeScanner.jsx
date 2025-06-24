import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

const CDNBarcodeScanner = ({ onBarcodeDetected, isActive = false }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [error, setError] = useState('')
  const [isZXingLoaded, setIsZXingLoaded] = useState(false)
  const videoRef = useRef(null)
  const codeReaderRef = useRef(null)

  // Load ZXing library dynamically
  useEffect(() => {
    const loadZXing = () => {
      if (window.ZXing) {
        setIsZXingLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/@zxing/library@latest/umd/index.min.js'
      script.onload = () => {
        setIsZXingLoaded(true)
      }
      script.onerror = () => {
        setError('Failed to load ZXing library')
      }
      document.head.appendChild(script)
    }

    loadZXing()
  }, [])

  const startScanning = async () => {
    if (!isZXingLoaded || !window.ZXing) {
      setError('ZXing library not loaded')
      return
    }

    try {
      setError('')
      setIsScanning(true)

      // Initialize code reader
      const codeReader = new window.ZXing.BrowserMultiFormatReader()
      codeReaderRef.current = codeReader

      // Get video devices
      const videoInputDevices = await codeReader.listVideoInputDevices()
      
      if (videoInputDevices.length === 0) {
        throw new Error('No video input devices found')
      }

      // Use the first camera (usually back camera on mobile)
      const firstDeviceId = videoInputDevices[0].deviceId

      // Start decoding
      await codeReader.decodeFromVideoDevice(
        firstDeviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            const barcode = result.getText()
            console.log('🔍 Barcode detected:', barcode)
            onBarcodeDetected(barcode)
            stopScanning() // Stop after successful scan
          }
          
          if (err && !(err instanceof window.ZXing.NotFoundException)) {
            console.error('Scanner error:', err)
          }
        }
      )

    } catch (err) {
      console.error('Failed to start camera:', err)
      setError(`Camera error: ${err.message}`)
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset()
      codeReaderRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onBarcodeDetected(manualBarcode.trim())
      setManualBarcode('')
    }
  }

  useEffect(() => {
    // Stop scanning when component becomes inactive
    if (!isActive && isScanning) {
      stopScanning()
    }
  }, [isActive, isScanning])

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset()
      }
    }
  }, [])

  if (!isZXingLoaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading barcode scanner...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera Scanner */}
        <div>
          <div className="space-y-2">
            {!isScanning ? (
              <Button 
                onClick={startScanning} 
                className="w-full"
                disabled={!isActive}
              >
                📷 Mulai Scan
              </Button>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="destructive" 
                className="w-full"
              >
                ⏹️ Stop Scan
              </Button>
            )}
          </div>

          {/* Video Preview */}
          {isScanning && (
            <div className="mt-4">
              <video
                ref={videoRef}
                className="w-full max-w-sm mx-auto border-2 border-dashed border-red-300 rounded-lg"
                style={{ maxHeight: '300px' }}
                playsInline
                muted
              />
              <p className="text-sm text-muted-foreground text-center mt-2">
                Arahkan kamera ke barcode
              </p>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="border-t pt-4">
          <form onSubmit={handleManualSubmit} className="space-y-2">
            <Input
              type="text"
              placeholder="Input Manual Barcode"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              disabled={!isActive}
            />
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full"
              disabled={!manualBarcode.trim() || !isActive}
            >
              ✅ Submit Manual
            </Button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
            <Button 
              onClick={() => setError('')} 
              variant="ghost" 
              size="sm" 
              className="mt-2"
            >
              ❌ Tutup
            </Button>
          </div>
        )}

        {/* Status */}
        <div className="text-sm text-muted-foreground">
          Status: {isScanning ? '🟢 Scanning...' : '🔴 Stopped'}
        </div>
      </CardContent>
    </Card>
  )
}

export default CDNBarcodeScanner
