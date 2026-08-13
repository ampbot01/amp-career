import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/supabase";
import { applicationSchema } from "@/lib/validation";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { verifyTurnstile } from "@/lib/turnstile";
import { RateLimiter } from "@/lib/rate-limit";
import { Prisma } from "@prisma/client";

const limiter = new RateLimiter({ limit: 5, windowMs: 60 * 60 * 1000 }); // 5/IP/jam
const RESUME_PATH_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.pdf$/;

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req);
    if (!limiter.check(ip).ok) {
      return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
    }

    const { jobId, resumePath, recaptchaToken, turnstileToken, ...fields } = body as Record<string, unknown>;

    // 1. Validasi skema data pelamar terlebih dahulu sebelum mengonsumsi token captcha
    const parsed = applicationSchema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMsg = Object.values(fieldErrors)[0]?.[0];
      return NextResponse.json(
        { error: firstErrorMsg ?? "Data tidak valid", issues: fieldErrors },
        { status: 400 }
      );
    }

    // 2. Anti-spam verification (hanya diproses jika data input form sudah valid!)
    const token = (recaptchaToken ?? turnstileToken) as string | undefined;
    const isRecaptcha = Boolean(process.env.RECAPTCHA_SECRET_KEY || recaptchaToken);
    const isValidCaptcha = isRecaptcha
      ? await verifyRecaptcha(token, ip)
      : await verifyTurnstile(token, ip);

    if (!isValidCaptcha) {
      return NextResponse.json({ error: "Verifikasi anti-spam gagal, silakan centang ulang captcha." }, { status: 403 });
    }

    if (typeof jobId !== "string" || !jobId) {
      return NextResponse.json({ error: "Job tidak valid" }, { status: 400 });
    }

    // Validasi resumePath: format ketat + object harus benar-benar ada di bucket.
    if (typeof resumePath !== "string" || !RESUME_PATH_RE.test(resumePath)) {
      return NextResponse.json({ error: "Resume belum di-upload" }, { status: 400 });
    }
    const { data: fileInfo, error: fileError } = await supabaseAdmin.storage
      .from(RESUME_BUCKET)
      .list("", { search: resumePath });

    if (fileError || !fileInfo?.some((f) => f.name === resumePath)) {
      return NextResponse.json({ error: "Resume tidak ditemukan, upload ulang" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Lowongan tidak ditemukan" }, { status: 404 });
    if (!job.isOpen) {
      return NextResponse.json({ error: "Lowongan sudah ditutup" }, { status: 410 });
    }

    try {
      const application = await prisma.application.create({
        data: { ...parsed.data, jobId, resumePath },
      });
      return NextResponse.json({ id: application.id }, { status: 201 });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" // unique constraint (email, jobId)
      ) {
        return NextResponse.json(
          { error: "Kamu sudah pernah melamar posisi ini dengan email tersebut." },
          { status: 409 }
        );
      }
      throw e;
    }
  } catch (error) {
    console.error("API /api/applications Exception:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
