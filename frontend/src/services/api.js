// API base URL - TEMPORARY: Use production backend for dev due to wrangler proxy issues
// Use production backend for all environments until local wrangler dev connectivity fixed
const isLocalDev = false; // Temporarily disabled
const API_BASE_URL = 'https://bakpia-stok-api.wahwooh.workers.dev'; // Always use production for now

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
  // Get all products with pagination and filtering
  getAll: async (params) => {
    // Construct query string if params are provided
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category_id) queryParams.append('category_id', params.category_id);
      
      return fetchAPI(`/api/products?${queryParams.toString()}`);
    }
    
    return fetchAPI('/api/products');
  },
  
  // Get products by category
  getByCategory: async (categoryId) => {
    return fetchAPI(`/api/products?category_id=${categoryId}`);
  },
  
  // Get a product by ID
  getById: async (id) => {
    return fetchAPI(`/api/products/${id}`);
  },

  // Create a new product
  create: async (productData) => {
    return fetchAPI('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  // Update an existing product
  update: async (id, productData) => {
    return fetchAPI(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  // Delete a product (soft delete)
  delete: async (id) => {
    return fetchAPI(`/api/products/${id}`, {
      method: 'DELETE'
    });
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
  },
  
  // Get stock movements history
  getMovements: async (productId = null, page = 1, limit = 20) => {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return fetchAPI(`/api/stock/movements?${params.toString()}`);
  },
  
  // Add stock (stock masuk)
  addStock: async (productId, quantity, notes = '') => {
    return fetchAPI('/api/stock/in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
        notes: notes
      })
    });
  }
};

export default {
  categories: categoriesAPI,
  products: productsAPI,
  stock: stockAPI
};
