import { Hono } from 'hono'
import { jwt, sign, verify } from 'hono/jwt'
import bcrypt from 'bcryptjs'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const auth = new Hono<{ Bindings: Bindings }>()

// Login endpoint
auth.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()

    if (!username || !password) {
      return c.json({ error: 'Username and password are required' }, 400)
    }

    // Find user in database
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE username = ? AND is_active = 1'
    ).bind(username).first()

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash as string)
    
    if (!isValidPassword) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }

    // Generate JWT token
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      fullName: user.full_name,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }

    const token = await sign(payload, c.env.JWT_SECRET)

    return c.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        shift: user.shift
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get current user info
auth.get('/me', jwt({ secret: async (c) => c.env.JWT_SECRET }), async (c) => {
  try {
    const payload = c.get('jwtPayload')
    
    const user = await c.env.DB.prepare(
      'SELECT id, username, full_name, role, shift, is_active FROM users WHERE id = ?'
    ).bind(payload.userId).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        shift: user.shift,
        isActive: user.is_active
      }
    })

  } catch (error) {
    console.error('Get user error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Logout endpoint (client-side token removal)
auth.post('/logout', (c) => {
  return c.json({ message: 'Logout successful' })
})

export default auth

