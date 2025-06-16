import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const stock = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication
stock.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET }))

// Get all stock with low stock alerts
stock.get('/', async (c) => {
  try {
    const lowStockOnly = c.req.query('low_stock') === 'true'
    
    let query = `
      SELECT s.*, p.name as product_name, p.price, c.name as category_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `

    if (lowStockOnly) {
      query += ' AND s.current_stock <= s.min_stock'
    }

    query += ' ORDER BY s.current_stock ASC'

    const stockData = await c.env.DB.prepare(query).all()

    return c.json({ stock: stockData.results })

  } catch (error) {
    console.error('Get stock error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Add stock (stock masuk)
stock.post('/in', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const { product_id, quantity, notes } = await c.req.json()

    if (!product_id || !quantity || quantity <= 0) {
      return c.json({ error: 'Product ID and valid quantity are required' }, 400)
    }

    // Update stock
    await c.env.DB.prepare(`
      UPDATE stock 
      SET stock_in = stock_in + ?, current_stock = current_stock + ?, last_updated = CURRENT_TIMESTAMP
      WHERE product_id = ?
    `).bind(quantity, quantity, product_id).run()

    // Record stock movement
    await c.env.DB.prepare(`
      INSERT INTO stock_movements (product_id, movement_type, quantity, reference_type, user_id, notes)
      VALUES (?, 'in', ?, 'manual', ?, ?)
    `).bind(product_id, quantity, payload.userId, notes || null).run()

    return c.json({ message: 'Stock added successfully' })

  } catch (error) {
    console.error('Add stock error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get stock movements history
stock.get('/movements', async (c) => {
  try {
    const productId = c.req.query('product_id')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const offset = (page - 1) * limit

    let query = `
      SELECT sm.*, p.name as product_name, u.full_name as user_name
      FROM stock_movements sm
      JOIN products p ON sm.product_id = p.id
      LEFT JOIN users u ON sm.user_id = u.id
      WHERE 1=1
    `
    
    const params: any[] = []

    if (productId) {
      query += ' AND sm.product_id = ?'
      params.push(productId)
    }

    query += ' ORDER BY sm.movement_date DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const movements = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ movements: movements.results })

  } catch (error) {
    console.error('Get stock movements error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default stock

