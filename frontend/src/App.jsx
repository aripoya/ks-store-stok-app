import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Stock from './pages/Stock'
import Login from './pages/Login'
import './App.css'

function App() {
  // Mock authentication state - will be replaced with real auth
  const isAuthenticated = true

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="stock" element={<Stock />} />
          <Route path="pos" element={<div className="p-6"><h1 className="text-2xl font-bold">Sistem Kasir</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="transactions" element={<div className="p-6"><h1 className="text-2xl font-bold">Transaksi</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="users" element={<div className="p-6"><h1 className="text-2xl font-bold">Manajemen Pengguna</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
          <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Laporan</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

