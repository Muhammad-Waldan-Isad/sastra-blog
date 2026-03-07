README.md — Sastra Blog (Starter Kit)
Repo ini adalah starter kit untuk blog karya sastra minimalis (cerpen, puisi, artikel) yang dibangun hanya dengan HTML, CSS, dan JavaScript.
Desain: hitam-putih, ringan, mudah di-maintain, dan bisa di-deploy langsung ke GitHub Pages.
Cocok diedit lewat GitHub web editor (bagus kalau kamu pakai HP atau tablet).
Isi README ini
Tujuan singkat
Struktur repo
Cara menjalankan lokal (preview)
Cara menambah posting baru (via GitHub web atau lokal)
Format posts.json (penjelasan metadata)
Template file post (contoh)
Pengaturan dan fitur yang tersedia (search, filter, pagination, font)
Deploy ke GitHub Pages
Tips styling & kustomisasi cepat
Troubleshooting singkat
Checklist untuk memulai
Lisensi & kontak
1. Tujuan singkat
Repo ini dibuat agar kamu bisa:
Menyimpan dan memajang tulisan (cerpen, puisi, artikel) tanpa server.
Mengedit dan menambah post langsung melalui GitHub web.
Memiliki frontend sederhana yang menampilkan daftar tulisan, search, filter, tag cloud, dan pagination.
Mudah dikembangkan nanti (RSS, komentar, statistik ringan).
2. Struktur repo
Direkomendasikan minimal:
Salin kode

sastra-blog/
├ index.html
├ style.css
├ app.js
├ posts.json
├ README.md
└ posts/
   ├ cerpen-pertama.html
   ├ puisi-hujan.html
   └ artikel-menulis.html
Keterangan singkat:
index.html — halaman utama (markup + hook JS).
style.css — style hitam-putih, responsive.
app.js — logic: load posts.json, render posts, search, filter, pagination.
posts.json — indeks metadata semua post.
posts/ — semua file HTML masing-masing tulisan.
README.md — dokumentasi (ini).
3. Menjalankan preview lokal (cara cepat)
Pastikan ada Python (umumnya sudah ada di macOS / Linux; Windows bisa install Python).
Buka terminal di folder repo (sastra-blog) lalu jalankan:
Salin kode

python3 -m http.server 8000
atau (Windows / fallback):
Salin kode

python -m http.server 8000
Buka browser ke: http://localhost:8000/
Catatan: GitHub Pages akan menjalankan file statis dari repo; preview lokal ini cukup untuk cek tampilan.
4. Cara menambah posting baru
Ada dua cara: via GitHub web (paling mudah) atau via local + push.
A. Via GitHub web (HP / tablet friendly)
Buka repo di GitHub → klik folder posts → klik Add file → Create new file.
Nama file: gunakan slug yang konsisten, misal 2026-03-07-cerpen-1.html.
Paste template post (contoh di bagian 6) lalu klik Commit new file.
Buka file posts.json → klik edit → tambahkan entry JSON baru (format lihat bagian 5) → Commit.
B. Via lokal (git)
Buat file baru di posts/ (pakai nama slug).
Edit posts.json tambahkan object baru.
Commit & push ke GitHub:
Bash
Salin kode
git add posts/<slug>.html posts.json
git commit -m "Add: <Judul> — <type>"
git push
GitHub Pages akan redeploy otomatis (beberapa menit).
5. Format posts.json (penting)
posts.json adalah “database” kecil. Tambah setiap post sebagai object di array. Contoh:
Json
Salin kode
[
  {
    "slug": "2026-03-07-cerpen-1",
    "title": "Malam di Halte",
    "date": "2026-03-07",
    "type": "cerpen",
    "author": "Waldan",
    "excerpt": "Sebuah cerita pendek tentang sebuah halte dan dua orang yang lupa nama mereka...",
    "tags": ["sepi","kota"],
    "path": "posts/2026-03-07-cerpen-1.html"
  }
]
Field wajib / rekomendasi
slug — unik, tanpa spasi (opsional tapi membantu).
title — judul post.
date — format YYYY-MM-DD (dipakai untuk sorting).
type — cerpen / puisi / artikel (memudahkan filter).
author — nama penulis.
excerpt — ringkasan singkat untuk daftar.
tags — array string; bisa kosong.
path — path ke file HTML (relatif).
Catatan: app.js yang disediakan akan meng-normalize sedikit jika beberapa field kosong, tapi lebih baik selalu isi metadata agar tampil rapi.
6. Template file post (contoh minimal)
Simpan sebagai posts/<slug>.html. Contoh:
Html
Salin kode
<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Malam di Halte — Nama Blog Karya Sastra</title>
  <meta name="description" content="Sebuah cerita pendek tentang sebuah halte dan dua orang yang lupa nama mereka." />
  <link rel="stylesheet" href="../style.css">
