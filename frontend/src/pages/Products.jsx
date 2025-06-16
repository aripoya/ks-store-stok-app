import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Produk</h1>
        <p className="text-muted-foreground">
          Kelola produk bakpia dan kategori
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Fitur manajemen produk akan diimplementasikan di fase selanjutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

