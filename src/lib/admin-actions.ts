"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { jobSchema } from "@/lib/validation";
import { getResumeDownloadUrl } from "@/lib/supabase";

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

  const existing = await prisma.job.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return { error: "Slug sudah dipakai, ganti yang lain" };

  await prisma.job.create({ data: parsed.data });
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

  const conflict = await prisma.job.findFirst({
    where: { slug: parsed.data.slug, NOT: { id: jobId } },
  });
  if (conflict) return { error: "Slug sudah dipakai lowongan lain" };

  await prisma.job.update({ where: { id: jobId }, data: parsed.data });
  revalidatePath("/admin/jobs");
  revalidatePath("/");
  redirect("/admin/jobs");
}

export async function toggleJobOpen(jobId: string) {
  await requireAdmin();
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId } });
  await prisma.job.update({ where: { id: jobId }, data: { isOpen: !job.isOpen } });
  revalidatePath("/admin/jobs");
  revalidatePath("/");
}

export async function markReviewed(applicationId: string) {
  await requireAdmin();
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: "reviewed" },
  });
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  await requireAdmin();
  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
}

export async function getResumeUrl(applicationId: string) {
  await requireAdmin();
  const app = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  const url = await getResumeDownloadUrl(app.resumePath);
  return url;
}

export async function viewResume(applicationId: string) {
  await requireAdmin();
  const app = await prisma.application.findUniqueOrThrow({ where: { id: applicationId } });
  const url = await getResumeDownloadUrl(app.resumePath);
  redirect(url);
}
