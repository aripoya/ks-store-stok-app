// API base URL - update this to match your production URL when deployed
// Use local development URL when in development mode
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8080' 
  : 'https://bakpia-stok-api.wahwooh.workers.dev';

/**
 * Generic API fetch function with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Add authentication if available
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Categories API
 */
export const categoriesAPI = {
  // Get all categories
  getAll: async () => {
    return fetchAPI('/api/categories');
  },
  
  // Get a category by ID
  getById: async (id) => {
    return fetchAPI(`/api/categories/${id}`);
  }
};

/**
 * Products API
 */
export const productsAPI = {
  // Get all products
  getAll: async () => {
    return fetchAPI('/api/products');
  },
  
  // Get products by category
  getByCategory: async (categoryId) => {
    return fetchAPI(`/api/products?category_id=${categoryId}`);
  },
  
  // Get a product by ID
  getById: async (id) => {
    return fetchAPI(`/api/products/${id}`);
  }
};

/**
 * Stock API
 */
export const stockAPI = {
  // Get current stock levels for all products
  getAll: async () => {
    return fetchAPI('/api/stock');
  },
  
  // Get low stock products
  getLowStock: async () => {
    return fetchAPI('/api/stock/low');
  }
};

export default {
  categories: categoriesAPI,
  products: productsAPI,
  stock: stockAPI
};
