import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Simple test app to verify the structure
const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ 
    message: 'Bakpia Kurniasari Stock Management API - Test Server',
    version: '1.0.0',
    status: 'OK'
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Test routes
app.get('/api/test', (c) => {
  return c.json({ message: 'API routes are working' })
})

const port = 3001
console.log(`Test server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})

