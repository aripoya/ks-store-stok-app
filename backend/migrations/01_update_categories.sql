-- Migration: Update categories to match UI
-- Created: 2025-06-20

-- Update category names and descriptions
UPDATE categories 
SET name = 'Bakpia Klasik', 
    description = 'Bakpia dengan rasa klasik khas Yogyakarta' 
WHERE id = 1;

UPDATE categories 
SET name = 'Paket Oleh-oleh', 
    description = 'Paket bakpia untuk oleh-oleh dan buah tangan' 
WHERE id = 4;

-- Update any product references if needed
-- If you have any products that specifically reference old category names directly
-- rather than just via foreign keys, update them here

-- Update any product description that references old category names
UPDATE products 
SET description = REPLACE(description, 'Bakpia Original', 'Bakpia Klasik') 
WHERE description LIKE '%Bakpia Original%';

UPDATE products 
SET description = REPLACE(description, 'Paket Gift', 'Paket Oleh-oleh') 
WHERE description LIKE '%Paket Gift%';

-- Example: Update product data displaying category relationship
UPDATE products 
SET name = REPLACE(name, 'Bakpia Pathok Original', 'Bakpia Pathok Klasik')
WHERE name LIKE '%Bakpia Pathok Original%';

-- Log the migration
INSERT INTO migrations (name, executed_at) 
SELECT '01_update_categories', CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='migrations');
