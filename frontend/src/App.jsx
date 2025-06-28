import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductsWorking from './pages/ProductsWorking'
import ProductsWorkingDebug from './pages/ProductsWorkingDebug'
import ProductsMinimal from './pages/ProductsMinimal'
import ProductsSimple from './pages/ProductsSimple'
import Categories from './pages/Categories'
import Stock from './pages/Stock'
import POS from './pages/POS'
import Login from './pages/Login'
import TestPage from './pages/TestPage'
import SimpleProducts from './pages/SimpleProducts'
import Test from './pages/Test' // Import the new Test page
import ApiTest from './pages/ApiTest' // Import ApiTest diagnostic page
import { Toaster } from './components/ui/sonner'
import './App.css'
import ProductsWorkingMinimal from './pages/ProductsWorkingMinimal'
import DialogTest from './pages/DialogTest'
import ProductsWorkingClean from './pages/ProductsWorkingClean'
import DebugAPI from './pages/DebugAPI' // Import DebugAPI for production debugging
import BarcodeTest from './pages/BarcodeTest' // Import BarcodeTest page for barcode generator demo
import BarcodeScannerPage from './pages/BarcodeScannerPage' // Import BarcodeScannerPage for barcode scanning
import QRCodeTest from './pages/QRCodeTest' // Import QRCodeTest page for QR code generator demo
import BulkPrint from './pages/BulkPrint' // Import BulkPrint page for bulk barcode/QR code printing

function App() {
  // Mock authentication state - will be replaced with real auth
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsWorking />} />
          <Route path="products-simple" element={<ProductsSimple />} />
          <Route path="categories" element={<Categories />} />
          <Route path="stock" element={<Stock />} />
          <Route path="test" element={<TestPage />} />
          <Route path="test-diag" element={<Test />} />
          <Route path="api-test" element={<ApiTest />} />
          <Route path="debug-api" element={<DebugAPI />} />
          <Route path="simple-products" element={<SimpleProducts />} />
          <Route path="pos" element={<POS />} />
          <Route path="barcode-test" element={<BarcodeTest />} />
          <Route path="barcode-scanner" element={<BarcodeScannerPage />} />
          <Route path="qrcode-test" element={<QRCodeTest />} />
          <Route path="bulk-print" element={<BulkPrint />} />
          <Route path="transactions" element={<div className="p-6"><h1 className="text-2xl font-bold">Transaksi</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Manajemen Pengguna</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Laporan</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="dialog-test" element={<DialogTest />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
