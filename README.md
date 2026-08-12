# oneAi

Web AI sederhana yang memakai API NoTrack sebagai backend.

## Cara paling gampang deploy
1. Upload folder project ini ke GitHub.
2. Buka Vercel dan pilih **Add New Project**.
3. Import repository `oneai`.
4. Klik Deploy.
5. Setelah selesai, buka domain Vercel yang diberikan.

Tidak perlu Termux dan tidak perlu menjalankan Node.js di HP.

Struktur:
- `index.html` = tampilan oneAi
- `api/ask.js` = backend/proxy ke NoTrack
- `package.json` = konfigurasi Node
- `vercel.json` = konfigurasi Vercel
