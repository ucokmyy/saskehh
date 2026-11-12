# Saskeh WebView — GitHub + Cloudflare Pages

Paket ini membuat domain Cloudflare Pages menjadi pintu masuk untuk WebView Saskeh. File statis (landing page) dilayani Pages, sedangkan halaman game, API, dashboard, musik, chat, dan WebSocket diteruskan ke server Fastify bot yang tetap berjalan di Pterodactyl.

**Penting:** paket ini tidak memindahkan backend bot ke GitHub Pages. Backend tetap membutuhkan proses Node.js Saskeh di Pterodactyl. Kalau backend bot mati atau Tunnel terputus, game interaktif tidak akan bisa digunakan.

## Isi paket

- `public/` — landing page dan aturan rute Cloudflare Pages.
- `functions/[[path]].js` — reverse proxy untuk HTTP API dan WebSocket ke backend bot.
- `wrangler.jsonc` — konfigurasi Cloudflare Pages.
- `source-html/` — salinan HTML asli dari ZIP bot, sebagai arsip/sumber sinkronisasi. Folder ini bukan output website.
- `.env.example` — contoh variabel yang dipakai di Pterodactyl.
- `.dev.vars.example` — contoh konfigurasi lokal Cloudflare Pages.

## 1. Upload ke GitHub

1. Ekstrak ZIP ini.
2. Buat repository GitHub baru.
3. Upload seluruh isi folder hasil ekstrak ke root repository (jangan upload folder ZIP sebagai satu folder bersarang).
4. Jangan menambahkan file `.env` asli, token, kredensial, database, atau folder session bot ke repository publik.

## 2. Hubungkan repository ke Cloudflare Pages

1. Buka Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
2. Pilih repository GitHub yang tadi dibuat.
3. Build command: kosongkan.
4. Build output directory: `public`.
5. Root directory: `/`.
6. Deploy. Setelah berhasil, catat alamat Pages, misalnya `https://saskeh-webview.pages.dev`.

File `functions/` berada di root repository. Pages akan menggunakannya sebagai Pages Function. File `public/_routes.json` membatasi Function hanya ke rute backend agar file statis tidak ikut memanggil Function.

## 3. Pastikan backend bot tetap aktif

ZIP bot yang diberikan sudah memiliki server Fastify WebView di `lib/playvideo-ws.js`, route game/API di `lib/game-webview.js`, route Bucin di `lib/bucin-server.js`, dan pembuat URL publik di `lib/webview-address.js`. `index.js` sudah memanggil `startPlayVideoServer()`.

Jadi, bila file-file itu masih sama di Pterodactyl, tidak perlu mengganti kode backend. Pastikan server WebView mendengarkan port yang benar. Pada pengujian sebelumnya, endpoint CSS merespons di port `1048`; gunakan port tersebut selama masih sama. Kalau port server berubah, samakan port Tunnel dengan port aktual.

Contoh variabel untuk `.env` bot:

```env
SERVER_PORT=1048
WEBVIEW_PUBLIC_URL=https://saskeh-webview.pages.dev
```

`WEBVIEW_PUBLIC_URL` harus berisi alamat Pages milikmu, tanpa path tambahan. Kode `lib/webview-address.js` akan menggunakan variabel ini untuk membuat tautan publik, termasuk tautan WebSocket.

## 4. Hubungkan Cloudflare Tunnel dari Pterodactyl

Jalankan Tunnel ke port WebView lokal yang sudah aktif:

```bash
cloudflared tunnel --url http://127.0.0.1:1048 --protocol http2
```

Salin alamat HTTPS `https://....trycloudflare.com` yang diberikan Cloudflared. Jangan gunakan `http://127.0.0.1:1048` sebagai BACKEND_ORIGIN di Pages karena alamat localhost di Cloudflare Pages bukan server Pterodactyl.

Quick Tunnel `trycloudflare.com` bersifat sementara. Kalau Tunnel dihentikan/dibuat ulang dan URL berubah, perbarui `BACKEND_ORIGIN` di Pages. Untuk alamat backend yang tetap, gunakan named Cloudflare Tunnel dengan hostname yang kamu miliki.

## 5. Atur BACKEND_ORIGIN di Cloudflare Pages

1. Buka Workers & Pages → pilih project `saskeh-webview`.
2. Buka Settings → Variables and Secrets.
3. Tambahkan variable bernama `BACKEND_ORIGIN`.
4. Isi dengan URL HTTPS Tunnel, contoh `https://nama-random.trycloudflare.com` (tanpa slash di belakang).
5. Simpan lalu buat deployment baru bila diminta.

Jangan memasukkan URL Pages ke `BACKEND_ORIGIN`. Isinya harus URL Tunnel yang mengarah ke port Fastify bot.

## 6. Tes

Buka alamat Pages:

- `/` — landing page.
- `/game` — lobby dan room.
- `/game/duck`, `/game/tebak-kata`, `/game/akinator`, `/game/gudang-dorong`, `/game/benteng-saskeh` — game.
- `/dashboard/game` — dashboard/leaderboard.
- `/bucin` — halaman Bucin.

Jika muncul pesan `Backend belum dikonfigurasi`, variable `BACKEND_ORIGIN` belum diset. Jika muncul `Tidak dapat terhubung ke backend Saskeh`, periksa apakah bot masih hidup, port `1048` benar, dan Tunnel aktif. Jika halaman tampil tetapi API/WebSocket gagal, pastikan semua request ke `/api/*`, `/playground-assets/*`, dan `/ytplay/*` tetap masuk melalui Pages Function (jangan hapus `public/_routes.json`).

## Keamanan dan batasan

- Repository ini hanya berisi frontend publik, reverse proxy Pages, dan salinan HTML sumber. Jangan commit `.env` asli atau data pribadi bot.
- Backend WebView memang menyediakan API permainan dan dashboard. Jangan arahkan Tunnel ke port panel Pterodactyl atau port internal lain.
- Semua data room, profil, skor, musik, dan chat tetap diproses oleh backend/data bot saat ini; paket Pages ini tidak membuat database baru.
- WebSocket diteruskan melalui Cloudflare. Fitur real-time memerlukan Tunnel dan backend yang tetap menyala.
- `source-html/` hanya arsip. Backend bot tetap membaca HTML dari folder `html/` di Pterodactyl dan melakukan pemrosesan khusus sebelum menyajikannya.
