import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const reports = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication
reports.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET }))

// Dashboard overview data
reports.get('/dashboard', async (c) => {
  try {
    // Get today's sales
    const todaySales = await c.env.DB.prepare(`
      SELECT COUNT(*) as total_transactions, COALESCE(SUM(total_amount), 0) as total_revenue
      FROM transactions
      WHERE DATE(transaction_date) = DATE('now')
    `).first()

    // Get low stock products
    const lowStockProducts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM stock s
      JOIN products p ON s.product_id = p.id
      WHERE s.current_stock <= s.min_stock AND p.is_active = 1
    `).first()

    // Get total products
    const totalProducts = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM products
      WHERE is_active = 1
    `).first()

    // Get recent transactions
    const recentTransactions = await c.env.DB.prepare(`
      SELECT t.transaction_code, t.total_amount, t.transaction_date, u.full_name as kasir_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.transaction_date DESC
      LIMIT 5
    `).all()

    return c.json({
      dashboard: {
        todaySales: {
          totalTransactions: todaySales?.total_transactions || 0,
          totalRevenue: todaySales?.total_revenue || 0
        },
        lowStockCount: lowStockProducts?.count || 0,
        totalProducts: totalProducts?.count || 0,
        recentTransactions: recentTransactions.results
      }
    })

  } catch (error) {
    console.error('Get dashboard error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Sales reports
reports.get('/sales', async (c) => {
  try {
    const startDate = c.req.query('start_date') || new Date().toISOString().split('T')[0]
    const endDate = c.req.query('end_date') || new Date().toISOString().split('T')[0]

    const salesData = await c.env.DB.prepare(`
      SELECT 
        DATE(t.transaction_date) as date,
        COUNT(*) as total_transactions,
        SUM(t.total_amount) as total_revenue
      FROM transactions t
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
      GROUP BY DATE(t.transaction_date)
      ORDER BY date DESC
    `).bind(startDate, endDate).all()

    return c.json({ salesReport: salesData.results })

  } catch (error) {
    console.error('Get sales report error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Best selling products
reports.get('/products/bestseller', async (c) => {
  try {
    const startDate = c.req.query('start_date')
    const endDate = c.req.query('end_date')

    let query = `
      SELECT 
        p.name as product_name,
        SUM(ti.quantity) as total_sold,
        SUM(ti.subtotal) as total_revenue
      FROM transaction_items ti
      JOIN products p ON ti.product_id = p.id
      JOIN transactions t ON ti.transaction_id = t.id
    `

    const params: any[] = []

    if (startDate && endDate) {
      query += ' WHERE DATE(t.transaction_date) BETWEEN ? AND ?'
      params.push(startDate, endDate)
    }

    query += `
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `

    const bestSellers = await c.env.DB.prepare(query).bind(...params).all()

    return c.json({ bestSellers: bestSellers.results })

  } catch (error) {
    console.error('Get best sellers error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default reports

