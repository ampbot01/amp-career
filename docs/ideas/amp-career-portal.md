# AMP Career Portal — MVP One-Pager

> Refined via idea-refine skill. Based on `design.md` (AMP Design System) + Skyshi Hub layout reference.
> v2 — reviewed & revised 2026-08-12.

## Problem Statement

*How might we build a job portal for AMP (Amped Media) that matches their premium dark-first brand and lets creative talent apply in seconds — not minutes?*

## Recommended Direction

Skyshi-like layout (hero + job card grid + sidebar) dengan AMP identity. Sederhana: job listing → detail/apply page. No ATS, no talent pool — cukup kandidat lihat lowongan, apply, admin review via dashboard.

**Kenapa arah ini:**
- Cukup buat MVP: job listing + application submission
- Brand AMP kuat (dark, blue glow, Space Grotesk + Inter) — bedain dari portal generic
- Build cost rendah, bisa live cepet
- Zero-friction apply — no login required for candidates

## Definition of Done

**MVP sukses = 1 job live + 1 aplikasi masuk end-to-end tanpa error** (form submit → file ter-upload ke R2 → tercatat di DB → terlihat di admin dashboard).

## Key Assumptions to Validate

- [ ] Talent mau apply via form langsung (no login/register required)
- [ ] Admin cukup review aplikasi lewat dashboard sederhana (no ATS pipeline)
- [ ] Portfolio link field cukup untuk creative talent — resume/CV tetap required
- [ ] Job categories/filter cukup meaningful buat < 20 job openings

## Target Users

- **Primary:** Creative talent (fresh grad → senior) looking for jobs at AMP
- **Admin:** HR & recruitment team at AMP (1–3 orang)
- Flow sama untuk semua tipe kandidat

## MVP Scope

### Candidate-Facing (Public)

| Page | Content |
|------|---------|
| `/` | Hero section (AMP brand glow + grid bg), job cards grid, sidebar (filters/categories) |
| `/jobs/[slug]` | Job detail — requirements, responsibilities, apply CTA |
| `/jobs/[slug]/apply` | Application form (fields di bawah) + Cloudflare Turnstile |
| `/apply/success` | Confirmation page after submit |

**Layout per Skyshi:**
- Desktop: 2-col (job list 2/3 + sidebar 1/3)
- Card per job: icon, badge (active/closed), title, description preview, tags, bottom row (info + "Apply" button)

### Admin-Facing (Private)

| Page | Content |
|------|---------|
| `/admin/login` | Email + password (lucia/auth.js credentials) |
| `/admin` | Dashboard — summary stats (total jobs, total applications, recent applications) |
| `/admin/jobs` | Job CRUD — create, edit, close/reopen listings |
| `/admin/applications` | Table of all applications per job, mark as reviewed |

### Application Form Fields

1. **Full name** — text, required
2. **Email** — email, required
3. **Phone** — tel, required
4. **Resume/CV** — file upload (PDF max 5MB), **required**
5. **Portfolio link** — URL, optional (Behance / Dribbble / GitHub / personal site)
6. **Cover letter / Why AMP?** — textarea, optional
7. **How did you hear about us?** — select/dropdown, optional

### Security (Trust Boundaries — tidak opsional)

- **Cloudflare Turnstile** di form apply (anti-spam, gratis, tanpa puzzle)
- **Rate limit** di API route submit (misal 5 submit/IP/jam)
- **File validation server-side:** MIME type whitelist (PDF only), max 5MB, random filename
- **Upload flow:** client minta signed upload URL dari API route → upload langsung ke Supabase Storage → simpan object path di DB. File gak lewat server Vercel (bypass 4.5MB body limit). Admin download via signed download URL (bucket private)
- **Admin routes** di-protect middleware auth

### Tech Stack (Final)

```
Next.js (App Router)
Tailwind CSS + AMP design tokens (from design.md)
PostgreSQL: Supabase (hosted) + Prisma
File upload: Supabase Storage (private bucket, signed upload URLs)
Auth: auth.js credentials (email+password, admin only, User table di Prisma)
Anti-spam: Cloudflare Turnstile
Deploy: Vercel
Domain: career.ampedmedia.id (subdomain, deploy independen)
```

## Not Doing (and Why)

- **Talent pool / pre-apply** — Belum perlu sampai ada traffic rutin
- **ATS pipeline (screening → interview → offer)** — Overengineering buat MVP
- **AI matching / auto-ranking** — Masa depan, simpen dulu
- **Multi-language** — Indonesia-only dulu
- **OAuth login for candidates** — Friction tambahan, form langsung lebih cepet
- **Google OAuth untuk admin** — Email+password cukup buat 1–3 admin; upgrade kalau tim HR gede
- **Email notifikasi (admin & kandidat)** — Belum perlu; admin cek dashboard manual, kandidat lihat success page. Tambah via Resend kalau volume naik
- **Company culture page / blog** — Pisah concern, ini portal karir fungsional dulu
- **Dark/light toggle** — AMP is dark-first, forced dark
- **R2 / Uploadthing / Vercel Blob** — Supabase Storage dipilih: satu vendor dengan DB, private bucket + signed URLs
- **Supabase Auth** — Overkill buat 1–3 admin; auth.js credentials + tabel User cukup

## Design Token Reference (from design.md)

```css
/* Colors */
--background: #030303
--card: #0a0a0a
--border: #262626
Primary: #2266F1
CTA gradient: linear-gradient(135deg, #3b82f6 → #2563eb → #1d4ed8)

/* Fonts */
Headings: Space Grotesk (300-700)
Body: Inter (300-700)

/* Radius */
rounded-xl: 12px (cards)
rounded-md: calc(var(--radius) - 2px) (inputs)

/* Effects */
Hero glow: radial-gradient(ellipse 80% 50% at 50% -10%, rgba(34,102,241,0.18), transparent 55%)
Grid bg: 48px grid pattern (rgba(255,255,255,0.07))
Glass: rgba(255,255,255,0.03-0.05) + backdrop-blur + border-white/10
```

## Open Questions

- ~~File upload~~ → **Supabase Storage (signed URLs, private bucket)** ✅
- ~~Admin auth~~ → **Email+password (lucia/auth.js)** ✅
- ~~Domain~~ → **career.ampedmedia.id** ✅
- ~~Resume required/optional~~ → **Required** ✅
- ~~Kandidat apply 2x ke job sama~~ → **Blokir via unique constraint (email + jobId) di Prisma** ✅

---

*v2: 2026-08-12 — security, email, decisions finalized | Source: idea-refine session*