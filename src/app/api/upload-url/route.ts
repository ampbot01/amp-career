import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, RESUME_BUCKET } from "@/lib/supabase";
import { RateLimiter } from "@/lib/rate-limit";

const limiter = new RateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 }); // 10/IP/jam

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  if (!limiter.check(clientIp(req)).ok) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }

  let filename: string;
  try {
    ({ filename } = await req.json());
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  if (typeof filename !== "string" || !filename.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Hanya file PDF yang diperbolehkan" }, { status: 400 });
  }

  const path = `${crypto.randomUUID()}.pdf`;

  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: "Gagal membuat upload URL" }, { status: 500 });
  }

  return NextResponse.json({ path, signedUrl: data.signedUrl, token: data.token });
}
