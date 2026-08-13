"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/supabase";

async function requireAdmin() {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");
}

export type AiAnalysisData = {
  score: number;
  badge: "Sangat Layak" | "Layak" | "Dipertimbangkan" | "Belum Sesuai";
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  updatedAt?: string;
};

export async function runAiAtsAnalysis(applicationId: string) {
  await requireAdmin();

  const { data: app, error: appErr } = await supabaseAdmin
    .from("Application")
    .select("*, Job(*)")
    .eq("id", applicationId)
    .single();

  if (appErr || !app) throw new Error("Application not found");

  const timeString = new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const jobTitle = app.Job?.title ?? "Posisi Lowongan";
  const jobRequirements = app.Job?.requirements ?? "";

  console.log(`\n======================================================`);
  console.log(`[AI ATS Engine] Running re-analysis for app ID: ${applicationId}`);
  console.log(`[AI ATS Engine] Pelamar: ${app.fullName} (${app.email})`);
  console.log(`[AI ATS Engine] Posisi: ${jobTitle}`);

  const openAiCompatibleKey =
    process.env.OPENAI_COMPATIBLE_API_KEY ||
    process.env.OPENAI_COMPATIBLE_KEY ||
    process.env.DEEPSEEK_API_KEY ||
    process.env.OPENAI_API_KEY;

  const geminiKey = process.env.GEMINI_API_KEY;

  // Download candidate PDF resume buffer & extract text using pdf-parse lib directly
  let pdfBase64: string | null = null;
  let extractedPdfText = "";

  if (app.resumePath) {
    console.log(`[AI ATS Engine] Downloading PDF from Supabase Storage: ${app.resumePath}`);
    try {
      const { data: blob, error } = await supabaseAdmin.storage
        .from(RESUME_BUCKET)
        .download(app.resumePath);

      if (!error && blob) {
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        pdfBase64 = buffer.toString("base64");

        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pdfParse = require("pdf-parse/lib/pdf-parse.js");
          const parsedPdf = await pdfParse(buffer);
          if (parsedPdf && parsedPdf.text) {
            extractedPdfText = parsedPdf.text.trim();
            console.log(`[AI ATS Engine] ✅ Successfully extracted ${extractedPdfText.length} characters from CV PDF!`);
          } else {
            console.warn(`[AI ATS Engine] PDF parsed but no text returned.`);
          }
        } catch (parseErr) {
          console.warn("[AI ATS Engine] PDF text extraction error:", parseErr);
        }
      } else {
        console.warn(`[AI ATS Engine] Could not find PDF file in Supabase Storage:`, error);
      }
    } catch (e) {
      console.warn("[AI ATS Engine] Exception downloading PDF resume:", e);
    }
  }

  const promptText = `Secara objektif, berikan evaluasi ATS profesional untuk lamaran pekerjaan berikut.
Analisis dengan cermat seluruh ISI DOKUMEN CV / RESUME PDF PELAMAR yang telah diekstrak berikut, beserta cover letter dan kualifikasi lowongan.

PERSYARATAN LOWONGAN:
Posisi: ${app.Job?.title ?? "Posisi Lowongan"}
Kategori: ${app.Job?.category ?? ""}
Deskripsi: ${app.Job?.description ?? ""}
Persyaratan Kualifikasi:
${app.Job?.requirements ?? ""}

DATA PELAMAR:
Nama: ${app.fullName}
Email: ${app.email}
Phone: ${app.phone}
Gaji Saat Ini: ${app.currentSalary ?? "Tidak diisi"}
Ekspektasi Gaji: ${app.expectedSalary ?? "Tidak ditentukan"}
Portfolio URL: ${app.portfolioUrl ?? "Tidak ada"}
Cover Letter / Motivasi: ${app.coverLetter ?? "Tidak ada"}

=== ISI RESUME / CV PDF PELAMAR (DIEKSTRAK DARI DOKUMEN FILE PDF) ===
${extractedPdfText || "(Berkas PDF belum berhasil diekstrak atau kosong)"}
=====================================================================

Tolong berikan balasan dalam format JSON MURNI tanpa markdown:
{
  "score": 85,
  "badge": "Sangat Layak",
  "summary": "Ringkasan evaluasi 1-2 kalimat (sebutkan bukti spesifik dari CV PDF)",
  "strengths": ["Kelebihan 1 (bukti spesifik dari CV PDF)", "Kelebihan 2"],
  "gaps": ["Kekurangan 1", "Kekurangan 2"],
  "recommendation": "Rekomendasi tindakan HR"
}`;

  // 1. Try OpenAI-Compatible / DeepSeek Provider
  if (openAiCompatibleKey) {
    console.log(`[AI ATS Engine] Requesting DeepSeek / OpenAI-compatible API...`);
    try {
      const baseUrl = (
        process.env.OPENAI_COMPATIBLE_BASE_URL ||
        process.env.DEEPSEEK_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        "https://api.deepseek.com/v1"
      ).replace(/\/$/, "");

      const modelName =
        process.env.OPENAI_COMPATIBLE_MODEL ||
        process.env.DEEPSEEK_MODEL ||
        process.env.OPENAI_MODEL ||
        "deepseek-chat";

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openAiCompatibleKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: "You are an expert HR ATS evaluator. Output pure JSON format only." },
            { role: "user", content: promptText },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawContent = data.choices?.[0]?.message?.content;
        if (rawContent) {
          const parsed: AiAnalysisData = JSON.parse(rawContent.replace(/```json|```/g, "").trim());
          parsed.updatedAt = timeString;
          const jsonString = JSON.stringify(parsed);

          await supabaseAdmin.from("Application").update({
            aiScore: parsed.score,
            aiSummary: `[DeepSeek PDF AI - ${timeString}] ${parsed.badge} (${parsed.score}%) — ${parsed.summary}`,
            aiAnalysis: jsonString,
          }).eq("id", applicationId);

          console.log(`[AI ATS Engine] ✅ DeepSeek Success! Score: ${parsed.score}%`);
          console.log(`======================================================\n`);

          revalidatePath("/admin/applications");
          revalidatePath("/admin");

          return parsed;
        }
      }
    } catch (err) {
      console.warn("[AI ATS Engine] DeepSeek API call failed, trying next provider:", err);
    }
  }

  // 2. Try Google Gemini API Provider (Native Multimodal PDF Parsing!)
  if (geminiKey) {
    console.log(`[AI ATS Engine] Requesting Google Gemini 2.5 Flash API...`);
    try {
      const parts: any[] = [];
      if (pdfBase64) {
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: pdfBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed: AiAnalysisData = JSON.parse(rawText.replace(/```json|```/g, "").trim());
          parsed.updatedAt = timeString;
          const jsonString = JSON.stringify(parsed);

          await supabaseAdmin.from("Application").update({
            aiScore: parsed.score,
            aiSummary: `[Gemini PDF AI - ${timeString}] ${parsed.badge} (${parsed.score}%) — ${parsed.summary}`,
            aiAnalysis: jsonString,
          }).eq("id", applicationId);

          console.log(`[AI ATS Engine] ✅ Gemini Success! Score: ${parsed.score}%`);
          console.log(`======================================================\n`);

          revalidatePath("/admin/applications");
          revalidatePath("/admin");

          return parsed;
        }
      }
    } catch (err) {
      console.warn("[AI ATS Engine] Gemini API call failed, falling back to heuristic engine:", err);
    }
  }

  // 3. Fallback Heuristic ATS Scoring Engine
  console.log(`[AI ATS Engine] Running Smart Heuristic Scoring Engine...`);
  const cvText = (extractedPdfText + " " + (app.coverLetter ?? "")).toLowerCase();
  const portfolio = app.portfolioUrl ?? "";

  let score = 50;
  const strengths: string[] = [];
  const gaps: string[] = [];

  if (cvText.includes("next.js") || cvText.includes("nextjs") || cvText.includes("react")) {
    score += 15;
    strengths.push("Memiliki pengalaman mahir di Next.js & React ecosystem (Terverifikasi di CV PDF)");
  } else {
    gaps.push("Pengalaman Next.js tidak ditemukan di dokumen CV PDF");
  }

  if (cvText.includes("expo") || cvText.includes("react native") || cvText.includes("mobile")) {
    score += 12;
    strengths.push("Berpengalaman membangun aplikasi Mobile Cross-Platform React Native / Expo (Terverifikasi di CV PDF)");
  } else {
    gaps.push("Skill pengembangan mobile React Native / Expo perlu dikonfirmasi saat interview");
  }

  if (cvText.includes("ai") || cvText.includes("llm") || cvText.includes("gemini") || cvText.includes("openai")) {
    score += 13;
    strengths.push("Memiliki pemahaman & pengalaman integrasi AI Vision / LLM APIs (Terverifikasi di CV PDF)");
  }

  if (portfolio) {
    score += 10;
    strengths.push(`Memiliki portfolio / repository publik aktif: ${portfolio}`);
  } else {
    score -= 5;
    gaps.push("Tidak menyertakan tautan portfolio publik");
  }

  if (cvText.length > 50) {
    score += 5;
    strengths.push("Dokumen CV PDF & motivasi melamar memuat profil yang terstruktur");
  }

  score = Math.min(98, Math.max(35, score));

  let badge: "Sangat Layak" | "Layak" | "Dipertimbangkan" | "Belum Sesuai" = "Dipertimbangkan";
  let recommendation = "Dipertimbangkan untuk tahap seleksi awal.";

  if (score >= 85) {
    badge = "Sangat Layak";
    recommendation = "Kandidat Sangat Layak: Sangat direkomendasikan untuk segera dipanggil ke Tahap Wawancara (Interview).";
  } else if (score >= 70) {
    badge = "Layak";
    recommendation = "Kandidat Layak: Memenuhi syarat dasar kualifikasi, dapat dilanjutkan ke sesi screening.";
  } else if (score >= 50) {
    badge = "Dipertimbangkan";
    recommendation = "Kandidat Dipertimbangkan: Perlu verifikasi tambahan mengenai keahlian teknis spesifik.";
  } else {
    badge = "Belum Sesuai";
    recommendation = "Kandidat Belum Sesuai: Kualifikasi saat ini belum memenuhi ambang batas persyaratan posisi.";
  }

  const analysisResult: AiAnalysisData = {
    score,
    badge,
    summary: `Hasil analisis ATS (pembacaan berkas PDF) menunjukkan tingkat kesesuaian kualifikasi ${score}% untuk posisi ${jobTitle}. (Diperbarui pkl ${timeString})`,
    strengths,
    gaps,
    recommendation,
    updatedAt: timeString,
  };

  const jsonString = JSON.stringify(analysisResult);

  await supabaseAdmin.from("Application").update({
    aiScore: score,
    aiSummary: `[Smart Heuristic Engine - ${timeString}] ${badge} (${score}%) — ${analysisResult.summary}`,
    aiAnalysis: jsonString,
  }).eq("id", applicationId);

  console.log(`[AI ATS Engine] ✅ Smart Heuristic Success! Score: ${score}% (Diperbarui pkl ${timeString})`);
  console.log(`======================================================\n`);

  revalidatePath("/admin/applications");
  revalidatePath("/admin");

  return analysisResult;
}
