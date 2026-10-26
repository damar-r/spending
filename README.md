# Catatan Pengeluaran

Web app untuk mencatat pengeluaran rumah tangga, dibuat untuk layar HP. Satu halaman statis (tanpa server), data disimpan di browser HP.

## Halaman

- **Catat**: nama pembelian, harga, tanggal, sumber dana, lalu Kirim. Sisa dana tampil langsung dan ada tanda cukup atau kurang.
- **Ringkasan**: per kategori dan sub-kategori: total dana, % alokasi, pengeluaran, % terpakai, dana tersisa. Tombol **Tambah atau pindahkan dana** menambah dana ke satu sub-kategori dengan mengambil budget dari sub-kategori lain, atau dari satu kategori (dibagi sebanding dengan sisa tiap sub). Hanya sisa dana yang belum terpakai yang bisa diambil, dan pemindahan bisa dibatalkan dari daftar di bawah.
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

## Sinkron ke Google Sheets (opsional)

Aplikasi bisa menyalin setiap pembelian (Kirim, Ubah, Hapus) ke Google Sheet. Arahnya satu sisi: app → Sheet. Jika HP sedang offline, perubahan diantre dan dikirim saat online lagi.

1. Buat Google Sheet kosong, lalu **Extensions → Apps Script**.
2. Tempel isi `apps-script/Code.gs`, ganti nilai `KUNCI` dengan kata sandi buatan Anda sendiri (minimal 8 karakter), lalu Save.
3. **Deploy → New deployment → Web app**. *Execute as*: **Me**. *Who has access*: **Anyone**. Deploy, lalu setujui izin yang diminta.
4. Salin alamat Web App (berakhiran `/exec`).
5. Di aplikasi: **Pengaturan → Sinkron ke Google Sheets**, tempel alamat dan kunci, lalu **Hubungkan**. Seluruh data langsung dikirim.

Sheet yang terbentuk: `Pembelian` (satu baris per pembelian), `Budget` (budget, terpakai, sisa, % terpakai lewat rumus), dan `Info` (pemasukan dan periode).

Catatan: gunakan akun Google pribadi. Akun kantor sering melarang akses "Anyone". Alamat Web App dan kunci hanya disimpan di HP, bukan di repository. Setelah mengubah `Code.gs`, buat **New deployment** (atau Manage deployments → Edit → New version) agar perubahan berlaku.
