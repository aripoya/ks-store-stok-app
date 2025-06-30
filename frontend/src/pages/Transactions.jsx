import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8080/api/transactions');
        if (!response.ok) {
          throw new Error('Gagal memuat data transaksi');
        }
        const data = await response.json();
        setTransactions(data.transactions || []);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Transaksi</CardTitle>
          <CardDescription>Daftar semua transaksi penjualan yang telah tercatat.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Transaksi</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Metode Bayar</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Memuat data...</TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => (
                  <TableRow key={trx.id}>
                    <TableCell className="font-medium">{trx.transaction_code}</TableCell>
                    <TableCell>{format(new Date(trx.transaction_date), 'd MMMM yyyy, HH:mm', { locale: id })}</TableCell>
                    <TableCell>{trx.kasir_name || 'N/A'}</TableCell>
                    <TableCell><Badge variant="outline">{trx.payment_method}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(trx.total_amount)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center">Belum ada transaksi.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
