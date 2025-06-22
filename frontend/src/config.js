/**
 * Configuration variables for the application
 */

// Use the environment variable when available, otherwise use a relative path for local dev with proxy
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;
