import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  ENVIRONMENT: string
}

const stock = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication - TEMPORARILY DISABLED
// TODO: Implement proper authentication system with login/signup in future
stock.use('*', async (c, next) => {
  console.log(`🚀 STOCK API ${c.req.method} request to ${c.req.path} - Authentication SKIPPED (for testing)`)
  console.log('🚀 STOCK API DEPLOYMENT TIMESTAMP:', new Date().toISOString())
  return await next()
})

// DISABLED: stock.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET }))

// Get all stock with low stock alerts
stock.get('/', async (c) => {
  try {
    console.log('🚀 STOCK GET: Starting stock query...')
    console.log('🚀 STOCK GET: Environment check - DB binding:', !!c.env.DB)
    console.log('🚀 STOCK GET: Environment check - JWT_SECRET:', !!c.env.JWT_SECRET)
    
    const lowStockOnly = c.req.query('low_stock') === 'true'
    console.log('🚀 STOCK GET: Low stock filter:', lowStockOnly)
    
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

    console.log('🚀 STOCK GET: Executing query:', query)
    const stockData = await c.env.DB.prepare(query).all()
    console.log('🚀 STOCK GET: Query success, results count:', stockData.results?.length || 0)

    return c.json({ stock: stockData.results })

  } catch (error: any) {
    console.error('❌ STOCK GET ERROR - Full details:', error)
    console.error('❌ STOCK GET ERROR - Error name:', error.name)
    console.error('❌ STOCK GET ERROR - Error message:', error.message)
    console.error('❌ STOCK GET ERROR - Error stack:', error.stack)
    console.error('❌ STOCK GET ERROR - Environment bindings check:')
    console.error('  - c.env.DB exists:', !!c.env?.DB)
    console.error('  - c.env.JWT_SECRET exists:', !!c.env?.JWT_SECRET)
    console.error('  - c.env.ENVIRONMENT:', c.env?.ENVIRONMENT)
    return c.json({ 
      error: 'Internal server error', 
      details: error.message,
      bindings: {
        DB: !!c.env?.DB,
        JWT_SECRET: !!c.env?.JWT_SECRET,
        ENVIRONMENT: c.env?.ENVIRONMENT
      }
    }, 500)
  }
})

// Add stock (stock masuk)
stock.post('/in', async (c) => {
  try {
    // Handle authentication - use default user_id when auth is disabled
    const payload = c.get('jwtPayload')
    const userId = payload?.userId || 1  // Default to admin user when auth disabled
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
    `).bind(product_id, quantity, userId, notes || null).run()

    return c.json({ message: 'Stock added successfully' })

  } catch (error: any) {
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

  } catch (error: any) {
    console.error('Get stock movements error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default stock
