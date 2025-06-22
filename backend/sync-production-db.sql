-- Add missing categories (5-9)
INSERT INTO categories (id, name, description) VALUES 
  (5, 'Produk Basah', 'Produk basah non-bakpia'),
  (6, 'Produk Kue Kering', 'Berbagai jenis kue kering'),
  (7, 'Keripik & Camilan', 'Keripik dan camilan khas'),
  (8, 'Minuman', 'Berbagai jenis minuman'),
  (9, 'Makanan Khas', 'Makanan khas daerah');

-- Add missing products (7-11)
INSERT INTO products (id, name, category_id, price) VALUES
  (7, 'Onde-onde', 5, 5000),
  (8, 'Kue Nastar', 6, 8000),
  (9, 'Keripik Tempe', 7, 12000),
  (10, 'Teh Botol', 8, 7500),
  (11, 'Gudeg Kaleng', 9, 45000);
