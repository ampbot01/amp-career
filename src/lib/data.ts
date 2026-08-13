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
    return { jobs, categories, totalJobsCount };
  } catch (err) {
    console.warn("Prisma DB Query failed, falling back to Supabase REST SDK:", err);
    try {
      let query = supabaseAdmin.from("Job").select("*, Application(count)").eq("isOpen", true);
      if (category) {
        query = query.eq("category", category);
      }
      if (searchKeyword) {
        query = query.or(`title.ilike.%${searchKeyword}%,description.ilike.%${searchKeyword}%`);
      }
      const { data: dbJobs } = await query.order("createdAt", { ascending: false });

      if (dbJobs) {
        jobs = dbJobs.map((j: any) => ({
          ...j,
          _count: { applications: Array.isArray(j.Application) ? (j.Application[0]?.count ?? 0) : 0 },
        }));
        totalJobsCount = jobs.length;
        const cats = Array.from(new Set(jobs.map((j: any) => j.category)));
        categories = cats.map((c: string) => ({ category: c }));
      }
    } catch (sbErr) {
      console.error("Supabase REST Fallback Error in getOpenJobs:", sbErr);
    }
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
    const { data: dbJob } = await supabaseAdmin
      .from("Job")
      .select("*, Application(count)")
      .eq("slug", slug)
      .maybeSingle();

    if (dbJob) {
      job = {
        ...dbJob,
        _count: { applications: Array.isArray(dbJob.Application) ? (dbJob.Application[0]?.count ?? 0) : 0 },
      };
    }
  } catch (sbErr) {
    console.error("Supabase REST Fallback Error in getJobBySlug:", sbErr);
  }

  return job;
}
