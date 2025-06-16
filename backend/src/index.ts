import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'

// Import routes
import authRoutes from './routes/auth'
import productRoutes from './routes/products'
import stockRoutes from './routes/stock'
import transactionRoutes from './routes/transactions'
import userRoutes from './routes/users'
import reportRoutes from './routes/reports'

// Types for Cloudflare Workers environment
type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  ENVIRONMENT: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('*', logger())
app.use('*', prettyJSON())

// Health check
app.get('/', (c) => {
  return c.json({ 
    message: 'Bakpia Kurniasari Stock Management API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'development'
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/products', productRoutes)
app.route('/api/stock', stockRoutes)
app.route('/api/transactions', transactionRoutes)
app.route('/api/users', userRoutes)
app.route('/api/reports', reportRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ 
    error: 'Internal Server Error',
    message: c.env.ENVIRONMENT === 'development' ? err.message : 'Something went wrong'
  }, 500)
})

export default app

