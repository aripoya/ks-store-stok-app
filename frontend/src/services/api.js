// API base URL - use local development URL only when actually running on localhost
// Use production backend for all deployed environments (Cloudflare Pages production and preview)
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8787' 
  : 'https://bakpia-stok-api.wahwooh.workers.dev';

/**
 * Generic API fetch function with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // CRITICAL DEBUG: Log all request details
  console.log('🔍 DEBUG API Request:', {
    url,
    API_BASE_URL,
    endpoint,
    isLocalDev,
    hostname: window.location.hostname,
    port: window.location.port,
    options
  });
  
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
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('🚨 FETCH ERROR:', {
      message: error.message,
      endpoint
    });
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
    return fetchAPI('/api/stock?low_stock=true');
  }
};

export default {
  categories: categoriesAPI,
  products: productsAPI,
  stock: stockAPI
};
