import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const transactions = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication
// transactions.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET })) // Auth disabled for POS development

// Get all transactions
transactions.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = (page - 1) * limit

    const transactions = await c.env.DB.prepare(`
      SELECT t.*, u.full_name as kasir_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    return c.json({ transactions: transactions.results })

  } catch (error) {
    console.error('Get transactions error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new transaction (sale)
transactions.post('/', async (c) => {
  const db = c.env.DB;
  try {
    // const payload = c.get('jwtPayload') // Auth disabled for now
    const userId = 1; // Default to admin user (ID 1) for now
    const { items, payment_method, notes } = await c.req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Transaction items are required' }, 400)
    }

    // --- Stock Validation Step ---
    for (const item of items) {
      const stockInfo = await db.prepare(
        'SELECT p.name, s.current_stock FROM stock s JOIN products p ON s.product_id = p.id WHERE s.product_id = ?'
      ).bind(item.product_id).first();

      if (!stockInfo) {
        return c.json({ error: `Produk dengan ID ${item.product_id} tidak ditemukan.` }, 404);
      }

      const stockData = stockInfo as { name: string; current_stock: number };

      if (stockData.current_stock < item.quantity) {
        return c.json({ error: `Stok tidak mencukupi untuk produk: ${stockData.name}. Sisa stok: ${stockData.current_stock}` }, 400);
      }
    }

    // Generate transaction code
    const transactionCode = `TRX-${Date.now()}`
    let totalAmount = 0

    // Calculate total amount
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price
    }

    // Create transaction
    const transactionResult = await db.prepare(`
      INSERT INTO transactions (transaction_code, user_id, total_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `).bind(transactionCode, userId, totalAmount, payment_method || 'cash', notes || null).run()

    const transactionId = transactionResult.meta.last_row_id

    if (!transactionId) {
        throw new Error("Failed to create transaction record.");
    }

    // Insert transaction items and update stock
    for (const item of items) {
      // Insert transaction item
      await db.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `).bind(transactionId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price).run()

      // Update stock
      await db.prepare(`
        UPDATE stock 
        SET stock_out = stock_out + ?, current_stock = current_stock - ?, last_updated = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).bind(item.quantity, item.quantity, item.product_id).run()

      // Record stock movement
      await db.prepare(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, user_id)
        VALUES (?, 'out', ?, 'transaction', ?, ?)
      `).bind(item.product_id, item.quantity, transactionId, userId).run()
    }

    return c.json({ 
      message: 'Transaction created successfully',
      transactionId,
      transactionCode
    })

  } catch (error: any) {
    console.error('Create transaction error:', error)
    return c.json({ error: 'Internal server error', details: error.message }, 500)
  }
})

export default transactions

