# Catatan Pengeluaran

Web app untuk mencatat pengeluaran rumah tangga, dibuat untuk layar HP. Satu halaman statis (tanpa server), data disimpan di browser HP.

## Halaman

- **Catat**: nama pembelian, harga, tanggal, sumber dana, lalu Kirim. Sisa dana tampil langsung dan ada tanda cukup atau kurang.
- **Ringkasan**: per kategori dan sub-kategori: total dana, % alokasi, pengeluaran, % terpakai, dana tersisa.
- **Pembelian**: riwayat, dengan pencarian, filter, ubah, dan hapus.
- **Pengaturan**: pemasukan, periode, budget per sub-kategori, impor/ekspor CSV, cadangan JSON.

## Publikasi lewat GitHub Pages

1. Buat repository baru di GitHub, lalu unggah seluruh isi folder ini (`index.html`, `sw.js`, `manifest.webmanifest`, folder `icons`).
2. Buka **Settings → Pages**. Pada *Build and deployment*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu Save.
3. Tunggu satu sampai dua menit. Alamatnya `https://<username>.github.io/<nama-repo>/`.
4. Buka alamat itu di HP, lalu pasang ke layar utama (Pengaturan → Pasang di layar utama).

## Data pribadi

Repository untuk GitHub Pages gratis bersifat publik. Karena itu aplikasi ini **tidak membawa data apa pun**. Budget dan pembelian dimasukkan dari HP lewat **Pengaturan → Pulihkan dari cadangan** (file JSON) atau **Impor budget** (CSV). Jangan unggah file data pribadi ke repository.

Data hanya ada di browser HP yang dipakai. Unduh cadangan (JSON) secara berkala; menghapus data situs atau ganti HP akan menghapus data.

## Memperbarui aplikasi

Ganti file di repository. Saat HP online, versi terbaru dimuat otomatis; jika tampilan lama masih muncul, tutup dan buka lagi aplikasinya. Jika mengubah daftar file yang disimpan offline, naikkan nomor `CACHE` di `sw.js`.
