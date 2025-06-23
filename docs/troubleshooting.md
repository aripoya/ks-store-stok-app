# 🛠️ Troubleshooting Guide - Bakpia Stock Management System

Dokumentasi lengkap untuk mengatasi masalah-masalah umum yang mungkin terjadi pada sistem manajemen stok bakpia.

## 📚 Daftar Isi

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [API Integration Issues](#api-integration-issues)
5. [Development Environment Issues](#development-environment-issues)
6. [Production Deployment Issues](#production-deployment-issues)

---

## 🔧 Backend Issues

### 1. Wrangler Dev Worker Crash/Exit

**🚨 Masalah:** Backend worker keluar secara tiba-tiba setelah menampilkan "Ready on http://localhost:xxxx"

**📋 Gejala:**
- Worker keluar dengan exit code 0 (graceful shutdown)
- Tidak ada error message yang jelas
- Backend tidak responsif setelah startup

**🔍 Root Cause Analysis:**
1. **Wrangler Dev Proxy Bug** - Bug pada Cloudflare Wrangler dev proxy yang menyebabkan worker tidak stay alive
2. **Missing Keep-Alive Mechanism** - Worker tidak memiliki mekanisme untuk tetap berjalan
3. **Unused Import Dependencies** - Import yang tidak digunakan dapat menyebabkan module evaluation error

**✅ Solusi Lengkap:**

```bash
# SOLUTION 1: Gunakan --local dan --live-reload flags
npx wrangler dev --local --port 8787 --live-reload --compatibility-date=2024-12-01

# SOLUTION 2: Untuk port spesifik yang stabil
npx wrangler dev --local --port 8080 --live-reload --compatibility-date=2024-12-01
```

**📝 Penjelasan Flags:**
- `--local`: Bypass wrangler dev proxy bug
- `--live-reload`: Keep-alive mechanism untuk prevent auto-shutdown
- `--port`: Gunakan port konsisten untuk development
- `--compatibility-date`: Ensure compatibility dengan Cloudflare Workers runtime

**⚠️ Tips Pencegahan:**
- Selalu gunakan `--live-reload` untuk development
- Hindari unused imports di file entry point (`index.ts`)
- Monitor wrangler logs untuk identify crashes early

---

### 2. API Routes Returning 404 Not Found

**🚨 Masalah:** Semua API endpoints mengembalikan `{"error":"Not Found"}` meski backend running

**📋 Gejala:**
- `curl http://localhost:8787/api/categories` → 404 Not Found
- Frontend menampilkan "Failed to fetch"
- Backend logs menunjukkan requests masuk tapi tidak ada response

**🔍 Root Cause:** API routes ter-comment out di `backend/src/index.ts`

**✅ Solusi:**

Pastikan semua route registrations di `backend/src/index.ts` tidak ter-comment:

```typescript
// Import routes (PASTIKAN TIDAK TER-COMMENT)
import categoriesRoutes from './routes/categories'
import productRoutes from './routes/products'
import stockRoutes from './routes/stock'
import transactionRoutes from './routes/transactions'
import reportRoutes from './routes/reports'

// API Routes (PASTIKAN TIDAK TER-COMMENT)
app.route('/api/categories', categoriesRoutes)
app.route('/api/products', productRoutes)
app.route('/api/stock', stockRoutes)
app.route('/api/transactions', transactionRoutes)
app.route('/api/reports', reportRoutes)
```

**🔧 Verification Steps:**
1. Check `backend/src/index.ts` untuk uncommented routes
2. Restart backend dengan `--live-reload`
3. Test dengan `curl http://localhost:8787/api/categories`

---

### 3. CORS Issues - Cross-Origin Resource Sharing

**🚨 Masalah:** Frontend tidak bisa mengakses backend API meski backend returning 200 OK

**📋 Gejala:**
- Backend logs: `[wrangler:info] GET /api/categories 200 OK (4ms)`
- Frontend: "Failed to fetch" atau CORS policy errors
- Browser developer tools: CORS policy violation

**🔍 Root Cause:** CORS middleware ter-comment out atau tidak properly configured

**✅ Solusi:**

Uncomment dan configure CORS middleware di `backend/src/index.ts`:

```typescript
import { cors } from 'hono/cors'

// Middleware - PASTIKAN CORS ENABLED
app.use('*', cors({
  origin: '*',  // Untuk development, gunakan '*'
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

**🔧 Verification:**
```bash
# Test CORS headers
curl -H "Origin: http://localhost:5173" -v http://localhost:8787/api/categories

# Should return:
# < Access-Control-Allow-Origin: *
```

**⚠️ Production CORS:**
Untuk production, ganti `origin: '*'` dengan domain spesifik:
```typescript
origin: ['https://your-frontend-domain.com', 'http://localhost:5173']
```

---

## 🎨 Frontend Issues

### 1. "global is not defined" Error

**🚨 Masalah:** Runtime error "global is not defined" di browser console

**📋 Gejala:**
- White screen atau component tidak render
- Browser console menampilkan "ReferenceError: global is not defined"

**🔍 Root Cause:** Browser tidak memiliki Node.js `global` object yang digunakan oleh beberapa modules

**✅ Solusi:**

Add polyfill di `frontend/vite.config.js`:

```javascript
export default {
  // ... other config
  define: {
    global: 'globalThis',
    // atau alternatif:
    // global: 'window'
  }
}
```

**Alternative Solution** di `frontend/src/main.jsx`:

```javascript
// Add before React imports
if (typeof global === 'undefined') {
  window.global = window;
}
```

---

### 2. Infinite API Request Loops

**🚨 Masalah:** Frontend melakukan infinite API requests yang overload backend

**📋 Gejala:**
- Browser network tab menunjukkan requests berulang tanpa henti
- High CPU usage pada browser
- Backend overwhelmed dengan requests

**🔍 Root Cause:** useEffect dependencies yang tidak stable di React hooks

**✅ Solusi:**

Fix useEffect dependencies dengan useCallback:

```javascript
// ❌ WRONG - Causes infinite loop
const fetchProducts = () => {
  // fetch logic
}

useEffect(() => {
  fetchProducts()
}, [fetchProducts]) // fetchProducts changes on every render

// ✅ CORRECT - Stable dependency
const fetchProducts = useCallback(() => {
  // fetch logic
}, []) // Empty dependency array or stable dependencies only

useEffect(() => {
  fetchProducts()
}, [fetchProducts]) // Now fetchProducts is stable
```

**🔧 Best Practices:**
- Use `useCallback` untuk functions yang digunakan di `useEffect`
- Avoid calling fetch functions inside CRUD operations
- Implement optimistic updates instead of refetching

---

### 3. Frontend Dev Server Not Starting

**🚨 Masalah:** `npm run dev` tidak start atau server keluar tiba-tiba

**📋 Gejala:**
- Port 5173 tidak accessible
- `lsof -ti:5173` mengembalikan empty result
- Vite build errors

**✅ Solusi:**

```bash
# 1. Kill existing processes
pkill -f "vite\|node.*5173"

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies (jika perlu)
rm -rf node_modules package-lock.json
npm install

# 4. Start dev server
npm run dev
```

**🔧 Alternative Solutions:**
- Check port conflicts: `lsof -ti:5173`
- Try different port: `npm run dev -- --port 5174`
- Check for syntax errors in package.json

---

## 🗄️ Database Issues

### 1. D1 Database Connection Issues

**🚨 Masalah:** `env.DB is undefined` atau database queries failing

**📋 Gejala:**
- 500 Internal Server Error pada API calls
- Logs: "Cannot read properties of undefined (reading 'prepare')"

**🔍 Root Cause:** D1 binding tidak properly configured di `wrangler.toml`

**✅ Solusi:**

Check dan fix `wrangler.toml`:

```toml
# Development environment
[[d1_databases]]
binding = "DB"
database_name = "bakpia-stok-db"
database_id = "your-database-id"

# Production environment
[env.production]
[[env.production.d1_databases]]
binding = "DB" 
database_name = "bakpia-stok-db"
database_id = "your-production-database-id"
```

**🔧 Verification:**
```bash
# Test D1 connection
npx wrangler d1 execute bakpia-stok-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

---

### 2. Database Schema Not Initialized

**🚨 Masalah:** Tables tidak exist atau "no such table" errors

**📋 Gejala:**
- API returning empty results
- SQLite error: "no such table: categories"

**✅ Solusi:**

Initialize database schema:

```bash
# Local database
npx wrangler d1 execute bakpia-stok-db --local --file=./schema.sql

# Remote database (production)
npx wrangler d1 execute bakpia-stok-db --remote --file=./schema.sql
```

**🔧 Verify Schema:**
```bash
# Check tables exist
npx wrangler d1 execute bakpia-stok-db --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check categories data
npx wrangler d1 execute bakpia-stok-db --local --command="SELECT * FROM categories LIMIT 5;"
```

---

## 🔗 API Integration Issues

### 1. Frontend API Base URL Misconfiguration

**🚨 Masalah:** Frontend calling wrong API endpoints atau wrong ports

**📋 Gejala:**
- Network errors in browser developer tools
- API calls going to wrong URLs
- Connection refused errors

**✅ Solusi:**

Check `frontend/src/services/api.js`:

```javascript
// Ensure correct API base URL
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalDev 
  ? 'http://localhost:8787'  // Match backend port
  : 'https://your-production-api.workers.dev';
```

**🔧 Debug Steps:**
1. Console.log API_BASE_URL untuk verify
2. Check backend port dengan `lsof -ti:8787`
3. Test direct API call: `curl http://localhost:8787/api/categories`

---

### 2. Authentication/Authorization Issues

**🚨 Masalah:** 401 Unauthorized atau "no authorization included in request"

**📋 Gejala:**
- API returning 401/403 errors
- JWT token issues
- Authentication middleware blocking requests

**✅ Temporary Solution (Development):**

Disable auth untuk testing di middleware:

```typescript
// In auth middleware
export const authMiddleware = async (c, next) => {
  // TEMPORARY: Skip auth for all requests during development
  console.log('🔧 AUTH STATUS: COMPLETELY DISABLED FOR ALL REQUESTS')
  return next()
  
  // Original auth logic commented out...
}
```

**✅ Production Solution:**

Ensure proper JWT_SECRET di `wrangler.toml`:

```toml
[vars]
JWT_SECRET = "your-secret-key"

[env.production.vars]
JWT_SECRET = "your-production-secret-key"
```

---

## 💻 Development Environment Issues

### 1. Port Conflicts

**🚨 Masalah:** "Address already in use" errors

**✅ Solusi:**

```bash
# Find process using port
lsof -ti:8787

# Kill process
kill -9 $(lsof -ti:8787)

# Or kill all wrangler processes
pkill -f wrangler
```

---

### 2. Wrangler Version Compatibility

**🚨 Masalah:** Different behavior between Wrangler versions

**✅ Solusi:**

Use consistent Wrangler version:

```bash
# Check version
npx wrangler --version

# Update to latest
npm install -g wrangler@latest

# Or use specific version
npm install -g wrangler@4.20.5
```

---

## 🚀 Production Deployment Issues

### 1. Missing Environment Bindings

**🚨 Masalah:** Production deployment failing atau 500 errors

**✅ Solusi:**

Ensure `wrangler.toml` has production bindings:

```toml
[env.production]
[[env.production.d1_databases]]
binding = "DB"
database_name = "bakpia-stok-db"
database_id = "your-production-db-id"

[env.production.vars]
JWT_SECRET = "your-production-jwt-secret"
ENVIRONMENT = "production"
```

**🔧 Deploy Commands:**
```bash
# Deploy to production environment
npx wrangler deploy --env production

# Verify deployment
curl https://your-api.workers.dev/health
```

---

## 🎯 General Best Practices

### 1. Development Workflow

```bash
# 1. Start backend
cd backend
npx wrangler dev --local --port 8787 --live-reload --compatibility-date=2024-12-01

# 2. Start frontend (new terminal)
cd frontend
npm run dev

# 3. Open browser preview (if using Windsurf)
# Navigate to localhost:5173
```

### 2. Debugging Checklist

When encountering issues, check in this order:

1. **Backend Status**: Is wrangler dev running? Check `lsof -ti:8787`
2. **API Routes**: Are routes uncommented in `index.ts`?
3. **CORS**: Is CORS middleware enabled?
4. **Database**: Is D1 binding configured properly?
5. **Frontend**: Is dev server running on correct port?
6. **API Config**: Is frontend calling correct backend URL?

### 3. Monitoring Commands

```bash
# Check backend status
curl http://localhost:8787/health

# Check API endpoints
curl http://localhost:8787/api/categories

# Check frontend status
curl http://localhost:5173

# Check processes
lsof -ti:8787  # Backend
lsof -ti:5173  # Frontend
```

---

## 📞 Quick Reference

**Backend Start Command:**
```bash
npx wrangler dev --local --port 8787 --live-reload --compatibility-date=2024-12-01
```

**Frontend Start Command:**
```bash
npm run dev
```

**Database Schema Init:**
```bash
npx wrangler d1 execute bakpia-stok-db --local --file=./schema.sql
```

**Kill All Processes:**
```bash
pkill -f wrangler && pkill -f "vite\|node.*5173"
```

---

## 📝 Issue Reporting Template

Ketika menemui masalah baru, gunakan template ini untuk dokumentasi:

```markdown
### [Issue Title]

**🚨 Masalah:** [Deskripsi singkat masalah]

**📋 Gejala:**
- [Gejala 1]
- [Gejala 2]

**🔍 Root Cause:** [Analisis penyebab]

**✅ Solusi:**
[Step-by-step solution]

**🔧 Verification:**
[Cara verify solution works]
```

---

*Dokumentasi ini akan terus diupdate seiring dengan ditemukannya masalah dan solusi baru. Pastikan selalu check troubleshooting guide ini ketika menghadapi issues.*
