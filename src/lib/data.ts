import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Server-only helper function untuk mengambil seluruh lowongan aktif.
 * Menggunakan Prisma sebagai primary query dan Supabase REST SDK sebagai fallback resilien.
 */
export async function getOpenJobs(category?: string, searchKeyword?: string) {
  const whereClause: any = { isOpen: true };
  if (category) {
    whereClause.category = category;
  }
  if (searchKeyword) {
    whereClause.OR = [
      { title: { contains: searchKeyword, mode: "insensitive" } },
      { description: { contains: searchKeyword, mode: "insensitive" } },
    ];
  }

  let jobs: any[] = [];
  let categories: { category: string }[] = [];
  let totalJobsCount = 0;

  try {
    const res = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.findMany({
        where: { isOpen: true },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.job.count({ where: { isOpen: true } }),
    ]);
    jobs = res[0];
    categories = res[1];
    totalJobsCount = res[2];
    if (jobs.length > 0) {
      return { jobs, categories, totalJobsCount };
    }
  } catch (err) {
    console.warn("Prisma DB Query failed, falling back to Supabase REST SDK:", err);
  }

  // Fallback ke Supabase REST SDK (100% HTTPS Native)
  try {
    const [jobsRes, appsRes] = await Promise.all([
      supabaseAdmin.from("Job").select("*").eq("isOpen", true).order("createdAt", { ascending: false }),
      supabaseAdmin.from("Application").select("id, jobId"),
    ]);

    if (jobsRes.data && jobsRes.data.length > 0) {
      let filtered = jobsRes.data;
      if (category) {
        filtered = filtered.filter((j: any) => j.category === category);
      }
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase();
        filtered = filtered.filter(
          (j: any) =>
            j.title?.toLowerCase().includes(kw) || j.description?.toLowerCase().includes(kw)
        );
      }

      const appCounts: Record<string, number> = {};
      (appsRes.data || []).forEach((a: any) => {
        appCounts[a.jobId] = (appCounts[a.jobId] || 0) + 1;
      });

      jobs = filtered.map((j: any) => ({
        ...j,
        _count: { applications: appCounts[j.id] || 0 },
      }));
      totalJobsCount = jobs.length;
      const cats = Array.from(new Set(jobsRes.data.map((j: any) => j.category)));
      categories = cats.map((c: any) => ({ category: c }));
    }
  } catch (sbErr) {
    console.error("Supabase REST Fallback Error in getOpenJobs:", sbErr);
  }

  return { jobs, categories, totalJobsCount };
}

/**
 * Server-only helper function untuk mengambil detail lowongan berdasarkan slug.
 */
export async function getJobBySlug(slug: string) {
  let job: any = null;
  try {
    job = await prisma.job.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
    if (job) return job;
  } catch (err) {
    console.warn("Prisma JobDetailPage DB Query Error, falling back to Supabase REST:", err);
  }

  try {
    const [jobRes, appsRes] = await Promise.all([
      supabaseAdmin.from("Job").select("*").eq("slug", slug).maybeSingle(),
      supabaseAdmin.from("Application").select("id, jobId"),
    ]);

    if (jobRes.data) {
      const appCount = (appsRes.data || []).filter((a: any) => a.jobId === jobRes.data.id).length;
      job = {
        ...jobRes.data,
        _count: { applications: appCount },
      };
    }
  } catch (sbErr) {
    console.error("Supabase REST Fallback Error in getJobBySlug:", sbErr);
  }

  return job;
}
