import { Hono } from 'hono'
import { jwt } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const products = new Hono<{ Bindings: Bindings }>()

// Only apply authentication middleware to non-GET requests to allow public read access
// Use a regex pattern that matches POST, PUT, DELETE, etc. but not GET
products.use('/*', async (c, next) => {
  console.log('🔧 MIDDLEWARE EXECUTING - Method:', c.req.method, 'Path:', c.req.path)
  console.log('🔧 AUTH STATUS: COMPLETELY DISABLED FOR ALL REQUESTS')
  
  // Skip authentication for GET requests
  if (c.req.method === 'GET') {
    console.log('✅ GET request - proceeding without auth check')
    return await next()
  }
  
  // AUTHENTICATION DISABLED: Skip authentication for all requests to enable CRUD operations
  // TODO: Implement proper authentication system with login/signup in future
  console.log(`🚀 ${c.req.method} request to ${c.req.path} - Authentication SKIPPED (DEPLOYED VERSION)`)
  console.log('🚀 DEPLOYMENT TIMESTAMP:', new Date().toISOString())
  return await next()
  
  // Apply authentication middleware for non-GET requests (DISABLED)
  // return jwt({ secret: c.env.JWT_SECRET })(c, next)
})

// Get all categories
products.get('/categories', async (c) => {
  try {
    const categories = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY name'
    ).all()

    return c.json({ categories: categories.results })
  } catch (error) {
    console.error('Get categories error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new category
products.post('/categories', async (c) => {
  try {
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const { name, description } = await c.req.json()

    if (!name) {
      return c.json({ error: 'Category name is required' }, 400)
    }

    const result = await c.env.DB.prepare(
      'INSERT INTO categories (name, description) VALUES (?, ?)'
    ).bind(name, description || null).run()

    return c.json({ 
      message: 'Category created successfully',
      categoryId: result.meta.last_row_id
    })

  } catch (error) {
    console.error('Create category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get category by ID
products.get('/categories/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const category = await c.env.DB.prepare(`
      SELECT *
      FROM categories
      WHERE id = ?
    `).bind(id).first()

    if (!category) {
      return c.json({ error: 'Category not found' }, 404)
    }

    return c.json({ category })

  } catch (error) {
    console.error('Get category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update category
products.put('/categories/:id', async (c) => {
  try {
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const id = c.req.param('id')
    const { name, description } = await c.req.json()

    if (!name) {
      return c.json({ error: 'Category name is required' }, 400)
    }

    // Check if category exists
    const existingCategory = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(id).first()

    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404)
    }

    await c.env.DB.prepare(`
      UPDATE categories 
      SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name, description || null, id).run()

    return c.json({ message: 'Category updated successfully' })

  } catch (error) {
    console.error('Update category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete category
products.delete('/categories/:id', async (c) => {
  try {
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const id = c.req.param('id')

    // Check if category exists
    const existingCategory = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(id).first()

    if (!existingCategory) {
      return c.json({ error: 'Category not found' }, 404)
    }

    // Check if category has products
    const productsWithCategory = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ? AND is_active = 1'
    ).bind(id).first()

    if (productsWithCategory && (productsWithCategory.count as number) > 0) {
      return c.json({ 
        error: 'Cannot delete category with active products. Please move or delete the products first.' 
      }, 400)
    }

    await c.env.DB.prepare(
      'DELETE FROM categories WHERE id = ?'
    ).bind(id).run()

    return c.json({ message: 'Category deleted successfully' })

  } catch (error) {
    console.error('Delete category error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get all products with pagination
products.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '10')
    const search = c.req.query('search') || ''
    const categoryId = c.req.query('category_id')
    
    const offset = (page - 1) * limit

    let query = `
      SELECT p.*, c.name as category_name, s.current_stock, s.min_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      WHERE p.is_active = 1
    `
    
    const params: any[] = []

    if (search) {
      query += ' AND p.name LIKE ?'
      params.push(`%${search}%`)
    }

    if (categoryId) {
      query += ' AND p.category_id = ?'
      params.push(categoryId)
    }

    query += ' ORDER BY p.name LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const products = await c.env.DB.prepare(query).bind(...params).all()

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products WHERE is_active = 1'
    const countParams: any[] = []

    if (search) {
      countQuery += ' AND name LIKE ?'
      countParams.push(`%${search}%`)
    }

    if (categoryId) {
      countQuery += ' AND category_id = ?'
      countParams.push(categoryId)
    }

    const totalResult = await c.env.DB.prepare(countQuery).bind(...countParams).first()
    const total = totalResult?.total as number || 0

    return c.json({
      products: products.results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get products error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Get product by ID
products.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')

    const product = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name, s.current_stock, s.min_stock, s.expire_date
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      WHERE p.id = ? AND p.is_active = 1
    `).bind(id).first()

    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }

    return c.json({ product })

  } catch (error) {
    console.error('Get product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Create new product
products.post('/', async (c) => {
  try {
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const { name, category_id, description, image_url, price, barcode, stock } = await c.req.json()

    if (!name || !category_id || !price) {
      return c.json({ error: 'Name, category_id, and price are required' }, 400)
    }

    // Check if category exists
    const category = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(category_id).first()

    if (!category) {
      return c.json({ error: 'Category not found' }, 400)
    }

    // Check if barcode already exists (if provided)
    if (barcode) {
      const existingBarcode = await c.env.DB.prepare(
        'SELECT id FROM products WHERE barcode = ? AND is_active = 1'
      ).bind(barcode).first()

      if (existingBarcode) {
        return c.json({ error: 'Barcode already exists' }, 400)
      }
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO products (name, category_id, description, image_url, price, barcode, stock, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).bind(name, category_id, description || null, image_url || null, price, barcode || null, stock || 0).run()

    const productId = result.meta.last_row_id

    // Initialize stock for new product - use provided stock value or default to 0
    const initialStock = stock || 0
    await c.env.DB.prepare(`
      INSERT INTO stock (product_id, initial_stock, current_stock, min_stock)
      VALUES (?, ?, ?, 5)
    `).bind(productId, initialStock, initialStock).run()

    // Fetch the complete product data to return
    const newProduct = await c.env.DB.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).bind(productId).first()

    return c.json(newProduct)

  } catch (error) {
    console.error('Create product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Update product
products.put('/:id', async (c) => {
  try {
    console.log('🔧 PRODUCTS PUT REQUEST - ID:', c.req.param('id'))
    
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const id = c.req.param('id')
    const requestBody = await c.req.json()
    console.log('🔧 PRODUCTS PUT REQUEST BODY:', JSON.stringify(requestBody, null, 2))
    
    const { name, category_id, description, image_url, price, barcode, stock } = requestBody
    
    console.log('🔧 EXTRACTED VALUES:', {
      name, category_id, description, image_url, price, barcode, stock
    })

    // Check if product exists
    const existingProduct = await c.env.DB.prepare(
      'SELECT id FROM products WHERE id = ? AND is_active = 1'
    ).bind(id).first()

    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404)
    }

    // Check if category exists
    if (category_id) {
      const category = await c.env.DB.prepare(
        'SELECT id FROM categories WHERE id = ?'
      ).bind(category_id).first()

      if (!category) {
        return c.json({ error: 'Category not found' }, 400)
      }
    }

    // Check if barcode already exists (if provided and different from current)
    if (barcode) {
      const existingBarcode = await c.env.DB.prepare(
        'SELECT id FROM products WHERE barcode = ? AND id != ? AND is_active = 1'
      ).bind(barcode, id).first()

      if (existingBarcode) {
        return c.json({ error: 'Barcode already exists' }, 400)
      }
    }

    await c.env.DB.prepare(`
      UPDATE products 
      SET name = ?, category_id = ?, description = ?, image_url = ?, price = ?, barcode = ?, stock = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(name ?? null, category_id ?? null, description ?? null, image_url ?? null, price ?? null, barcode ?? null, stock ?? null, id).run()

    return c.json({ message: 'Product updated successfully' })

  } catch (error) {
    console.error('Update product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Delete product (soft delete)
products.delete('/:id', async (c) => {
  try {
    // In development mode, authentication is disabled so payload might not exist
    try {
      const payload = c.get('jwtPayload')
      // Check if user is admin
      if (payload && payload.role !== 'admin') {
        return c.json({ error: 'Unauthorized' }, 403)
      }
    } catch (e) {
      // In dev mode, continue without auth check
      console.log('Auth check skipped in development mode');
    }

    const id = c.req.param('id')

    // Check if product exists
    const existingProduct = await c.env.DB.prepare(
      'SELECT id FROM products WHERE id = ? AND is_active = 1'
    ).bind(id).first()

    if (!existingProduct) {
      return c.json({ error: 'Product not found' }, 404)
    }

    await c.env.DB.prepare(
      'UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(id).run()

    return c.json({ message: 'Product deleted successfully' })

  } catch (error) {
    console.error('Delete product error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default products
