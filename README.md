# Bakpia Kurniasari - Sistem Manajemen Stok

Aplikasi web untuk manajemen stok outlet Bakpia Kurniasari yang dibangun dengan React dan Hono, siap untuk deployment di Cloudflare Pages dan Workers.

## 🚀 Fitur Utama

### ✅ Sudah Diimplementasikan
- **Dashboard** - Overview stok, penjualan hari ini, dan alert stok menipis
- **Sistem Autentikasi** - Login dengan JWT
- **Layout Responsif** - Sidebar navigation dengan brand colors Bakpia Kurniasari
- **Backend API** - RESTful API dengan Hono.js untuk Cloudflare Workers
- **Database Schema** - Struktur database lengkap untuk D1 (SQLite)

### 🔄 Dalam Pengembangan
- Manajemen Produk dan Kategori
- Sistem Stok (masuk, keluar, tracking)
- Sistem Kasir (POS)
- Laporan dan Analytics
- Manajemen Pengguna

## 🛠 Tech Stack

### Frontend
- **React 19** dengan Vite
- **Tailwind CSS** untuk styling
- **shadcn/ui** untuk komponen UI
- **React Router** untuk routing
- **Lucide React** untuk icons
- **Recharts** untuk grafik

### Backend
- **Hono.js** - Web framework untuk Cloudflare Workers
- **Cloudflare D1** - Database SQLite
- **JWT** untuk autentikasi
- **bcryptjs** untuk hashing password

### Deployment
- **Cloudflare Pages** untuk frontend
- **Cloudflare Workers** untuk backend API

## 📁 Struktur Project

```
bakpia-stok-app/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Layout components
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── stores/          # State management
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Hono API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Middleware
│   │   ├── models/          # Data models
│   │   └── utils/           # Utility functions
│   ├── schema.sql           # Database schema
│   └── wrangler.toml        # Cloudflare config
└── README.md
```

## 🎨 Design System

### Color Palette (Brand Bakpia Kurniasari)
- **Primary**: `oklch(0.35 0.08 40)` - Coklat tua (#8B4513)
- **Secondary**: `oklch(0.85 0.15 80)` - Gold accent (#FFD700)
- **Background**: `oklch(0.98 0.01 60)` - Cream (#FFF8DC)
- **Text**: `oklch(0.25 0.05 40)` - Dark brown (#654321)

### Typography
- Font family: System fonts (Inter, Roboto, sans-serif)
- Hierarki yang jelas untuk header, subtitle, dan body text

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) atau npm

### Frontend Development
```bash
cd frontend
pnpm install
pnpm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run test  # Run local test server
```

### Database Setup
```bash
# Setup Cloudflare D1 database
wrangler d1 create bakpia-stok-db
wrangler d1 execute bakpia-stok-db --file=schema.sql
```

## 📊 Database Schema

### Tabel Utama
- **categories** - Kategori produk bakpia
- **products** - Data produk dengan harga dan deskripsi
- **users** - Kasir dan admin dengan role-based access
- **stock** - Tracking stok masuk, keluar, dan tersisa
- **transactions** - Transaksi penjualan
- **transaction_items** - Detail item per transaksi
- **stock_movements** - History pergerakan stok
- **price_history** - Riwayat perubahan harga

### Sample Data
Database sudah include sample data:
- 4 kategori produk (Original, Premium, Spesial, Gift)
- 6 produk bakpia dengan harga
- 1 admin user (username: admin, password: admin123)
- Initial stock untuk semua produk

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Stock Management
- `GET /api/stock` - Get stock data with alerts
- `POST /api/stock/in` - Add stock (stock masuk)
- `GET /api/stock/movements` - Stock movement history

### Transactions
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create new sale transaction

### Reports
- `GET /api/reports/dashboard` - Dashboard overview
- `GET /api/reports/sales` - Sales reports
- `GET /api/reports/products/bestseller` - Best selling products

## 🚀 Deployment

### Frontend (Cloudflare Pages)
```bash
cd frontend
pnpm run build
# Upload dist/ folder to Cloudflare Pages
```

### Backend (Cloudflare Workers)
```bash
cd backend
wrangler deploy
```

## 🔧 Environment Variables

### Backend (.env atau wrangler.toml)
```
JWT_SECRET=your-jwt-secret-key
ENVIRONMENT=production
```

## 📱 Features Overview

### Dashboard
- Real-time overview stok dan penjualan
- Alert untuk stok menipis
- Transaksi terbaru
- Statistik harian

### Manajemen Produk (Coming Soon)
- CRUD produk dengan kategori
- Upload gambar produk
- Manajemen harga dan diskon
- Bulk operations

### Sistem Stok (Coming Soon)
- Input stok masuk dari pusat
- Tracking stok keluar otomatis
- History pergerakan stok
- Alert expire date

### Sistem Kasir (Coming Soon)
- Interface POS yang user-friendly
- Scan barcode (future)
- Print receipt
- Multiple payment methods

### Laporan (Coming Soon)
- Laporan penjualan harian/bulanan
- Analisis produk terlaris
- Performance kasir
- Export ke Excel/PDF

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

Untuk support dan pertanyaan, silakan hubungi tim development.

---

**Bakpia Kurniasari** - Sistem Manajemen Stok Modern untuk Outlet Tradisional

