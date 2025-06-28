// API client utilities for Bakpia Stok app
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Fetch wrapper with error handling and automatic JSON parsing
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Get product by barcode
 * @param {string} barcode - Product barcode
 * @returns {Promise<Object>} Product data
 */
export async function getProductByBarcode(barcode) {
  return fetchApi(`/products/barcode/${barcode}`);
}

/**
 * Update product stock
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add (positive) or remove (negative)
 * @param {string} type - 'in' or 'out'
 * @returns {Promise<Object>} Updated product data
 */
export async function updateProductStock(productId, quantity, type = 'in') {
  return fetchApi(`/products/${productId}/stock`, {
    method: 'POST',
    body: JSON.stringify({
      quantity: Math.abs(quantity),
      type
    })
  });
}

/**
 * Get all products
 * @returns {Promise<Array>} Product data
 */
export async function getProducts() {
  return fetchApi('/products');
}

/**
 * Create a stock transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise<Object>} Transaction result
 */
export async function createStockTransaction(transactionData) {
  return fetchApi('/stock/transaction', {
    method: 'POST',
    body: JSON.stringify(transactionData)
  });
}
