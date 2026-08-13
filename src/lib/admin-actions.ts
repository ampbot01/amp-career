"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { supabaseAdmin, getResumeDownloadUrl } from "@/lib/supabase";
import { jobSchema } from "@/lib/validation";

async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/admin/login");
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export async function createJob(formData: FormData) {
  await requireAdmin();

  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("title") ?? "")),
    category: String(formData.get("category") ?? ""),
    location: String(formData.get("location") ?? ""),
    type: String(formData.get("type") ?? ""),
    description: String(formData.get("description") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
  };

  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.flatten().fieldErrors };
  }

  const { data: existing } = await supabaseAdmin
    .from("Job")
    .select("id")
    .eq("slug", parsed.data.slug)
    .maybeSingle();

  if (existing) return { error: "Slug sudah dipakai, ganti yang lain" };

  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const { error } = await supabaseAdmin.from("Job").insert([{ id, ...parsed.data }]);

  if (error) {
    console.error("createJob Error:", error);
    return { error: "Gagal menyimpan lowongan" };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function updateJob(jobId: string, formData: FormData) {
  await requireAdmin();

  const raw = {
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("title") ?? "")),
    category: String(formData.get("category") ?? ""),
    location: String(formData.get("location") ?? ""),
    type: String(formData.get("type") ?? ""),
    description: String(formData.get("description") ?? ""),
    requirements: String(formData.get("requirements") ?? ""),
  };

  const parsed = jobSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid", issues: parsed.error.flatten().fieldErrors };
  }

  const { data: conflict } = await supabaseAdmin
    .from("Job")
    .select("id")
    .eq("slug", parsed.data.slug)
    .neq("id", jobId)
    .maybeSingle();

  if (conflict) return { error: "Slug sudah dipakai lowongan lain" };

  const { error } = await supabaseAdmin.from("Job").update(parsed.data).eq("id", jobId);

  if (error) {
    console.error("updateJob Error:", error);
    return { error: "Gagal memperbarui lowongan" };
  }

  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function toggleJobOpen(jobId: string) {
  await requireAdmin();
  const { data: job, error: fetchErr } = await supabaseAdmin
    .from("Job")
    .select("isOpen")
    .eq("id", jobId)
    .single();

  if (fetchErr || !job) throw new Error("Lowongan tidak ditemukan");

  await supabaseAdmin.from("Job").update({ isOpen: !job.isOpen }).eq("id", jobId);
  revalidatePath("/admin/jobs");
  revalidatePath("/");
}

export async function markReviewed(applicationId: string) {
  await requireAdmin();
  await supabaseAdmin.from("Application").update({ status: "reviewed" }).eq("id", applicationId);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  await requireAdmin();
  await supabaseAdmin.from("Application").update({ status }).eq("id", applicationId);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function getResumeUrl(applicationId: string) {
  await requireAdmin();
  const { data: app, error } = await supabaseAdmin
    .from("Application")
    .select("resumePath")
    .eq("id", applicationId)
    .single();

  if (error || !app) throw new Error("Lamaran tidak ditemukan");
  const url = await getResumeDownloadUrl(app.resumePath);
  return url;
}

export async function viewResume(applicationId: string) {
  await requireAdmin();
  const { data: app, error } = await supabaseAdmin
    .from("Application")
    .select("resumePath")
    .eq("id", applicationId)
    .single();

  if (error || !app) throw new Error("Lamaran tidak ditemukan");
  const url = await getResumeDownloadUrl(app.resumePath);
  redirect(url);
}
