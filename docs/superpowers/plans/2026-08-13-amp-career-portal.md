# AMP Career Portal MVP — Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Job portal untuk AMP — kandidat lihat lowongan + apply (resume ke Supabase Storage), admin HR kelola jobs + review aplikasi via dashboard.

**Architecture:** Next.js App Router (npm), Tailwind v4 + AMP design tokens dari `design.md`, Prisma → Supabase Postgres, Supabase Storage (private bucket, signed URLs), auth.js v5 credentials (admin only), Cloudflare Turnstile anti-spam. Deploy Vercel ke `career.ampedmedia.id`.

**Spec:** `docs/ideas/amp-career-portal.md` — baca dulu sebelum mulai.

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4, Prisma 6, Supabase (Postgres + Storage), auth.js v5, zod, @marsidev/react-turnstile, argon2 (password hash), vitest.

---

## File Structure

```
src/
  app/
    layout.tsx                    # Root: dark class, fonts (Space Grotesk + Inter)
    page.tsx                      # Job listing (hero + grid + sidebar filter)
    jobs/[slug]/page.tsx          # Job detail
    jobs/[slug]/apply/page.tsx    # Apply form
    apply/success/page.tsx        # Confirmation
    admin/login/page.tsx          # Admin login
    admin/layout.tsx              # Admin shell (sidebar)
    admin/page.tsx                # Dashboard stats
    admin/jobs/page.tsx           # Job list + create/edit/close
    admin/jobs/new/page.tsx       # Create job form
    admin/jobs/[id]/page.tsx      # Edit job form
    admin/applications/page.tsx   # Applications table, mark reviewed
    api/
      auth/[...nextauth]/route.ts # auth.js handler
      applications/route.ts       # POST submit application
      upload-url/route.ts         # POST minta signed upload URL
  components/
    job-card.tsx
    hero.tsx
    apply-form.tsx
    turnstile.tsx
    admin/...                     # login-form, job-form, applications-table
  lib/
    db.ts                         # Prisma client singleton
    auth.ts                       # auth.js config
    supabase.ts                   # Supabase admin client (service role)
    validation.ts                 # zod schemas (shared client/server)
    rate-limit.ts                 # in-memory rate limiter
prisma/
  schema.prisma
  seed.ts                         # 1 admin user + 2 sample jobs
tests/ (atau colocated *.test.ts)
  validation.test.ts
  rate-limit.test.ts
```

**Data model (Prisma):**

```prisma
model Job {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  category      String
  location      String
  type          String   // fulltime | contract | freelance | internship
  description   String
  requirements  String
  isOpen        Boolean  @default(true)
  createdAt     DateTime @default(now())
  applications  Application[]
}

model Application {
  id           String   @id @default(cuid())
  jobId        String
  job          Job      @relation(fields: [jobId], references: [id])
  fullName     String
  email        String
  phone        String
  resumePath   String   // Supabase Storage object path
  portfolioUrl String?
  coverLetter  String?
  source       String?
  status       String   @default("new") // new | reviewed
  createdAt    DateTime @default(now())

  @@unique([email, jobId])
}

model User {
  id           String @id @default(cuid())
  email        String @unique
  passwordHash String
}
```

---

## Task 1: Scaffold Next.js + Tailwind + tokens

**Files:**
- Create: semua hasil `create-next-app`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1:** Scaffold

```bash
cd /Users/erasysjogja-1/Documents/AMP/amp-career
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --turbopack
```

Jawab "No" kalau ditanya overwrite — folder hanya berisi `design.md`, `docs/`, `.git`, aman.

- [ ] **Step 2:** `globals.css` — isi dengan design tokens AMP (dari `design.md`): `--background: #030303`, `--card: #0a0a0a`, `--border: #262626`, primary `#2266F1`, utilities `.bg-hero-glow`, `.bg-grid-pattern`, `.glass`. Tailwind v4 → pakai `@theme` di CSS, bukan `tailwind.config.js`.

- [ ] **Step 3:** `layout.tsx` — `<html className="dark">`, font via `next/font/google`: `Space_Grotesk` (variable `--font-heading`), `Inter` (variable `--font-body`). Title "Careers at AMP".

- [ ] **Step 4:** Verify — `npm run dev`, buka `localhost:3000`, background gelap `#030303`. Commit: `git add -A && git commit -m "chore: scaffold next.js + AMP design tokens"`.

