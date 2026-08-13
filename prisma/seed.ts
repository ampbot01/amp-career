import "dotenv/config";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { supabaseAdmin, RESUME_BUCKET } from "../src/lib/supabase";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@ampedmedia.id";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD belum diisi di .env");

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash: await argon2.hash(password) },
    create: { email, passwordHash: await argon2.hash(password) },
  });

  // Hapus aplikasi dan lowongan lain selain Full-Stack Software Engineer
  await prisma.application.deleteMany({
    where: { job: { slug: { not: "software-engineer" } } },
  });
  await prisma.job.deleteMany({
    where: { slug: { not: "software-engineer" } },
  });

  await prisma.job.upsert({
    where: { slug: "software-engineer" },
    update: {
      title: "Full-Stack Software Engineer",
      category: "Developer",
      location: "Remote",
      type: "fulltime",
      isOpen: true,
      description:
        "Kami mencari Full-Stack Software Engineer ber-mindset produk tinggi untuk memegang kendali teknis ekosistem web & mobile platform di AMP. Kamu akan merancang, mengampu, dan menskalakan suite aplikasi cross-platform mobile, web app berbasis Next.js, hingga backend serverless & AI pipeline.",
      requirements:
        "- Minimal 1+ tahun pengalaman membangun & merawat aplikasi Web & Mobile secara end-to-end\n- Mahir Web Frontend & Backend: Next.js (App Router), React, TypeScript, Express / Node.js\n- Mahir ekosistem Mobile Cross-Platform: React Native & Expo\n- Pengalaman dengan Backend & Database: PostgreSQL, Supabase (RLS, Edge Functions, Realtime), Convex, atau Prisma ORM\n- Memahami Unit Testing, Integration Testing, & End-to-End (E2E) Testing menggunakan Vitest, Playwright, atau sejenisnya\n- Menguasai integrasi Peta/Geolocation (Leaflet, React Native Maps), QR Code processing, & live media/chat streaming\n- Berpengalaman mengintegrasikan AI Vision & LLM APIs (Google Gemini API, OpenAI API) ke dalam workflow aplikasi\n- Memiliki pengalaman melakukan deployment & maintenance aplikasi ke cloud (Vercel, AWS/GCP, Docker, CI/CD) (Nilai Tambah)\n- Pernah merilis & memelihara aplikasi di Google Play Store atau Apple App Store (Nilai Tambah)\n- Menguasai arsitektur clean code, schema validation (Zod), serta terbiasa menggunakan AI tools seperti Cursor, Antigravity, Claude Code, Codex, dll.",
    },
    create: {
      slug: "software-engineer",
      title: "Full-Stack Software Engineer",
      category: "Developer",
      location: "Remote",
      type: "fulltime",
      isOpen: true,
      description:
        "Kami mencari Full-Stack Software Engineer ber-mindset produk tinggi untuk memegang kendali teknis ekosistem web & mobile platform di AMP. Kamu akan merancang, mengampu, dan menskalakan suite aplikasi cross-platform mobile, web app berbasis Next.js, hingga backend serverless & AI pipeline.",
      requirements:
        "- Minimal 1+ tahun pengalaman membangun & merawat aplikasi Web & Mobile secara end-to-end\n- Mahir Web Frontend & Backend: Next.js (App Router), React, TypeScript, Express / Node.js\n- Mahir ekosistem Mobile Cross-Platform: React Native & Expo\n- Pengalaman dengan Backend & Database: PostgreSQL, Supabase (RLS, Edge Functions, Realtime), Convex, atau Prisma ORM\n- Memahami Unit Testing, Integration Testing, & End-to-End (E2E) Testing menggunakan Vitest, Playwright, atau sejenisnya\n- Menguasai integrasi Peta/Geolocation (Leaflet, React Native Maps), QR Code processing, & live media/chat streaming\n- Berpengalaman mengintegrasikan AI Vision & LLM APIs (Google Gemini API, OpenAI API) ke dalam workflow aplikasi\n- Memiliki pengalaman melakukan deployment & maintenance aplikasi ke cloud (Vercel, AWS/GCP, Docker, CI/CD) (Nilai Tambah)\n- Pernah merilis & memelihara aplikasi di Google Play Store atau Apple App Store (Nilai Tambah)\n- Menguasai arsitektur clean code, schema validation (Zod), serta terbiasa menggunakan AI tools seperti Cursor, Antigravity, Claude Code, Codex, dll.",
    },
  });

  const job = await prisma.job.findUniqueOrThrow({ where: { slug: "software-engineer" } });

  const dummyApplicants = [
    {
      fullName: "Budi Santoso",
      email: "budi.santoso@example.com",
      phone: "081234567890",
      currentSalary: "Rp 8.000.000 - Rp 10.000.000",
      expectedSalary: "Rp 12.000.000 - Rp 15.000.000",
      resumePath: "demo-resume-budi.pdf",
      portfolioUrl: "https://github.com/budisantoso-dev",
      coverLetter: "Saya sangat tertarik dengan kultur AI-native di AMP dan berpengalaman di Next.js & Expo.",
      source: "LinkedIn",
      status: "new",
      aiScore: 68,
      aiSummary: "Dipertimbangkan (68%) — Memiliki fondasi Next.js & Expo, perlu pembuktian CI/CD & LLM APIs.",
      aiAnalysis: JSON.stringify({
        score: 68,
        badge: "Dipertimbangkan",
        summary: "Kandidat memiliki pengetahuan dasar Next.js & Expo, namun membutuhkan verifikasi keahlian backend & testing.",
        strengths: [
          "Pengalaman dengan Next.js App Router & Expo Mobile",
          "Portfolio GitHub aktif",
          "Ekspektasi gaji sesuai batas posisi"
        ],
        gaps: [
          "Belum ada bukti integrasi AI LLM APIs di CV",
          "Pengalaman E2E testing Vitest/Playwright belum disebutkan"
        ],
        recommendation: "Dipertimbangkan untuk sesi technical screening awal."
      }),
    },
    {
      fullName: "Siti Rahmawati",
      email: "siti.rahma@example.com",
      phone: "081987654321",
      currentSalary: "Rp 10.000.000 - Rp 12.000.000",
      expectedSalary: "Rp 15.000.000 - Rp 20.000.000",
      resumePath: "demo-resume-siti.pdf",
      portfolioUrl: "https://sitirahma.dev",
      coverLetter: "Pengalaman 2+ tahun membangun aplikasi react native & Supabase edge functions.",
      source: "Instagram",
      status: "interview",
      aiScore: 78,
      aiSummary: "Layak (78%) — 2+ tahun React Native, Supabase Edge Functions & PostgreSQL.",
      aiAnalysis: JSON.stringify({
        score: 78,
        badge: "Layak",
        summary: "Kandidat memenuhi kualifikasi utama mobile React Native & Supabase backend.",
        strengths: [
          "2+ tahun spesialis React Native & Supabase Edge Functions",
          "Pengalaman PostgreSQL & schema optimization",
          "Situs portfolio personal aktif"
        ],
        gaps: [
          "Perlu pengujian integrasi AI Gemini/OpenAI API"
        ],
        recommendation: "Kandidat Layak: Sangat sesuai untuk diwawancarai oleh tim engineering."
      }),
    },
    {
      fullName: "Rian Hidayat",
      email: "rian.hidayat@example.com",
      phone: "085712345678",
      currentSalary: "Rp 12.000.000 - Rp 15.000.000",
      expectedSalary: "Rp 18.000.000 - Rp 25.000.000",
      resumePath: "demo-resume-rian.pdf",
      portfolioUrl: "https://github.com/rian-hidayat",
      coverLetter: "Berpengalaman merilis 3 aplikasi di Play Store & App Store dengan Vitest/Playwright CI/CD.",
      source: "Teman / referral",
      status: "offering",
      aiScore: 88,
      aiSummary: "Sangat Layak (88%) — Merilis 3 app di App Store/Play Store, menguasai Vitest/Playwright & CI/CD.",
      aiAnalysis: JSON.stringify({
        score: 88,
        badge: "Sangat Layak",
        summary: "Kandidat berprestasi tinggi dengan track record rilis aplikasi Play Store/App Store & otomatisasi CI/CD.",
        strengths: [
          "Telah merilis 3+ aplikasi di Google Play Store & Apple App Store",
          "Menguasai E2E & unit testing (Vitest, Playwright)",
          "Pengalaman mengelola deployment CI/CD & Docker"
        ],
        gaps: [
          "Ekspektasi gaji berada di batas atas rentang anggaran"
        ],
        recommendation: "Kandidat Sangat Layak: Lanjutkan ke tahap Offering Letter."
      }),
    },
    {
      fullName: "Dewi Lestari",
      email: "dewi.lestari@example.com",
      phone: "082134567891",
      currentSalary: "Rp 15.000.000 - Rp 20.000.000",
      expectedSalary: "> Rp 20.000.000",
      resumePath: "demo-resume-dewi.pdf",
      portfolioUrl: "https://dewilestari.tech",
      coverLetter: "Expert Full-Stack Software Engineer berpengalaman mengintegrasikan LLM & Gemini APIs.",
      source: "LinkedIn",
      status: "accepted",
      aiScore: 95,
      aiSummary: "Sangat Layak (95%) — Expert Full-Stack, LLM/Gemini Vision APIs, Senior Architecture.",
      aiAnalysis: JSON.stringify({
        score: 95,
        badge: "Sangat Layak",
        summary: "Kandidat ideal dengan spesialisasi AI-native Full-Stack, Next.js, React Native, & Gemini LLM APIs.",
        strengths: [
          "Expert integrasi LLM & Gemini Vision APIs",
          "Arsitektur Full-Stack end-to-end (Next.js, Supabase, Cloud)",
          "Pengalaman kepemimpinan teknis & clean code"
        ],
        gaps: [],
        recommendation: "Kandidat Terbaik (Top Pick): Resmi Diterima."
      }),
    },
    {
      fullName: "Fajar Nugraha",
      email: "fajar.nugraha@example.com",
      phone: "083812345679",
      currentSalary: "< Rp 4.000.000",
      expectedSalary: "Rp 6.000.000 - Rp 8.000.000",
      resumePath: "demo-resume-fajar.pdf",
      portfolioUrl: "https://fajarnugraha.io",
      coverLetter: "Junior developer yang antusias belajar AI tools.",
      source: "Job board",
      status: "rejected",
      aiScore: 42,
      aiSummary: "Belum Sesuai (42%) — Junior level, pengalaman belum memenuhi batas minimum 1+ tahun.",
      aiAnalysis: JSON.stringify({
        score: 42,
        badge: "Belum Sesuai",
        summary: "Kandidat masih di tingkat Junior dan belum memenuhi kualifikasi pengalaman Full-Stack mandiri.",
        strengths: [
          "Antusias terhadap teknologi AI"
        ],
        gaps: [
          "Pengalaman kurang dari 1 tahun",
          "Belum menguasai React Native & Backend Supabase/Prisma"
        ],
        recommendation: "Belum Sesuai untuk posisi Full-Stack Software Engineer saat ini."
      }),
    },
  ];

