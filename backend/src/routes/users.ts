import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const users = new Hono<{ Bindings: Bindings }>()

// Middleware for authentication
users.use('*', jwt({ secret: async (c) => c.env.JWT_SECRET }))

// Get all users
users.get('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    // Check if user is admin
    if (payload.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    const users = await c.env.DB.prepare(`
      SELECT id, username, full_name, role, shift, is_active, created_at
      FROM users
      ORDER BY full_name
    `).all()

    return c.json({ users: users.results })

  } catch (error) {
    console.error('Get users error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new user
users.post('/', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    // Check if user is admin
    if (payload.role !== 'admin') {
      return c.json({ error: 'Unauthorized' }, 403)
    }

    const { username, password, full_name, role, shift } = await c.req.json()

    if (!username || !password || !full_name || !role) {
      return c.json({ error: 'Username, password, full_name, and role are required' }, 400)
    }

    // Check if username already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE username = ?'
    ).bind(username).first()

    if (existingUser) {
      return c.json({ error: 'Username already exists' }, 400)
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    const result = await c.env.DB.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, shift)
      VALUES (?, ?, ?, ?, ?)
    `).bind(username, passwordHash, full_name, role, shift || null).run()

    return c.json({ 
      message: 'User created successfully',
      userId: result.meta.last_row_id
    })

  } catch (error) {
    console.error('Create user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default users

