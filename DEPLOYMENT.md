# Panduan Deployment ke Cloudflare Pages dan Workers

## 📋 Prerequisites

1. **Akun Cloudflare** dengan akses ke:
   - Cloudflare Pages
   - Cloudflare Workers
   - Cloudflare D1 Database

2. **Tools yang dibutuhkan**:
   - Node.js 18+
   - npm atau pnpm
   - Wrangler CLI

## 🛠 Setup Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Login ke Cloudflare
wrangler auth login
```

## 🗄️ Setup Database (Cloudflare D1)

### 1. Buat Database D1
```bash
cd backend
wrangler d1 create bakpia-stok-db
```

### 2. Update wrangler.toml
Setelah database dibuat, copy database ID ke `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "bakpia-stok-db"
database_id = "your-database-id-here"  # Ganti dengan ID yang didapat
```

### 3. Setup Database Schema
```bash
# Apply schema ke database
wrangler d1 execute bakpia-stok-db --file=schema.sql

# Verify database setup
wrangler d1 execute bakpia-stok-db --command="SELECT * FROM categories"
```

## 🚀 Deploy Backend (Cloudflare Workers)

### 1. Update Environment Variables
Edit `wrangler.toml` dan set environment variables:
```toml
[vars]
JWT_SECRET = "your-super-secret-jwt-key-here"
ENVIRONMENT = "production"
```

### 2. Deploy ke Cloudflare Workers
```bash
cd backend
wrangler deploy
```

### 3. Test API Endpoint
Setelah deploy, test API endpoint:
```bash
curl https://your-worker-name.your-subdomain.workers.dev/health
```

## 🌐 Deploy Frontend (Cloudflare Pages)

### Method 1: Git Integration (Recommended)

1. **Push code ke Git repository** (GitHub, GitLab, atau Bitbucket)

2. **Connect ke Cloudflare Pages**:
   - Login ke Cloudflare Dashboard
   - Go to Pages → Create a project
   - Connect your Git repository
   - Select `bakpia-stok-app` repository

3. **Configure Build Settings**:
   ```
   Framework preset: Vite
   Build command: cd frontend && pnpm install && pnpm run build
   Build output directory: frontend/dist
   Root directory: /
   ```

4. **Environment Variables** (di Cloudflare Pages dashboard):
   ```
   VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev
   ```

### Method 2: Manual Upload

1. **Build Frontend**:
   ```bash
   cd frontend
   pnpm install
   pnpm run build
   ```

2. **Upload ke Cloudflare Pages**:
   - Go to Cloudflare Pages dashboard
   - Create a project → Upload assets
   - Upload `frontend/dist` folder

## 🔧 Configuration

### Frontend Environment Variables
Buat file `frontend/.env.production`:
```env
VITE_API_URL=https://your-worker-name.your-subdomain.workers.dev
```

### Backend CORS Configuration
Pastikan CORS sudah dikonfigurasi untuk domain frontend di `src/index.ts`:
```typescript
app.use('*', cors({
  origin: ['https://your-pages-domain.pages.dev', 'https://your-custom-domain.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
```

## 🔐 Security Setup

### 1. Generate Strong JWT Secret
```bash
# Generate random JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Update Admin Password
Login ke aplikasi dan ganti password default admin:
- Username: `admin`
- Password default: `admin123`

## 📊 Monitoring dan Logs

### Backend Logs
```bash
# View real-time logs
wrangler tail

# View specific deployment logs
wrangler tail --format=pretty
```

### Database Queries
```bash
# Execute SQL queries
wrangler d1 execute bakpia-stok-db --command="SELECT COUNT(*) FROM products"

# Backup database
wrangler d1 export bakpia-stok-db --output=backup.sql
```

## 🌍 Custom Domain (Optional)

### 1. Setup Custom Domain untuk Pages
- Go to Pages → your-project → Custom domains
- Add your domain (e.g., `stok.bakpiakurniasari.com`)
- Update DNS records as instructed

### 2. Setup Custom Domain untuk Workers
- Go to Workers → your-worker → Settings → Triggers
- Add custom domain (e.g., `api.bakpiakurniasari.com`)

## 🔄 CI/CD Pipeline

### GitHub Actions Example
Buat `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Deploy Backend
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: 'backend'
          
      - name: Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
        # Pages will auto-deploy via Git integration
```

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
# Health check
curl https://your-api-domain.com/health

# Test login
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. Test Frontend
- Open browser ke `https://your-pages-domain.pages.dev`
- Test login dengan admin credentials
- Verify navigation dan dashboard data

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check CORS configuration di backend
   - Verify frontend API URL

2. **Database Connection Issues**:
   - Verify database ID di wrangler.toml
   - Check database binding name

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies installed

4. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check token expiration

### Debug Commands
```bash
# Check Wrangler configuration
wrangler whoami

# Test local development
wrangler dev

# Check database connection
wrangler d1 execute bakpia-stok-db --command="PRAGMA table_info(users)"
```

## 📈 Performance Optimization

### 1. Frontend Optimization
- Enable Cloudflare caching
- Optimize images and assets
- Use Cloudflare CDN

### 2. Backend Optimization
- Implement request caching
- Optimize database queries
- Use Cloudflare KV for session storage (optional)

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secret
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS only
- [ ] Set up rate limiting (optional)
- [ ] Regular database backups

## 📞 Support

Jika mengalami masalah deployment:
1. Check Cloudflare dashboard untuk error logs
2. Verify semua environment variables
3. Test API endpoints secara manual
4. Check browser console untuk frontend errors

---

**Happy Deploying! 🚀**

