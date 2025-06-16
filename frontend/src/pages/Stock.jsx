import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Stock() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Stok</h1>
        <p className="text-muted-foreground">
          Monitor dan kelola stok produk
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stok Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur manajemen stok akan diimplementasikan di fase selanjutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