## Task 2: Prisma + Supabase connection

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`, `.env.example`

- [ ] **Step 1:** `npm i prisma @prisma/client && npx prisma init`

- [ ] **Step 2:** Isi `schema.prisma` dengan data model di atas. `datasource db { provider = "postgresql"; url = env("DATABASE_URL") }`.

- [ ] **Step 3:** `.env` — minta user isi `DATABASE_URL` dari Supabase dashboard (Settings → Database → connection string, pakai pooler port 6543 + `?pgbouncer=true`, plus direct connection untuk migrations di `DIRECT_URL`). Tambah `directUrl = env("DIRECT_URL")` di datasource. `.env.example` commit, `.env` gitignore.

- [ ] **Step 4:** `npx prisma migrate dev --name init` → tabel kebuat di Supabase. Verify di Supabase dashboard Table Editor: 3 tabel ada. Commit.

## Task 3: Zod validation schemas (TDD)

**Files:**
- Create: `src/lib/validation.ts`, `src/lib/validation.test.ts`

- [ ] **Step 1:** `npm i zod vitest && npm i -D @vitejs/plugin-react` (vitest config node env cukup, plugin react tidak perlu untuk lib tests).

- [ ] **Step 2:** Tulis test dulu `validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { applicationSchema, jobSchema } from './validation'

describe('applicationSchema', () => {
  const valid = {
    fullName: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    portfolioUrl: 'https://behance.net/budi',
    coverLetter: '',
    source: 'linkedin',
  }
  it('accepts valid input', () => {
    expect(applicationSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects bad email', () => {
    expect(applicationSchema.safeParse({ ...valid, email: 'nope' }).success).toBe(false)
  })
  it('rejects missing phone', () => {
    const { phone, ...rest } = valid
    expect(applicationSchema.safeParse(rest).success).toBe(false)
  })
  it('accepts empty portfolio/coverLetter/source', () => {
    expect(applicationSchema.safeParse({ fullName: 'A', email: 'a@b.co', phone: '0812' }).success).toBe(true)
  })
})
```

Tambah test `jobSchema`: title min 3, slug kebab-case regex, type enum.

- [ ] **Step 3:** Run → FAIL (`npx vitest run`).

- [ ] **Step 4:** Implement `validation.ts`:

```ts
import { z } from 'zod'

export const applicationSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().max(254),
  phone: z.string().min(8).max(20),
  portfolioUrl: z.union([z.literal(''), z.string().url()]).optional(),
  coverLetter: z.string().max(5000).optional(),
  source: z.string().max(100).optional(),
})

export const jobSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category: z.string().min(2).max(60),
  location: z.string().min(2).max(100),
  type: z.enum(['fulltime', 'contract', 'freelance', 'internship']),
  description: z.string().min(10),
  requirements: z.string().min(10),
})
```

- [ ] **Step 5:** Run → PASS. Commit: `feat: validation schemas`.

## Task 4: Rate limiter (TDD)

**Files:**
- Create: `src/lib/rate-limit.ts`, `src/lib/rate-limit.test.ts`

- [ ] **Step 1:** Test dulu:

```ts
import { describe, it, expect } from 'vitest'
import { RateLimiter } from './rate-limit'

describe('RateLimiter', () => {
  it('allows up to limit then blocks', () => {
    const rl = new RateLimiter({ limit: 3, windowMs: 60_000 })
    expect(rl.check('1.2.3.4').ok).toBe(true)
    expect(rl.check('1.2.3.4').ok).toBe(true)
    expect(rl.check('1.2.3.4').ok).toBe(true)
    expect(rl.check('1.2.3.4').ok).toBe(false)
  })
  it('tracks keys independently', () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 60_000 })
    rl.check('a')
    expect(rl.check('b').ok).toBe(true)
  })
})
```

- [ ] **Step 2:** Implement: class dengan `Map<string, number[]>`, prune timestamp di luar window. `ponytail: in-memory — reset per deploy/cold start; upgrade ke Upstash Redis kalau perlu distributed limit`.

- [ ] **Step 3:** Run → PASS. Commit: `feat: rate limiter`.

## Task 5: Auth (auth.js credentials)

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`, `src/app/admin/login/page.tsx`, `src/components/admin/login-form.tsx`

- [ ] **Step 1:** `npm i next-auth@beta argon2`. Env: `AUTH_SECRET` (`npx auth secret`), `AUTH_TRUST_HOST=true`.

