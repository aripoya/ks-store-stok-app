// API base URL - update this to match your production URL when deployed
// Use local development URL when in development mode
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
    fullURL: url
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
    console.log('🚀 Making fetch request to:', url);
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log('📡 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.message || `API Error: ${response.status}`;
      console.error('❌ API Error Response:', errorData);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('✅ API Success:', { url, dataLength: Array.isArray(data) ? data.length : 'object' });
    return data;
  } catch (error) {
    console.error('💥 API request failed:', {
      url,
      error: error.message,
      stack: error.stack,
      name: error.name
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
