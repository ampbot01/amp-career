# AMP Career Portal

Job portal untuk [ampedmedia.id](https://ampedmedia.id) — kandidat lihat lowongan + apply, admin HR kelola jobs + review lamaran.

**Spec:** `docs/ideas/amp-career-portal.md` · **Plan:** `docs/superpowers/plans/2026-08-13-amp-career-portal.md`

## Stack

Next.js 16 (App Router) · Tailwind v4 (AMP design tokens, dark-first) · Prisma 7 + Supabase Postgres · Supabase Storage (private bucket, signed URLs) · auth.js v5 credentials · Cloudflare Turnstile · Vitest

## Dev

```bash
npm install
cp .env.example .env   # isi credential
npx prisma migrate dev
npm run db:seed        # admin + sample jobs
npm run dev
```

- Public: `http://localhost:3000`
- Admin: `http://localhost:3000/admin` (login pakai `ADMIN_EMAIL`/`ADMIN_PASSWORD` dari `.env` saat seed)
- Test: `npm test`

## Deploy (Vercel)

1. Import repo ke Vercel, root directory = repo ini
2. Set env vars (semua dari `.env.example`):
   - `DATABASE_URL`, `DIRECT_URL` — pakai **pooler** (port 6543, `?pgbouncer=true`) untuk `DATABASE_URL` di serverless
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH_SECRET` (generate baru untuk prod: `npx auth secret`), `AUTH_TRUST_HOST=true`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` — tambahkan domain `career.ampedmedia.id` di Cloudflare Turnstile site
3. Migrasi: `npx prisma migrate deploy` (jalankan manual sekali, atau via CI step)
4. Seed admin prod: set `ADMIN_PASSWORD` kuat, `npm run db:seed` dari lokal mengarah ke DB prod (atau buat user manual via SQL)
5. DNS: `career.ampedmedia.id` → CNAME ke Vercel

## Catatan

- File CV tidak pernah lewat server Vercel — upload langsung ke Supabase Storage via signed URL
- Rate limit in-memory (reset per cold start) — upgrade ke Upstash kalau perlu konsistensi antar instance
- Anti-spam bypass otomatis di dev (Turnstile secret kosong); di production wajib diset