- [ ] **Step 2:** `auth.ts` — Credentials provider: cari User by email, `argon2.verify(user.passwordHash, password)`. Session strategy `jwt`. `authorized` callback: proteksi path `/admin/**` kecuali `/admin/login`.

- [ ] **Step 3:** `middleware.ts` — export `auth` sebagai middleware, matcher `['/admin/:path*']`. Bukan `/admin/login`.

- [ ] **Step 4:** Login page + form (server action `signIn('credentials', ...)` dengan redirect ke `/admin`). Styling AMP: card glass, input `bg-transparent border border-input`, submit gradient CTA.

- [ ] **Step 5:** Verify manual: `/admin` redirect ke login; login dengan user dari seed (Task 10) → masuk dashboard. Commit: `feat: admin auth`.

## Task 6: Supabase Storage signed upload

**Files:**
- Create: `src/lib/supabase.ts`, `src/app/api/upload-url/route.ts`

- [ ] **Step 1:** `npm i @supabase/supabase-js`. Di Supabase dashboard: buat bucket `resumes`, **private**. Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server only!).

- [ ] **Step 2:** `supabase.ts` — `createClient(url, serviceRoleKey)`. Singleton.

- [ ] **Step 3:** `api/upload-url/route.ts` POST: body `{ filename }` → validasi extension `.pdf` (lowercase check) → generate path `resumes/${crypto.randomUUID()}.pdf` → `supabase.storage.from('resumes').createSignedUploadUrl(path)` → return `{ path, signedUrl, token }`. Rate limit 10/IP/jam. No auth (kandidat public) tapi Turnstile token juga divalidasi di sini.

- [ ] **Step 4:** Helper `getResumeDownloadUrl(path)` di `supabase.ts` — `createSignedUrl(path, 3600)` untuk admin.

- [ ] **Step 5:** Verify manual via curl setelah dev server jalan. Commit: `feat: signed upload urls`.

## Task 7: Turnstile integration

**Files:**
- Create: `src/components/turnstile.tsx`, tambah verify helper di `src/lib/turnstile.ts`

- [ ] **Step 1:** `npm i @marsidev/react-turnstile`. Env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Daftar site di Cloudflare dashboard (gratis).

- [ ] **Step 2:** `turnstile.tsx` — client component, render widget, expose token via callback prop.

- [ ] **Step 3:** `lib/turnstile.ts` — `verifyTurnstile(token, ip)`: POST ke `https://challenges.cloudflare.com/turnstile/v0/siteverify`, return boolean.

- [ ] **Step 4:** Dipakai di Task 8 & upload-url route. Commit bareng Task 8.

## Task 8: Application submit API

**Files:**
- Create: `src/app/api/applications/route.ts`

- [ ] **Step 1:** POST handler:
1. Rate limit 5/IP/jam → 429 kalau lewat.
2. Parse JSON body, `applicationSchema.safeParse` → 400 dengan error zod.
3. `verifyTurnstile` → 403 kalau gagal.
4. Validasi `resumePath`: harus ada di body, format `resumes/<uuid>.pdf`, verifikasi object exists via `supabase.storage.from('resumes').list` atau head — **jangan percaya path dari client mentah-mentah**.
5. `prisma.application.create` — catch unique constraint violation `(email, jobId)` → 409 "Kamu sudah pernah apply ke posisi ini".
6. Verify job exists + `isOpen` → 404/410.
7. Return 201 `{ id }`.

- [ ] **Step 2:** Verify manual: curl happy path + duplikat + tanpa turnstile. Commit: `feat: application submit api`.

## Task 9: Public pages (UI)

**Files:**
- Create: `src/components/hero.tsx`, `src/components/job-card.tsx`, `src/app/page.tsx`, `src/app/jobs/[slug]/page.tsx`, `src/app/jobs/[slug]/apply/page.tsx`, `src/components/apply-form.tsx`, `src/app/apply/success/page.tsx`

- [ ] **Step 1:** `page.tsx` — server component, `prisma.job.findMany({ where: { isOpen: true } })`. Hero (`.bg-hero-glow` + grid pattern, Space Grotesk heading "Berkarya Bersama AMP"), grid 2-col `JobCard`, sidebar filter by category (link `?category=` — server-side filter, no JS state).

- [ ] **Step 2:** `job-card.tsx` — per `design.md` 8.3: `bg-card border-white/10 rounded-xl`, title Space Grotesk semibold, badge biru, tags category/location/type, CTA "Apply" → `/jobs/[slug]`.

