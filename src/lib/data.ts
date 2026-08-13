import { supabaseAdmin } from "@/lib/supabase";

/**
 * Server-only helper function untuk mengambil seluruh lowongan aktif.
 * Menggunakan Supabase REST SDK murni (100% Serverless Native).
 */
export async function getOpenJobs(category?: string, searchKeyword?: string) {
  let jobs: any[] = [];
  let categories: { category: string }[] = [];
  let totalJobsCount = 0;

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
    console.error("Supabase REST Query Error in getOpenJobs:", sbErr);
  }

  return { jobs, categories, totalJobsCount };
}

/**
 * Server-only helper function untuk mengambil detail lowongan berdasarkan slug.
 */
export async function getJobBySlug(slug: string) {
  let job: any = null;
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
    console.error("Supabase REST Error in getJobBySlug:", sbErr);
  }

  return job;
}
