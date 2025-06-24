-- Migration: Add stock column to products table
-- File: 03_add_stock_to_products.sql
-- Purpose: Add stock management capability to products

-- Add stock column with default value of 0
ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;

-- Record migration
INSERT INTO migrations (name, executed_at) VALUES ('03_add_stock_to_products.sql', CURRENT_TIMESTAMP);
