import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Alert, AlertDescription } from './ui/alert'
import { useToast } from './ui/use-toast'

/**
 * KeyboardBarcodeScanner Component - SIMPLIFIED VERSION
 * 
 * Detects barcode input from handheld scanner devices that work as keyboard emulators
 * Uses a very simple approach - direct input field with auto focus and submit on Enter
 *
 * @param {Object} props Component properties
 * @param {function} props.onDetected Callback function when barcode is detected
 */
const KeyboardBarcodeScanner = ({
  onDetected = () => {}
}) => {
  const [barcodeInput, setBarcodeInput] = useState('')
  const [lastScan, setLastScan] = useState('')
  const [isActive, setIsActive] = useState(true)
  const inputRef = useRef(null)
  const { toast } = useToast()

  // Handle barcode scan detection
  const handleBarcodeScan = (code) => {
    if (code && code.length > 0) {
      console.log('Barcode detected:', code)
      
      // Save the last scan
      setLastScan(code)
      
      // Play success sound
      const audio = new Audio('https://cdn.jsdelivr.net/npm/barcode-beep@1.1.0/beep.mp3')
      audio.play().catch(e => console.log('Autoplay prevented:', e))
      
      // Call the detection callback
      onDetected({ code })
      
      // Toast notification
      toast({
        title: "Barcode Terdeteksi!",
        description: code,
        duration: 2000,
      })
      
      // Reset the input
      setBarcodeInput('')
    }
  }

  // Enhanced debugging for keyboard input
  useEffect(() => {
    if (!isActive) return
    
    // Global keypress handler for debugging
    const debugKeyHandler = (e) => {
      console.log('DEBUG - Key detected:', e.key, 'KeyCode:', e.keyCode, 'Type:', e.type)
    }
    
    // Add global key listeners to debug
    window.addEventListener('keydown', debugKeyHandler)
    window.addEventListener('keypress', debugKeyHandler)
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', debugKeyHandler)
      window.removeEventListener('keypress', debugKeyHandler)
    }
  }, [isActive])
  
  // Handle barcode input change - with extra debugging
  const handleInputChange = (e) => {
    console.log('Input changed:', e.target.value)
    setBarcodeInput(e.target.value)
  }
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted with:', barcodeInput)
    handleBarcodeScan(barcodeInput)
  }
  
  // Buffer approach for handling rapid input from barcode scanners
  const [buffer, setBuffer] = useState('')
  const timerRef = useRef(null)
  
  // Barcode scanner typically sends characters very quickly
  useEffect(() => {
    if (!isActive) return
    
    // HIGH PRIORITY event handler for barcode scanners
    const handleKeyDown = (e) => {
      console.log('KeyboardBarcodeScanner - key detected:', e.key, 'KeyCode:', e.keyCode)
      
      // Ensure we're the primary handler
      if (document.activeElement !== inputRef.current) {
        // Try to focus our input if it's not focused
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }
      
      // Stop event propagation to prevent other handlers from processing
      // This makes our component the primary keyboard input handler
      e.stopPropagation()
      
      // Only process printable characters and Enter
      if (e.key === 'Enter') {
        e.preventDefault() // Prevent form submission
        
        // Process buffer when Enter is pressed
        if (buffer.length > 0) {
          console.log('Enter pressed - processing buffer:', buffer)
          handleBarcodeScan(buffer)
          setBuffer('')
        }
      } else if (e.key.length === 1) {
        // Add character to buffer
        console.log('Adding to buffer:', e.key)
        setBuffer(prev => prev + e.key)
        
        // Reset timer
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        
        // Auto-submit if no input for 200ms (typical for barcode scanners)
        timerRef.current = setTimeout(() => {
          if (buffer.length > 0) {
            console.log('Buffer timeout - processing:', buffer)
            handleBarcodeScan(buffer)
            setBuffer('')
          }
        }, 200)
      }
    }
    
    // Add capture phase listener for highest priority
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    
    // Attempt to focus every 100ms to ensure we capture keyboard input
    const focusInput = () => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }
    
    // Focus input aggressively
    const interval = setInterval(focusInput, 100)
    focusInput() // Initial focus
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
      clearInterval(interval)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isActive, buffer])
  
  // Focus input on click anywhere
  const focusInput = () => {
    if (inputRef.current && isActive) {
      inputRef.current.focus()
    }
  }
  
  // Make sure we focus when the page is clicked
  useEffect(() => {
    if (!isActive) return
    
    // Click handler to focus our input
    const handleDocumentClick = () => focusInput()
    
    // Add document click listener
    document.addEventListener('click', handleDocumentClick)
    
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [isActive])
  
  // Toggle scanner active state
  const toggleScanner = () => {
    setIsActive(prev => !prev)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scanner Barcode Tangan</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Scanner input field */}
        <div className={`p-4 border-2 rounded-md ${isActive ? 'border-green-500' : 'border-gray-300'}`}>
          <div className="text-center mb-4">
            <div className={`font-medium text-lg mb-2 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
              {isActive ? 'Scanner Aktif' : 'Scanner Tidak Aktif'}
            </div>
            <p className="text-sm">
              {isActive 
                ? 'Gunakan scanner barcode atau ketik kode dan tekan Enter' 
                : 'Klik tombol "Aktifkan Scanner" untuk memulai'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Scan atau ketik barcode di sini..."
              value={barcodeInput}
              onChange={handleInputChange}
              disabled={!isActive}
              className="flex-1"
              autoComplete="off"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={!isActive || !barcodeInput}
            >
              Submit
            </Button>
          </form>
        </div>
        
        {/* Last scan result */}
        {lastScan && (
          <div className="p-4 bg-slate-100 rounded-md">
            <div className="text-sm text-gray-500 mb-1">Scan Terakhir:</div>
            <div className="font-mono text-lg">{lastScan}</div>
          </div>
        )}
        
        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li>Pastikan scanner barcode terhubung ke komputer</li>
              <li>Klik di area input di atas untuk mengaktifkan fokus</li>
              <li>Scanner akan langsung mengirim data saat memindai barcode</li>
              <li>Anda juga dapat mengetik kode barcode secara manual</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={toggleScanner} 
          className="w-full"
          variant={isActive ? "destructive" : "default"}
        >
          {isActive ? "Nonaktifkan Scanner" : "Aktifkan Scanner"}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default KeyboardBarcodeScanner
