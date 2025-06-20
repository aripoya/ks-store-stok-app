-- Database schema for Bakpia Kurniasari Stock Management System
-- For Cloudflare D1 (SQLite)

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Users table (kasir dan admin)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'kasir', 'manager')),
  shift TEXT CHECK (shift IN ('pagi', 'siang', 'malam')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stock table
CREATE TABLE IF NOT EXISTS stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  initial_stock INTEGER DEFAULT 0,
  stock_in INTEGER DEFAULT 0,
  stock_out INTEGER DEFAULT 0,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  expire_date DATE,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_code TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transaction items table
CREATE TABLE IF NOT EXISTS transaction_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reference_type TEXT, -- 'transaction', 'manual', 'initial'
  reference_id INTEGER,
  user_id INTEGER,
  notes TEXT,
  movement_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  changed_by INTEGER NOT NULL,
  change_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_items_product ON transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);

-- Insert default categories
INSERT OR IGNORE INTO categories (id, name, description) VALUES 
(1, 'Bakpia Klasik', 'Bakpia dengan rasa klasik khas Yogyakarta'),
(2, 'Bakpia Premium', 'Bakpia dengan bahan premium dan rasa istimewa'),
(3, 'Bakpia Spesial', 'Bakpia dengan varian rasa spesial'),
(4, 'Paket Oleh-oleh', 'Paket bakpia untuk oleh-oleh dan buah tangan');

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, username, password_hash, full_name, role, is_active) VALUES 
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', 1);

-- Insert sample products
INSERT OR IGNORE INTO products (name, category_id, description, price, is_active) VALUES 
('Bakpia Pathok Original', 1, 'Bakpia original dengan isian kacang hijau', 25000, 1),
('Bakpia Pathok Coklat', 1, 'Bakpia original dengan isian coklat', 27000, 1),
('Bakpia Premium Keju', 2, 'Bakpia premium dengan isian keju berkualitas', 35000, 1),
('Bakpia Premium Durian', 2, 'Bakpia premium dengan isian durian asli', 40000, 1),
('Bakpia Spesial Teh Hijau', 3, 'Bakpia dengan rasa teh hijau yang unik', 32000, 1),
('Paket Gift Box 10 pcs', 4, 'Paket gift berisi 10 bakpia mix rasa', 150000, 1);

-- Initialize stock for sample products
INSERT OR IGNORE INTO stock (product_id, initial_stock, current_stock, min_stock) VALUES 
(1, 100, 100, 10),
(2, 100, 100, 10),
(3, 50, 50, 5),
(4, 30, 30, 5),
(5, 50, 50, 5),
(6, 20, 20, 3);