</head>
<body>
  <main class="container">
    <article class="post">
      <header>
        <h1>Malam di Halte</h1>
        <div class="meta">7 Maret 2026 • cerpen • oleh Waldan</div>
      </header>

      <section class="post-content">
        <p>Paragraf pertama cerita...</p>
        <p>Paragraf kedua cerita...</p>
        <pre class="poem">
Baris puisi jika ingin dipertahankan spasi
        </pre>
      </section>

      <footer>
        <nav><a href="../index.html">← Kembali</a></nav>
      </footer>
    </article>
  </main>
</body>
</html>
Tips:
Gunakan <pre class="poem"> atau <p class="poem"> untuk puisi agar format terjaga.
Pastikan link rel="stylesheet" mengarah ke ../style.css (karena file berada di folder posts).
7. Fitur bawaan & cara pakainya
Search: kotak search di header mencari title, excerpt, tags, author.
Filter: memilih cerpen/puisi/artikel di dropdown atau klik link di nav (query string ?type=).
Pagination: default 6 post / halaman (ubah PAGE_SIZE di app.js).
Tag cloud: klik tag untuk filter per tag.
Recent posts: widget menampilkan 6 post terbaru.
Font size: tombol A− dan A+ di toolbar; preferensi tersimpan di localStorage.
URL share: search/type/tag/page tersimpan di query string sehingga bisa dibagikan.
8. Deploy ke GitHub Pages
Buat repo baru di GitHub (misal sastra-blog).
Push semua file ke branch main.
Buka repo → Settings → Pages → Source → pilih main branch (root) → Save.
GitHub Pages akan menyediakan domain: https://<username>.github.io/<repo>/ atau jika repo bernama <username>.github.io maka root site.
Catatan: kadang perlu beberapa menit agar site muncul.
9. Tips styling & kustomisasi cepat
Ubah palet dasar di :root pada style.css (variabel CSS seperti --bg, --text).
Untuk mengubah jumlah post per page: ubah PAGE_SIZE di app.js.
Ingin font serif untuk post body? tambahkan font-family di .post .post-content.
Mode cetak sudah disiapkan (@media print) supaya cocok saat ingin export PDF.
10. Troubleshooting singkat
Daftar kosong / error fetch: cek apakah posts.json valid JSON (gunakan layanan JSON validator atau periksa trailing comma). Jika file tidak ada, app.js akan menampilkan pesan error.
Link post tidak ditemukan: pastikan path di posts.json sesuai dengan lokasi file posts/<filename>.html.
CSS tidak muncul: cek link rel="stylesheet" pada HTML; di post gunakan ../style.css.
GitHub Pages tidak tampil: pastikan branch yang dipilih sudah benar, dan file index.html berada di root branch yang anda pilih.
11. Checklist (copy-paste ke README atau issue)
[ ] Buat repo GitHub bernama sastra-blog
[ ] Tambah file index.html, style.css, app.js
[ ] Tambah folder posts dan contoh satu post
[ ] Buat posts.json dengan 1 entry
[ ] Aktifkan GitHub Pages (branch main)
[ ] Cek tampilan di HP
[ ] Buat README.md (ini sudah)
[ ] Buat branch backup atau salinan repo untuk cadangan
12. RSS / komentar / fitur lanjutan (opsional)
Fitur lanjutan yang mudah dikembangkan nanti:
RSS: buat rss.xml statis atau generator sederhana (node script) untuk otomatisasi.
Komentar: integrasi Utterances (GitHub Issues) atau Disqus (pertimbangkan privasi).
Statistik privasi-friendly: Plausible / umami (dengan serverless) atau self-hosted.
Tag pages / archive page: buat halaman per-tag atau halaman archive otomatis (bisa di-generate script).
13. Lisensi & Kontak
Rekomendasi lisensi: MIT License (sederhana dan memperbolehkan reuse). Tambahkan file LICENSE bila setuju.
Kontak/credit: tambahkan di footer Email atau Instagram sesuai yang ada di index.html.
