# Sumber HTML asli

Folder ini menyimpan salinan file HTML dari ZIP bot yang diberikan.
Folder ini sengaja berada di luar `public/`, jadi Cloudflare Pages tidak
menganggap file-file ini sebagai halaman statis yang langsung disajikan.

Halaman game yang aktif tetap dimuat oleh backend Fastify bot melalui
`GET /game/:slug`. Backend juga menambahkan aset chat dan mengganti audio
placeholder khusus Duck Pipes/Akinator sebelum mengirim HTML ke browser.
Karena itu, jangan pindahkan HTML mentah ini ke `public/` untuk menggantikan
rute `/game/*`.