- [ ] **Step 3:** `jobs/[slug]/page.tsx` — detail: title, meta badges, description + requirements (whitespace-pre-wrap), tombol "Lamar Sekarang" → `/jobs/[slug]/apply`. Job closed/not found → notFound().

- [ ] **Step 4:** `apply-form.tsx` — client component. Flow:
1. Field per spec (name, email, phone, portfolio, cover letter, source select).
2. File input PDF (accept=".pdf", client check ≤5MB).
3. Submit: minta signed URL (Turnstile token ikut) → `fetch(signedUrl, { method: 'PUT', body: file, headers: { 'x-upsert': 'false' } })` atau pakai `supabase-js` client upload dengan token → POST `/api/applications` dengan `resumePath`.
4. Sukses → redirect `/apply/success`. Error 409 → tampilkan pesan duplikat.
Styling per `design.md` 8.4: label `text-sm text-muted-foreground`, input `bg-transparent border-input`, error `border-red-500/30` + `text-red-400`, submit full-width gradient.

- [ ] **Step 5:** `apply/success/page.tsx` — icon check hijau, pesan terima kasih, link balik ke `/`.

- [ ] **Step 6:** Verify manual end-to-end dengan seed data. Commit: `feat: public pages + apply flow`.

## Task 10: Seed script

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1:** `npm i -D tsx`. `package.json`: `"prisma": { "seed": "tsx prisma/seed.ts" }`.

- [ ] **Step 2:** Seed: 1 admin (`ADMIN_EMAIL`/`ADMIN_PASSWORD` dari env, hash argon2), 2 sample jobs (1 open "Senior Graphic Designer", 1 closed "Copywriter").

- [ ] **Step 3:** `npx prisma db seed` → verify di dashboard. Commit: `chore: seed`.

## Task 11: Admin pages

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/app/admin/jobs/page.tsx`, `src/app/admin/jobs/new/page.tsx`, `src/app/admin/jobs/[id]/page.tsx`, `src/app/admin/applications/page.tsx`, komponen admin terkait

- [ ] **Step 1:** `admin/layout.tsx` — sidebar `#080808` + divider `border-white/[0.08]`: menu Dashboard, Jobs, Applications, Sign out (server action `signOut`).

- [ ] **Step 2:** `admin/page.tsx` — 3 stat cards: total jobs open, total applications, applications status "new". List 5 aplikasi terbaru.

- [ ] **Step 3:** `admin/jobs/page.tsx` — tabel jobs (title, category, type, status badge, jumlah aplikasi, actions edit/tutup-buka). Server actions: `toggleJobOpen`, `createJob`, `updateJob` — semua validasi `jobSchema`, slug auto-generate dari title (kebab) kalau kosong, cek unique.

- [ ] **Step 4:** `admin/jobs/new` + `[id]` — form shared component, textarea untuk description/requirements.

- [ ] **Step 5:** `admin/applications/page.tsx` — filter by job (select), tabel: nama, email, phone, portfolio link, tombol "Lihat CV" (server action → `getResumeDownloadUrl` → redirect), tombol "Mark reviewed". Pagination sederhana (`?page=`, 20/page).

- [ ] **Step 6:** Verify manual: login → buat job → apply sebagai kandidat → lihat di admin → download CV → mark reviewed. Commit: `feat: admin dashboard`.

## Task 12: Deploy prep

- [ ] **Step 1:** `npm run build` lokal — fix semua error type/lint.
- [ ] **Step 2:** Env var checklist di Vercel: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Pakai pooled connection untuk `DATABASE_URL` di Vercel.
- [ ] **Step 3:** `npx prisma migrate deploy` jalan sebagai build step atau manual setelah env set.
- [ ] **Step 4:** Definition of Done check: 1 job live → apply end-to-end → file di bucket → row di DB → tampil di admin.

---

## Self-Review Notes

- **Spec coverage:** semua halaman di spec ada task-nya ✅; email dicoret ✅; unique constraint ✅; Turnstile ✅; rate limit ✅; file validation ✅.
- **Type safety:** `resumePath` dari client divalidasi format + existence (Task 8 step 4) — jangan skip.
- **Auth boundary:** service role key hanya di server (`supabase.ts` jangan pernah diimpor client component). Middleware matcher jangan blokir `/admin/login` — loop redirect.
- **TDD:** hanya Task 3 & 4 (pure logic). UI/API diverify manual — sesuai skill, E2E manual = definition of done.
- **Risiko:** create-next-app prompt interaktif — flag lengkap sudah disertakan supaya non-interaktif.
