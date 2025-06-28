import React, { useState, useEffect, useRef } from 'react';
import * as htmlToImage from 'html-to-image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Barcode, QrCode, Download, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import BarcodeGenerator from '@/components/BarcodeGenerator';
import ProductQRGenerator from '@/components/ProductQRGenerator';

export default function BulkPrint() {
  const { toast } = useToast();
  const { categories } = useCategories();
  const { products, loading } = useProducts();
  
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedAll, setSelectedAll] = useState(false);
  const [filterCategory, setFilterCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [printMode, setPrintMode] = useState('barcode');
  const [isDownloading, setIsDownloading] = useState(false);

  const printAreaRef = useRef(null);

  const filteredProducts = products ? products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  }) : [];

  useEffect(() => {
    if (selectedAll) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      const allSelectedInFilter = selectedProducts.every(id => filteredProducts.some(p => p.id === id));
      if (!allSelectedInFilter) {
        setSelectedAll(false);
      }
    }
  }, [selectedAll, filteredProducts]);

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleDownload = async () => {
    if (selectedProducts.length === 0) {
      toast({ title: "Tidak ada produk dipilih", description: "Pilih produk untuk diunduh.", variant: "destructive" });
      return;
    }
    setIsDownloading(true);

    const nodes = Array.from(printAreaRef.current.children);
    
    for (const node of nodes) {
      const productName = node.dataset.productName || 'label';
      const productId = node.dataset.productId || 'id';
      
      try {
        // Ensure images and fonts are loaded before converting
        const dataUrl = await htmlToImage.toPng(node, { 
          quality: 1.0, 
          backgroundColor: '#FFFFFF',
          pixelRatio: 2, // Higher resolution
        });
        const link = document.createElement('a');
        link.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_${productId}.png`;
        link.href = dataUrl;
        link.click();
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between downloads
      } catch (error) {
        console.error('Gagal mengonversi label ke gambar:', error);
        toast({ title: "Gagal Unduh", description: `Tidak bisa membuat gambar untuk ${productName}.`, variant: "destructive" });
      }
    }
    
    toast({ title: "Unduh Selesai", description: `${nodes.length} label berhasil diunduh.` });
    setIsDownloading(false);
  };
  
  const selectedProductsData = products ? products.filter(p => selectedProducts.includes(p.id)) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hidden area for rendering printable labels */}
      <div ref={printAreaRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        {selectedProductsData.map(product => (
          <div 
            key={product.id}
            data-product-id={product.id}
            data-product-name={product.name}
            style={{
              width: '219px', // 58mm at 96dpi
              padding: '10px',
              textAlign: 'center',
              fontFamily: 'Arial, sans-serif',
              background: 'white',
              boxSizing: 'border-box',
              border: '1px solid #eee' // for visualization if needed
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 'bold', margin: '4px 0' }}>{product.name}</div>
            <div style={{ fontSize: '11px', marginBottom: '4px' }}>Rp {product.price?.toLocaleString('id-ID') || '0'}</div>
            <BarcodeGenerator 
              value={product.barcode || String(product.id)} 
              format="CODE128" 
              width={1.8} 
              height={45} 
              fontSize={14}
              margin={0}
              textMargin={0}
            />
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-bold mb-8">Unduh Label Produk</h1>
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Download className="h-5 w-5" />
              Pilih Produk untuk Diunduh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="barcode" className="w-full" onValueChange={setPrintMode}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="barcode"><Barcode className="h-4 w-4 mr-2" />Barcodes</TabsTrigger>
                <TabsTrigger value="qrcode" disabled><QrCode className="h-4 w-4 mr-2" />QR Codes (Segera Hadir)</TabsTrigger>
              </TabsList>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="search">Cari Produk</Label>
                  <Input id="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter nama produk..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Filter Kategori</Label>
                  <select id="category" value={filterCategory || ''} onChange={(e) => setFilterCategory(e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 border border-input rounded-md">
                    <option value="">Semua Kategori</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleDownload} disabled={selectedProducts.length === 0 || isDownloading} className="w-full">
                    {isDownloading ? 
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mengunduh...</> : 
                      <><Download className="h-4 w-4 mr-2" />Unduh Label ({selectedProducts.length})</>}
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="py-2 px-3 text-left w-24">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="select-all" checked={selectedAll} onCheckedChange={setSelectedAll} />
                          <Label htmlFor="select-all" className="cursor-pointer">Pilih Semua</Label>
                        </div>
                      </th>
                      <th className="py-2 px-3 text-left">Produk</th>
                      <th className="py-2 px-3 text-left">Kategori</th>
                      <th className="py-2 px-3 text-left">Harga</th>
                      <th className="py-2 px-3 text-left">Stok</th>
                      <th className="py-2 px-3 text-left">Kode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="p-4 text-center"><Loader2 className="h-6 w-6 mx-auto animate-spin" /></td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">Produk tidak ditemukan.</td></tr>
                    ) : (
                      filteredProducts.map((product) => {
                        const isSelected = selectedProducts.includes(product.id);
                        return (
                          <tr key={product.id} className={`border-t hover:bg-muted/50 cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`} onClick={() => toggleProductSelection(product.id)}>
                            <td className="py-3 px-3"><Checkbox checked={isSelected} onCheckedChange={() => toggleProductSelection(product.id)} className="pointer-events-none" /></td>
                            <td className="py-3 px-3 font-medium">{product.name}</td>
                            <td className="py-3 px-3"><Badge variant="outline">{categories?.find(c => c.id === product.category_id)?.name || 'N/A'}</Badge></td>
                            <td className="py-3 px-3">Rp {product.price?.toLocaleString() || '0'}</td>
                            <td className="py-3 px-3">{product.stock || '0'}</td>
                            <td className="py-3 px-3 font-mono text-xs">
                              {printMode === 'barcode' ? (product.barcode || product.id) : product.id}
                              {isSelected && <CheckCircle2 className="h-4 w-4 inline ml-2 text-primary" />}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              
              {selectedProducts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">Pratinjau ({selectedProducts.length} dipilih)</h3>
                  <div className="border rounded-md p-4 max-w-xs mx-auto">
                    {printMode === 'barcode' ? (
                      <BarcodeGenerator value={products.find(p => p.id === selectedProducts[0])?.barcode || String(selectedProducts[0])} format="CODE128" />
                    ) : (
                      <ProductQRGenerator productId={selectedProducts[0]} productName={products.find(p => p.id === selectedProducts[0])?.name} productPrice={products.find(p => p.id === selectedProducts[0])?.price} baseUrl="https://kurniasari.co.id" size={200} />
                    )}
                    <p className="text-sm text-center mt-2 text-muted-foreground">Pratinjau untuk: {products.find(p => p.id === selectedProducts[0])?.name}</p>
                  </div>
                </div>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
