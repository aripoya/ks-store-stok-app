import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, AlertTriangle, Users } from 'lucide-react'

export default function Dashboard() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: 'Total Produk',
      value: '24',
      description: 'Produk aktif',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Penjualan Hari Ini',
      value: 'Rp 2,450,000',
      description: '15 transaksi',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Stok Menipis',
      value: '3',
      description: 'Perlu restok',
      icon: AlertTriangle,
      color: 'text-orange-600'
    },
    {
      title: 'Kasir Aktif',
      value: '2',
      description: 'Sedang bertugas',
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  const recentTransactions = [
    { id: 'TRX-001', product: 'Bakpia Pathok Original', amount: 'Rp 75,000', time: '10:30' },
    { id: 'TRX-002', product: 'Bakpia Premium Keju', amount: 'Rp 105,000', time: '10:15' },
    { id: 'TRX-003', product: 'Paket Gift Box', amount: 'Rp 150,000', time: '09:45' },
  ]

  const lowStockProducts = [
    { name: 'Bakpia Pathok Original', stock: 5, minStock: 10 },
    { name: 'Bakpia Premium Durian', stock: 2, minStock: 5 },
    { name: 'Bakpia Spesial Teh Hijau', stock: 3, minStock: 5 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di sistem manajemen stok Bakpia Kurniasari
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              Transaksi penjualan hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{transaction.product}</p>
                    <p className="text-xs text-muted-foreground">{transaction.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Stok Menipis
            </CardTitle>
            <CardDescription>
              Produk yang perlu segera direstok
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Min. stok: {product.minStock}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                      {product.stock} tersisa
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

