-- Add barcode column to products table
-- Migration: 02_add_barcode_to_products.sql

-- Step 1: Add barcode column without UNIQUE constraint first
ALTER TABLE products ADD COLUMN barcode TEXT;

-- Step 2: Create index for faster barcode lookups (allows NULL values)
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);

-- Step 3: Add some sample barcodes for existing products (optional)
UPDATE products SET barcode = '8991102123456' WHERE name LIKE '%Bakpia Premium Durian%';
UPDATE products SET barcode = '8991102123457' WHERE name LIKE '%Bakpia Premium Keju%';
UPDATE products SET barcode = '8991102123458' WHERE name LIKE '%Bakpia Pathok Original%';
UPDATE products SET barcode = '8991102123459' WHERE name LIKE '%Bakpia Pathok Coklat%';
UPDATE products SET barcode = '8991102123460' WHERE name LIKE '%Paket Gift Box%';

-- Step 4: Create unique constraint via unique index (allows NULL, but enforces uniqueness for non-NULL)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode_unique ON products(barcode) WHERE barcode IS NOT NULL;
