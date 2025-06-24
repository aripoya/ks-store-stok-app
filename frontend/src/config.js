/**
 * Configuration variables for the application
 */

// Configuration file for frontend application
// Note: VITE_API_URL is not available in production, so we use the fixed production URL

// Use production backend URL directly instead of unreliable environment variables
export const API_BASE_URL = 'https://bakpia-stok-api.wahwooh.workers.dev';

// For local development, you can override this in your .env.local file
// But production will always use the stable backend URL above

console.log('🔧 CONFIG: Using API_BASE_URL =', API_BASE_URL);

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
