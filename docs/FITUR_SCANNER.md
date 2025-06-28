# Penjelasan Fitur Scanner: Kasir vs. Manajemen Stok

Di aplikasi ini, terdapat dua fitur utama yang menggunakan scanner barcode, yaitu halaman **"Kasir"** dan halaman **"Scanner Barcode"**. Meskipun keduanya menggunakan teknologi yang sama, tujuannya sangat berbeda dan dirancang untuk alur kerja yang tidak sama.

Dokumen ini bertujuan untuk memperjelas fungsi dari masing-masing fitur.

---

### 1. Halaman "Kasir" (Point of Sale - POS)

- **Tujuan Utama:** Untuk **transaksi penjualan** kepada pelanggan.
- **Alur Kerja:**
  1. Kasir melakukan scan pada barcode produk yang akan dibeli oleh pelanggan.
  2. Setiap produk yang di-scan akan otomatis **ditambahkan ke dalam keranjang belanja**.
  3. Sistem akan menghitung total harga, mengelola pembayaran, dan mencetak struk.
  4. Setelah transaksi selesai, stok produk akan otomatis berkurang dari sistem.
- **Fokus:** Kecepatan, akurasi, dan kemudahan dalam melayani proses penjualan di outlet.
- **Pengguna Utama:** Staf Kasir.

### 2. Halaman "Scanner Barcode" (Manajemen Stok Internal)

- **Tujuan Utama:** Untuk **manajemen internal dan pengecekan data produk**, bukan untuk penjualan.
- **Alur Kerja:**
  1. Staf gudang atau toko melakukan scan pada barcode produk di rak atau di gudang.
  2. Aplikasi akan **menampilkan informasi detail** mengenai produk tersebut, seperti:
     - Nama Produk
     - Harga Jual
     - Jumlah Stok Tersisa
     - Kategori Produk
  3. Fitur ini tidak memengaruhi transaksi atau keranjang belanja. Tujuannya murni untuk mendapatkan informasi.
- **Kegunaan Praktis:**
  - **Cek Harga & Stok:** Dengan cepat memverifikasi harga atau sisa stok suatu barang tanpa harus membuka laptop atau mencari di daftar.
  - **Stok Opname:** Membantu proses audit inventaris dengan memindai semua barang fisik dan membandingkannya dengan data di sistem.
  - **Penerimaan Barang:** Memverifikasi barang yang baru datang dari supplier.
- **Pengguna Utama:** Staf Gudang, Manajer Toko, atau staf yang bertanggung jawab atas inventaris.

---

### Kesimpulan

| Fitur             | Fungsi Utama                                    | Dampak pada Sistem                     |
| ----------------- | ----------------------------------------------- | -------------------------------------- |
| **Kasir**         | Menjual produk ke pelanggan.                    | Mengurangi stok, mencatat transaksi.   |
| **Scanner Barcode** | Mengecek & mengelola info produk secara internal. | Tidak ada perubahan pada stok/transaksi. |

Dengan pemisahan ini, alur kerja menjadi lebih jelas dan efisien, mengurangi risiko kesalahan antara proses penjualan dan manajemen stok.
