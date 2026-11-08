# MultiBlast Free-Tier Production Deployment Guide

Panduan lengkap deployment **MultiBlast (multiblast.app)** menggunakan kombinasi layanan 100% gratis:
- **Frontend & API**: Vercel (Hobby Free)
- **Database & Auth**: Supabase (Free Tier)
- **Queue/Cache**: Upstash Redis (Serverless Free Tier)
- **Background Worker**: Koyeb (Eco / Free Tier Instance)
- **DNS & SSL**: Cloudflare (Free DNS)

---

## 1. Persiapan Database & Auth (Supabase)

1. Buka [Supabase Dashboard](https://supabase.com) dan buat project baru (nama misal: `multiblast-prod`).
2. Masuk ke menu **SQL Editor**.
3. Buka file `packages/shared/src/db/schema.sql` di repository ini, copy seluruh isinya, paste ke SQL Editor Supabase, lalu klik **Run**.
4. Masuk ke **Project Settings** > **API**:
   - Salin **Project URL** (`https://xxx.supabase.co`).
   - Salin **anon public key**.
   - Salin **service_role secret key** (jangan bocorkan ke publik).
5. Masuk ke **Authentication** > **URL Configuration**:
   - Set **Site URL**: `https://multiblast.app` (atau URL Vercel sementara).
   - Tambahkan **Redirect URLs**: `https://multiblast.app/api/auth/callback`.

---

## 2. Persiapan Queue Redis (Upstash)

BullMQ membutuhkan Redis untuk mengelola jadwal antrean post, webhook, dan auto-DM.

1. Buka [Upstash Console](https://console.upstash.com).
2. Buat database Redis baru:
   - Name: `multiblast-queue`
   - Region: Pilih yang terdekat (Singapore / US East).
   - Type: Serverless (Free).
3. Di halaman database, cari bagian **Connect to your database** > **Node.js (ioredis)** atau **Redis Connect URL**.
4. Salin format URL Redis:
   ```
   rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
   ```
   *(Pastikan diawali dengan `rediss://` untuk koneksi TLS aman)*.

---

## 3. Deploy Frontend & API (Vercel)

1. Push repository MultiBlast ini ke GitHub repository Anda (private atau public).
2. Buka [Vercel Dashboard](https://vercel.com) > **Add New** > **Project**.
3. Import repository GitHub MultiBlast Anda.
4. Pengaturan build di Vercel:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (biarkan root karena ada `vercel.json` otomatis)
   - **Build Command**: `npx turbo run build --filter=@multiblast/web` (otomatis dari `vercel.json`)
   - **Output Directory**: `apps/web/.next`
5. Isi **Environment Variables** di Vercel:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
   OPENAI_API_KEY=sk-proj-xxx
   NEXT_PUBLIC_APP_URL=https://multiblast.app
   ```
6. Klik **Deploy**. Vercel akan otomatis build frontend dan API routes.
7. Di tab **Domains**, masukkan domain custom Anda: `multiblast.app`.

---

## 4. Deploy Background Worker 24/7 (Koyeb)

Worker berfungsi menjalankan cron penjadwalan post dan listener webhook 24 jam nonstop tanpa sleep.

1. Daftar akun di [Koyeb](https://www.koyeb.com) (Free tier support 1 micro service gratis).
2. Klik **Create Service** > Pilih **GitHub**.
3. Pilih repository MultiBlast Anda.
4. Konfigurasi Deployment:
   - **Builder**: Dockerfile
   - **Dockerfile location**: `apps/worker/Dockerfile`
   - **Instance type**: Nano / Micro (Free tier)
   - **Ports**: Tidak perlu HTTP port ekspos (worker murni background process).
5. Masukkan **Environment Variables** di Koyeb:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
   OPENAI_API_KEY=sk-proj-xxx
   ```
6. Klik **Deploy**. Koyeb akan menjalankan image worker dan mendengarkan antrean Redis Upstash secara real-time.

*Alternatif jika menggunakan **Render**:*
- Buat **Background Worker** (Bukan Web Service) agar tidak membutuhkan HTTP port.
- Build command: `npm ci && npm run build --workspace=@multiblast/worker`
- Start command: `node apps/worker/dist/index.js`

---

## 5. Konfigurasi Cloudflare DNS

1. Di dashboard Cloudflare, buka domain `multiblast.app`.
2. Tambahkan DNS Records:
   - **CNAME**: `@` mengarah ke `cname.vercel-dns.com` (Proxy status: DNS Only / Grey cloud untuk SSL pertama kali Vercel).
   - **CNAME**: `www` mengarah ke `cname.vercel-dns.com`.
3. Setelah Vercel memverifikasi sertifikat SSL, Anda bisa mengaktifkan proxy Cloudflare (Orange cloud) jika menginginkan proteksi DDoS Cloudflare.

---

## 6. Verifikasi Akhir

1. Akses `https://multiblast.app/login` di browser.
2. Sign up akun baru dan login ke dashboard.
3. Cek log di Koyeb Dashboard: Pastikan tertulis:
   ```
   ✓ MultiBlast BullMQ Workers are active and listening to Redis queues.
   ```
4. Coba jadwalkan 1 post di menu **Posts** dengan waktu 2 menit ke depan.
5. Perhatikan status di database atau dashboard: status akan berubah dari `scheduled` -> `publishing` -> `published` saat waktu eksekusi tiba.
