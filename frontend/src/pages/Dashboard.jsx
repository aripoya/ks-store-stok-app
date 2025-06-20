import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, AlertTriangle, Users } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { useEffect, useState } from 'react'
import { productsAPI, stockAPI } from '@/services/api'

export default function Dashboard() {
  // Get category data from our hook
  const { categories, loading: categoriesLoading } = useCategories();
  
  // State for API data
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  // Initialize stats with default values
  useEffect(() => {
    setStats([
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
    ]);
  }, []);

  // We'll replace these with API data when available
  // For now, use updated category names in our mock data
  const recentTransactions = [
    { id: 'TRX-001', product: 'Bakpia Pathok Klasik', amount: 'Rp 75,000', time: '10:30' },
    { id: 'TRX-002', product: 'Bakpia Premium Keju', amount: 'Rp 105,000', time: '10:15' },
    { id: 'TRX-003', product: 'Paket Oleh-oleh Box', amount: 'Rp 150,000', time: '09:45' },
  ]

  // We'll replace these with API data when available
  // For now, use updated category names in our mock data
  const initialLowStockProducts = [
    { name: 'Bakpia Pathok Klasik', stock: 5, minStock: 10 },
    { name: 'Bakpia Premium Durian', stock: 2, minStock: 5 },
    { name: 'Bakpia Spesial Teh Hijau', stock: 3, minStock: 5 },
  ]
  
  // Fetch real data from the API
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // Fetch products and stock data
        const [productsData, stockData] = await Promise.all([
          productsAPI.getAll().catch(() => []),
          stockAPI.getLowStock().catch(() => []),
        ]);
        
        setProducts(productsData);
        
        // If we get real low stock data, use it
        if (stockData && stockData.length > 0) {
          setLowStock(stockData);
        } else {
          // Otherwise use our initial mock data
          setLowStock(initialLowStockProducts);
        }
        
        // Update stats with real numbers if available
        if (productsData && productsData.length > 0) {
          setStats(prev => {
            const updatedStats = [...prev];
            // Update product count
            updatedStats[0] = {
              ...updatedStats[0],
              value: productsData.length.toString()
            };
            return updatedStats;
          });
        }
        
        // We'll keep the mock transaction data for now
        // as we don't have a transactions API endpoint yet
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

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
          <Card key={stat.title} className="shadow-sm hover:shadow transition-shadow duration-200">
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
              {loading ? (
              <div className="py-4 text-center text-muted-foreground">Memuat data...</div>
            ) : recentTransactions.length > 0 ? recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
                  <div>
                    <p className="text-sm font-medium">{transaction.product}</p>
                    <p className="text-xs text-muted-foreground">{transaction.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{transaction.amount}</p>
                    <p className="text-xs text-muted-foreground">{transaction.time}</p>
                  </div>
                </div>
              )) : (
                <div className="py-4 text-center text-muted-foreground">Tidak ada transaksi terbaru</div>
              )}
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
              {loading ? (
              <div className="py-4 text-center text-muted-foreground">Memuat data...</div>
            ) : lowStock.length > 0 ? lowStock.map((product) => (
                <div key={product.name} className="flex items-center justify-between hover:bg-muted/50 p-2 rounded-md">
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
              )) : (
                <div className="py-4 text-center text-muted-foreground">Semua stok dalam jumlah aman</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

