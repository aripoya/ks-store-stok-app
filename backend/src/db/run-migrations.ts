import { D1Database } from '@cloudflare/workers-types';

// Migration SQL embedded directly in code instead of loading from files
const MIGRATIONS: Record<string, string> = {
  '01_update_categories.sql': `
-- Migration: Update categories to match UI
-- Created: 2025-06-20

-- Update category names and descriptions
UPDATE categories 
SET name = 'Bakpia Klasik', 
    description = 'Bakpia dengan rasa klasik khas Yogyakarta' 
WHERE id = 1;

UPDATE categories 
SET name = 'Paket Oleh-oleh', 
    description = 'Bakpia untuk oleh-oleh dan buah tangan' 
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
  `,
  '02_add_non_bakpia_categories.sql': `
-- Add non-Bakpia categories
-- Created: 2025-06-20

INSERT INTO categories (name, description) VALUES ('Produk Basah', 'Produk basah non-bakpia');
INSERT INTO categories (name, description) VALUES ('Produk Kue Kering', 'Berbagai jenis kue kering');
INSERT INTO categories (name, description) VALUES ('Keripik & Camilan', 'Keripik dan camilan khas');
INSERT INTO categories (name, description) VALUES ('Minuman', 'Berbagai jenis minuman');
INSERT INTO categories (name, description) VALUES ('Makanan Khas', 'Makanan khas daerah');
  `
  // Add future migrations here as needed
};

/**
 * Runs migrations against the D1 database
 * @param db - D1 Database instance
 */
export async function runMigrations(db: D1Database): Promise<void> {
  console.log('Running migrations...');

  // Ensure migrations table exists
  await db.exec(
    'CREATE TABLE IF NOT EXISTS migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, executed_at DATETIME DEFAULT CURRENT_TIMESTAMP)'
  );

  // Get list of already executed migrations
  const { results: executedMigrations } = await db.prepare(
    'SELECT name FROM migrations'
  ).all();
  
  const executedMigrationNames = new Set(
    (executedMigrations as { name: string }[]).map(m => m.name)
  );

  // Define migration files to run (add new ones here)
  const migrationFiles = Object.keys(MIGRATIONS);

  // Run migrations that haven't been executed yet
  for (const migrationFile of migrationFiles) {
    if (!executedMigrationNames.has(migrationFile)) {
      try {
        console.log(`Running migration: ${migrationFile}`);
        const sql = MIGRATIONS[migrationFile];
        
        // Execute the migration queries
        const statements = sql.split(';').filter(s => s.trim());
        for (const statement of statements) {
          const trimmedStatement = statement.trim();
          // Skip comments or empty statements
          if (trimmedStatement && !trimmedStatement.startsWith('--')) {
            await db.exec(trimmedStatement);
          }
        }
        
        // Record the migration
        await db.prepare(
          'INSERT INTO migrations (name) VALUES (?)'
        ).bind(migrationFile).run();
        
        console.log(`Migration completed: ${migrationFile}`);
      } catch (error) {
        console.error(`Error running migration ${migrationFile}:`, error);
        throw error;
      }
    } else {
      console.log(`Migration already executed: ${migrationFile}`);
    }
  }

  console.log('All migrations completed successfully');
}
