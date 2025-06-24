-- Migration 04: Add barcode column to products table
-- This migration adds the missing barcode column to enable product barcode scanning

ALTER TABLE products ADD COLUMN barcode TEXT UNIQUE;

-- Add index for barcode for faster lookups
CREATE INDEX idx_products_barcode ON products(barcode);
