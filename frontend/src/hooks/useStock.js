import { useState, useEffect, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

export const useStock = (lowStockOnly = false) => {
  const [stock, setStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStock = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = `${BASE_URL}/api/stock${lowStockOnly ? '?low_stock=true' : ''}`
      console.log('🚀 STOCK HOOK: Fetching from', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🚀 STOCK HOOK: Received', data.stock?.length || 0, 'stock items')
      
      setStock(data.stock || [])
    } catch (err) {
      console.error('🚨 STOCK HOOK ERROR:', err)
      setError(err.message)
      setStock([])
    } finally {
      setLoading(false)
    }
  }, [lowStockOnly])

  const addStock = useCallback(async (productId, quantity, notes = '') => {
    try {
      setError(null)
      
      const response = await fetch(`${BASE_URL}/api/stock/in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: parseInt(quantity),
          notes: notes
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const result = await response.json()
      console.log('🚀 STOCK HOOK: Stock added successfully:', result.message)
      
      // Refresh stock data after successful addition
      await fetchStock()
      
      return result
    } catch (err) {
      console.error('🚨 STOCK HOOK ADD ERROR:', err)
      setError(err.message)
      throw err
    }
  }, [fetchStock])

  useEffect(() => {
    fetchStock()
  }, [fetchStock])

  return {
    stock,
    loading,
    error,
    refetch: fetchStock,
    addStock
  }
}

export const useStockMovements = (productId = null, page = 1, limit = 20) => {
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMovements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (productId) {
        params.append('product_id', productId.toString())
      }
      
      const url = `${BASE_URL}/api/stock/movements?${params}`
      console.log('🚀 MOVEMENTS HOOK: Fetching from', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🚀 MOVEMENTS HOOK: Received', data.movements?.length || 0, 'movements')
      
      setMovements(data.movements || [])
    } catch (err) {
      console.error('🚨 MOVEMENTS HOOK ERROR:', err)
      setError(err.message)
      setMovements([])
    } finally {
      setLoading(false)
    }
  }, [productId, page, limit])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  return {
    movements,
    loading,
    error,
    refetch: fetchMovements
  }
}
