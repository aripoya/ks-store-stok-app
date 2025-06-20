import { Hono } from 'hono';
import { D1Database } from '@cloudflare/workers-types';

type Bindings = {
  DB: D1Database;
};

// Create a new router for categories
const categoriesRouter = new Hono<{ Bindings: Bindings }>();

/**
 * GET /categories
 * Returns all categories
 */
categoriesRouter.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM categories ORDER BY id ASC'
    ).all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

/**
 * GET /categories/:id
 * Returns a single category by ID
 */
categoriesRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const category = await c.env.DB.prepare(
      'SELECT * FROM categories WHERE id = ?'
    ).bind(id).first();
    
    if (!category) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    return c.json(category);
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return c.json({ error: 'Failed to fetch category' }, 500);
  }
});

/**
 * POST /categories
 * Creates a new category
 */
categoriesRouter.post('/', async (c) => {
  try {
    const data = await c.req.json();
    const { name, description } = data;
    
    if (!name) {
      return c.json({ error: 'Category name is required' }, 400);
    }
    
    const result = await c.env.DB.prepare(
      'INSERT INTO categories (name, description) VALUES (?, ?)'
    ).bind(name, description || '').run();
    
    if (result.success) {
      return c.json({ 
        id: result.meta.last_row_id, 
        name, 
        description 
      }, 201);
    } else {
      throw new Error('Failed to insert category');
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

/**
 * PUT /categories/:id
 * Updates an existing category
 */
categoriesRouter.put('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const data = await c.req.json();
    const { name, description } = data;
    
    if (!name) {
      return c.json({ error: 'Category name is required' }, 400);
    }
    
    // Check if category exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    await c.env.DB.prepare(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?'
    ).bind(name, description || '', id).run();
    
    return c.json({ id: Number(id), name, description });
  } catch (error) {
    console.error(`Error updating category ${id}:`, error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

/**
 * DELETE /categories/:id
 * Deletes a category
 */
categoriesRouter.delete('/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    // Check if category exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM categories WHERE id = ?'
    ).bind(id).first();
    
    if (!existing) {
      return c.json({ error: 'Category not found' }, 404);
    }
    
    // Check if there are products using this category
    const products = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?'
    ).bind(id).first();
    
    if (products && (products as any).count > 0) {
      return c.json({ 
        error: 'Cannot delete category that has products. Remove or reassign products first.' 
      }, 400);
    }
    
    await c.env.DB.prepare(
      'DELETE FROM categories WHERE id = ?'
    ).bind(id).run();
    
    return c.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(`Error deleting category ${id}:`, error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

export default categoriesRouter;
