import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import QRCodeGenerator from './QRCodeGenerator';

/**
 * ProductQRGenerator component
 * Generates QR codes that link to product information pages
 */
const ProductQRGenerator = ({
  productId,
  productName,
  productPrice,
  productImage,
  categoryName,
  baseUrl = 'https://kurniasari.co.id',
  size = 200
}) => {
  const [productData, setProductData] = useState({});
  const [qrValue, setQrValue] = useState('');
  const [entryDate, setEntryDate] = useState(formatDate(new Date()));
  const [expiryDate, setExpiryDate] = useState(getDefaultExpiryDate());
  const [location, setLocation] = useState('Outlet Malioboro');
  const [locations, setLocations] = useState([
    'Outlet Malioboro', 
    'Outlet Kaliurang', 
    'Outlet Prawirotaman',
    'Outlet Bandara',
    'Online Store'
  ]);
  
  // Format date to Indonesian format: DD Month YYYY
  function formatDate(date) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  }
  
  // Get default expiry date (2 months from today)
  function getDefaultExpiryDate() {
    const date = new Date();
    date.setMonth(date.getMonth() + 2);
    return formatDate(date);
  }
  
  // Generate product URL with all data
  useEffect(() => {
    if (productId) {
      try {
        // Create product data object for QR code URL
        const data = {
          id: productId,
          name: productName || `Product ${productId}`,
          price: productPrice || 0,
          image: productImage || '',
          category: categoryName || '',
          entryDate: entryDate,
          expiryDate: expiryDate,
          location: location,
          description: `${productName || 'Bakpia'} produksi Kurniasari. Kualitas terjamin.`
        };
        
        setProductData(data);
        
        // Create the URL with query parameters
        const productUrl = new URL(`${baseUrl}/product-info.html`);
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            productUrl.searchParams.append(key, encodeURIComponent(String(value)));
          }
        });
        
        setQrValue(productUrl.toString());
      } catch (err) {
        console.error('Error creating product URL:', err);
        setQrValue(`${baseUrl}/product-info.html?id=${productId}`);
      }
    }
  }, [productId, productName, productPrice, productImage, categoryName, baseUrl, entryDate, expiryDate, location]);

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">QR Code Product Info</h3>
        <p className="text-sm text-muted-foreground">
          QR code ini akan menampilkan informasi produk saat dipindai
        </p>
      </div>
      
      <div className="space-y-3">
        {/* Entry Date Input */}
        <div>
          <Label htmlFor="entry-date">Tanggal Masuk</Label>
          <Input
            id="entry-date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>
        
        {/* Expiry Date Input */}
        <div>
          <Label htmlFor="expiry-date">Tanggal Kadaluarsa</Label>
          <Input
            id="expiry-date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        
        {/* Location Select */}
        <div>
          <Label htmlFor="location">Lokasi Penjualan</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4 flex justify-center">
        {qrValue && (
          <QRCodeGenerator 
            value={qrValue}
            size={size}
            errorCorrection="M"
          />
        )}
      </div>
      
      <div className="text-xs text-center mt-2 text-muted-foreground">
        <p>Scan QR code untuk melihat informasi produk</p>
        <p className="break-all mt-1">{qrValue}</p>
      </div>
    </Card>
  );
};

export default ProductQRGenerator;
