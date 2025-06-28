import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Alert, AlertTitle, AlertDescription } from './ui/alert'
import { useToast } from './ui/use-toast'

/**
 * BarcodeScanner Component
 * 
 * Real-time barcode scanning using QuaggaJS (loaded via CDN)
 * Supports camera access and real-time detection
 *
 * @param {Object} props Component properties
 * @param {function} props.onDetected Callback when barcode is detected
 * @param {function} props.onError Callback when error occurs
 * @param {boolean} props.autoStart Should scanner start automatically
 */
const BarcodeScanner = ({ 
  onDetected = null,
  onError = null,
  autoStart = true
}) => {
  const [isStarted, setIsStarted] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const scannerRef = useRef(null)
  const { toast } = useToast()

  // Check if Quagga is loaded and initialize
  useEffect(() => {
    // Create script element to load QuaggaJS from CDN
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@ericblade/quagga2@1.8.2/dist/quagga.min.js'
    script.async = true
    
    script.onload = () => {
      setIsLoading(false)
      checkCameraAvailability()
      if (autoStart) {
        startScanner()
      }
    }
    
    script.onerror = () => {
      setError('Failed to load barcode scanner library')
      setIsLoading(false)
      if (onError) onError('Failed to load library')
    }
    
    document.body.appendChild(script)
    
    // Cleanup
    return () => {
      if (window.Quagga) {
        window.Quagga.stop()
      }
      document.body.removeChild(script)
    }
  }, [])
  
  // Check if camera is available
  const checkCameraAvailability = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      setHasCamera(videoDevices.length > 0)
    } catch (err) {
      console.error('Failed to check camera:', err)
      setHasCamera(false)
      setError('Gagal mengakses kamera. Pastikan browser diizinkan mengakses kamera.')
      if (onError) onError(err.message)
    }
  }

  // Initialize and start the scanner
  const startScanner = () => {
    if (!window.Quagga || !scannerRef.current || !hasCamera) return
    
    // Clear any previous instances
    window.Quagga.stop()
    
    // Configure Quagga
    window.Quagga.init({
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment", // Use rear camera if available
          width: { min: 450 },
          height: { min: 300 },
          aspectRatio: { min: 1, max: 2 }
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 2,
      frequency: 10,
      decoder: {
        readers: [
          "ean_reader",
          "ean_8_reader",
          "code_128_reader",
          "code_39_reader",
          "upc_reader"
        ]
      },
      locate: true
    }, (err) => {
      if (err) {
        console.error('Scanner initialization error:', err)
        setError('Gagal memulai scanner: ' + err.message)
        setIsStarted(false)
        if (onError) onError(err.message)
        return
      }
      
      // Start scanner
      window.Quagga.start()
      setIsStarted(true)
      setError('')
      
      // Setup detection callback
      window.Quagga.onDetected((result) => {
        if (result && result.codeResult && result.codeResult.code) {
          const code = result.codeResult.code
          const format = result.codeResult.format
          
          // Notify with sound
          const audio = new Audio('https://cdn.jsdelivr.net/npm/barcode-beep@1.1.0/beep.mp3')
          audio.play().catch(e => console.log('Autoplay prevented:', e))
          
          // Show toast notification
          toast({
            title: "Barcode Terdeteksi!",
            description: `${format}: ${code}`,
            duration: 2000,
          })
          
          // Callback with result
          if (onDetected) {
            onDetected({
              code,
              format,
              rawResult: result
            })
          }
        }
      })
      
      // Draw detection markers
      window.Quagga.onProcessed((result) => {
        const drawingCtx = window.Quagga.canvas.ctx.overlay
        const drawingCanvas = window.Quagga.canvas.dom.overlay

        if (result) {
          if (result.boxes) {
            drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
            
            result.boxes.filter(box => box !== result.box).forEach(box => {
              drawingCtx.strokeStyle = "green"
              drawingCtx.lineWidth = 2
              drawingCtx.strokeRect(box.x, box.y, box.width, box.height)
            })
          }

          if (result.box) {
            drawingCtx.strokeStyle = "blue"
            drawingCtx.lineWidth = 2
            drawingCtx.strokeRect(result.box.x, result.box.y, result.box.width, result.box.height)
          }

          if (result.codeResult && result.codeResult.code) {
            drawingCtx.font = "24px Arial"
            drawingCtx.fillStyle = "green"
            drawingCtx.fillText(result.codeResult.code, 10, 50)
          }
        }
      })
    })
  }
  
  // Stop the scanner
  const stopScanner = () => {
    if (window.Quagga) {
      window.Quagga.stop()
      setIsStarted(false)
    }
  }
  
  // Toggle scanner state
  const toggleScanner = () => {
    if (isStarted) {
      stopScanner()
    } else {
      startScanner()
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Barcode Scanner</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px] bg-gray-100 rounded-md animate-pulse">
            <p>Memuat scanner barcode...</p>
          </div>
        ) : hasCamera ? (
          <div className="relative">
            <div 
              ref={scannerRef} 
              className="w-full h-[300px] bg-black rounded-md overflow-hidden"
            />
            
            {!isStarted && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white rounded-md">
                <p className="mb-4 text-center px-4">
                  Klik tombol "Mulai Scanner" untuk memindai barcode
                </p>
              </div>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertTitle>Kamera tidak tersedia</AlertTitle>
            <AlertDescription>
              Aplikasi tidak dapat mengakses kamera. Pastikan perangkat Anda memiliki kamera dan browser diizinkan untuk mengaksesnya.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>✓ Arahkan kamera ke barcode produk</p>
          <p>✓ Tahan dengan stabil hingga barcode terdeteksi</p>
          <p>✓ Pastikan pencahayaan cukup</p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={toggleScanner} 
          disabled={!hasCamera || isLoading} 
          className="w-full"
          variant={isStarted ? "destructive" : "default"}
        >
          {isStarted ? "Hentikan Scanner" : "Mulai Scanner"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default BarcodeScanner
