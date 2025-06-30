import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useToast } from '@/components/ui/use-toast';
import BarcodeGenerator from '../components/BarcodeGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

const BarcodeTest = () => {
  const { products, loading: productsLoading, updateProduct } = useProducts({});
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('PRODUCT-1234');

  const handleSaveToProduct = async () => {
    if (!selectedProductId) {
      toast({ title: 'Error', description: 'Silakan pilih produk terlebih dahulu.', variant: 'destructive' });
      return;
    }
    if (!barcodeValue) {
      toast({ title: 'Error', description: 'Nilai barcode tidak boleh kosong.', variant: 'destructive' });
      return;
    }

    try {
      const productToUpdate = products.find(p => p.id === parseInt(selectedProductId));
      if (!productToUpdate) {
        toast({ title: 'Error', description: 'Produk tidak ditemukan.', variant: 'destructive' });
        return;
      }

      const updatePayload = { ...productToUpdate, barcode: barcodeValue };
      await updateProduct(productToUpdate.id, updatePayload);

      toast({ title: 'Sukses', description: `Barcode berhasil disimpan untuk produk ${productToUpdate.name}.` });
    } catch (error) {
      console.error('Failed to save barcode to product:', error);
      toast({ title: 'Error', description: 'Gagal menyimpan barcode.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Generator Barcode</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Buat dan Simpan Barcode</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="barcode-value">Nilai Barcode</Label>
            <Input 
              id="barcode-value"
              value={barcodeValue}
              onChange={e => setBarcodeValue(e.target.value)}
              placeholder="Masukkan nilai untuk barcode"
              className="mt-1"
            />
          </div>

          <div className="p-4 border rounded-md flex justify-center bg-white">
            <BarcodeGenerator 
              value={barcodeValue}
              format="CODE128"
              width={2}
              height={80}
            />
          </div>

          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-2">Simpan ke Produk</h3>
            <p className="text-sm text-muted-foreground mb-4">Pilih produk untuk menetapkan barcode yang telah dibuat.</p>
            <div className="flex items-center gap-4">
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="flex-grow w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={productsLoading}
              >
                <option value="">{productsLoading ? 'Memuat produk...' : 'Pilih Produk'}</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <Button onClick={handleSaveToProduct} disabled={!selectedProductId || !barcodeValue}>
                Simpan ke Produk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeTest;