function createPdfBuffer(candidateName: string, title: string, exp: string): Buffer {
  const content = `CURRICULUM VITAE - ${candidateName.toUpperCase()}\n\nPosisi Target: ${title}\n\nPengalaman & Keahlian:\n${exp}\n\nPendidikan: Sarjana Teknik Informatika (S.Kom)\nSertifikasi: Full-Stack Web & Mobile Software Engineer`;
  const pdfString = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources <</Font <</F1 4 0 R>>>> /Contents 5 0 R>> endobj
4 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
5 0 obj <</Length ${content.length + 60}>> stream
BT
/F1 11 Tf
40 720 Td
(${content.replace(/[()\\]/g, "\\$&").replace(/\n/g, ") Tj\n0 -15 Td\n(")}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000313 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
450
%%EOF`;
  return Buffer.from(pdfString);
}

  for (const app of dummyApplicants) {
    // Upload dummy PDF file to Supabase Storage so AI can parse actual PDF document
    try {
      const pdfBuffer = createPdfBuffer(app.fullName, job.title, app.coverLetter ?? "");
      await supabaseAdmin.storage
        .from(RESUME_BUCKET)
        .upload(app.resumePath, pdfBuffer, { upsert: true, contentType: "application/pdf" });
    } catch (e) {
      console.warn(`Seed storage upload warning for ${app.resumePath}:`, e);
    }

    await prisma.application.upsert({
      where: { email_jobId: { email: app.email, jobId: job.id } },
      update: { ...app },
      create: { ...app, jobId: job.id },
    });
  }

  console.log("Seed OK: admin +", await prisma.job.count(), "job(s) +", await prisma.application.count(), "application(s) + PDFs uploaded to Supabase Storage");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
