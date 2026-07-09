# Money for Life

Aplikasi pencatatan transaksi dan perencanaan anggaran (budget) pribadi. Dibangun dengan Next.js (App Router) dan Supabase (Auth + Postgres), tampilan simpel, elegan, dan mobile-friendly.

## Fitur

- Autentikasi email & password (Supabase Auth)
- Catat transaksi pemasukan & pengeluaran, dengan kategori dan tanggal
- Kategori default otomatis dibuat saat akun baru dibuat
- Filter transaksi per bulan
- Perencanaan anggaran (budget) bulanan per kategori pengeluaran, lengkap dengan progress bar
- Dashboard ringkasan saldo + grafik tren 6 bulan terakhir
- Scan struk belanja pakai kamera (untuk transaksi pengeluaran) — foto struk otomatis dibaca dan mengisi nominal, tanggal, catatan, dan kategori (via OpenAI Vision)
- Row Level Security (RLS) di Supabase — setiap user hanya bisa melihat datanya sendiri

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, TypeScript)
- [Supabase](https://supabase.com) (Postgres + Auth, via `@supabase/ssr`)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) untuk grafik
- [Lucide](https://lucide.dev) untuk ikon
- [OpenAI API](https://platform.openai.com) (model `gpt-4o-mini`, vision) untuk scan struk

## Setup Lokal

### 1. Install dependencies

```bash
npm install
```

### 2. Siapkan database Supabase

1. Buka project Supabase kamu di [supabase.com/dashboard](https://supabase.com/dashboard).
2. Masuk ke **SQL Editor** → **New query**.
3. Copy seluruh isi file [`supabase/schema.sql`](./supabase/schema.sql) di repo ini, paste, lalu **Run**.
   - Ini akan membuat tabel `categories`, `transactions`, `budgets`, mengaktifkan Row Level Security, dan trigger untuk membuat kategori default saat user baru mendaftar.
4. (Opsional) Di **Authentication → Providers → Email**, matikan "Confirm email" kalau kamu ingin user langsung login tanpa verifikasi email saat testing.

### 3. Environment variables

Copy `.env.example` menjadi `.env.local` dan isi dengan URL & anon/publishable key dari **Project Settings → API** di Supabase:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxx
OPENAI_API_KEY=sk-xxxxx
```

`OPENAI_API_KEY` dipakai untuk fitur scan struk kamera (opsional — kalau tidak diisi, fitur scan akan menampilkan pesan error tapi input transaksi manual tetap berfungsi normal). Dapatkan key-nya di [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Key ini hanya dipakai di server (Server Action), tidak pernah dikirim ke browser.

> File `.env.local` sudah di-ignore oleh git, jadi credential tidak akan ter-commit.

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Deploy ke Vercel

1. Push repo ini ke GitHub (sudah otomatis dilakukan oleh assistant, cek commit terakhir).
2. Buka [vercel.com/new](https://vercel.com/new) dan import repo `Money-For-Life`.
3. Saat konfigurasi project, tambahkan Environment Variables berikut (sama seperti `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (untuk fitur scan struk)
4. Klik **Deploy**. Setelah selesai, aplikasi bisa diakses lewat URL `*.vercel.app` yang diberikan Vercel (bisa diakses secara global).
5. (Opsional) Tambahkan custom domain di **Project Settings → Domains**.
6. Di Supabase, tambahkan URL deployment Vercel kamu ke **Authentication → URL Configuration → Redirect URLs** (contoh: `https://money-for-life.vercel.app/auth/callback`) supaya konfirmasi email berfungsi di production.

Setiap kali ada `git push` ke branch `main`, Vercel akan otomatis build & deploy ulang (CI/CD bawaan Vercel, tidak perlu setup tambahan).

> **Catatan biaya:** setiap scan struk memanggil OpenAI API dan dikenakan biaya sesuai [pricing](https://openai.com/api/pricing) model `gpt-4o-mini`. Karena aplikasi ini single-user, tidak ada rate limit tambahan di sisi app — disarankan set usage limit di [platform.openai.com/settings/organization/limits](https://platform.openai.com/settings/organization/limits) untuk jaga-jaga.

## Struktur Folder

```
src/
  app/
    (auth)/          # halaman login & signup
    (app)/            # halaman setelah login: dashboard, transactions, budget
    auth/callback/    # handler konfirmasi email Supabase
  components/         # UI components (client & server)
  lib/
    supabase/         # helper client Supabase (browser, server, middleware)
    data.ts           # query read dari Supabase
    format.ts         # helper format Rupiah & tanggal
    types/database.ts # TypeScript types tabel Supabase
supabase/
  schema.sql          # DDL + RLS policies + trigger kategori default
```
