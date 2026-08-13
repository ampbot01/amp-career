import { createClient, SupabaseClient } from "@supabase/supabase-js";

// SERVER ONLY — service_role key bypass RLS. Jangan pernah impor dari client component.

const globalForSupabase = globalThis as unknown as { supabaseAdmin: SupabaseClient };

function createAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";
  return createClient(url, key, { auth: { persistSession: false } });
}

export const supabaseAdmin = globalForSupabase.supabaseAdmin ?? createAdmin();

if (process.env.NODE_ENV !== "production") globalForSupabase.supabaseAdmin = supabaseAdmin;

export const RESUME_BUCKET = "resumes";

/** Signed download URL untuk admin melihat CV (bucket private). */
export async function getResumeDownloadUrl(path: string, expiresInSec = 3600) {
  const { data, error } = await supabaseAdmin.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(path, expiresInSec);
  if (error) throw error;
  return data.signedUrl;
}
