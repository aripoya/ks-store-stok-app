import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const transactions = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication
transactions.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET }))

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
  try {
    const payload = c.get('jwtPayload')
    const { items, payment_method, notes } = await c.req.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return c.json({ error: 'Transaction items are required' }, 400)
    }

    // Generate transaction code
    const transactionCode = `TRX-${Date.now()}`
    let totalAmount = 0

    // Calculate total amount
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price
    }

    // Create transaction
    const transactionResult = await c.env.DB.prepare(`
      INSERT INTO transactions (transaction_code, user_id, total_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?)
    `).bind(transactionCode, payload.userId, totalAmount, payment_method || 'cash', notes || null).run()

    const transactionId = transactionResult.meta.last_row_id

    // Insert transaction items and update stock
    for (const item of items) {
      // Insert transaction item
      await c.env.DB.prepare(`
        INSERT INTO transaction_items (transaction_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `).bind(transactionId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price).run()

      // Update stock
      await c.env.DB.prepare(`
        UPDATE stock 
        SET stock_out = stock_out + ?, current_stock = current_stock - ?, last_updated = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).bind(item.quantity, item.quantity, item.product_id).run()

      // Record stock movement
      await c.env.DB.prepare(`
        INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, reference_id, user_id)
        VALUES (?, 'out', ?, 'transaction', ?, ?)
      `).bind(item.product_id, item.quantity, transactionId, payload.userId).run()
    }

    return c.json({ 
      message: 'Transaction created successfully',
      transactionId,
      transactionCode
    })

  } catch (error) {
    console.error('Create transaction error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default transactions

