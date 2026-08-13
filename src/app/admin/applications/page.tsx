import Link from "next/link";
import { prisma } from "@/lib/db";
import { markReviewed, viewResume } from "@/lib/admin-actions";
import { StatusBadge } from "@/app/admin/page";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; page?: string }>;
}) {
  const { job: jobId, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const where = jobId ? { jobId } : {};

  const [applications, total, jobs] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { job: { select: { title: true } } },
    }),
    prisma.application.count({ where }),
    prisma.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (jobId) params.set("job", jobId);
    params.set("page", String(p));
    return `/admin/applications?${params}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Lamaran</h1>
        <form method="get">
          <select
            name="job"
            defaultValue={jobId ?? ""}
            onChange={undefined}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            <option value="">Semua posisi</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <button type="submit" className="ml-2 rounded-md border border-white/10 px-3 py-2 text-sm transition hover:bg-white/10">
            Filter
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/20 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Posisi</th>
              <th className="px-4 py-3 font-medium">Kontak</th>
              <th className="px-4 py-3 font-medium">Portfolio</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada lamaran.
                </td>
              </tr>
            )}
            {applications.map((a) => (
              <tr key={a.id} className="border-t border-white/[0.08] bg-card align-top">
                <td className="px-4 py-3 font-medium">{a.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.job.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{a.email}</div>
                  <div className="text-xs">{a.phone}</div>
                </td>
                <td className="px-4 py-3">
                  {a.portfolioUrl ? (
                    <a href={a.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-amp-blue-light hover:underline">
                      Buka ↗
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <form action={viewResume.bind(null, a.id)}>
                      <button type="submit" className="rounded-md border border-white/10 px-3 py-1 text-xs transition hover:bg-white/10">
                        Lihat CV
                      </button>
                    </form>
                    {a.status === "new" && (
                      <form action={markReviewed.bind(null, a.id)}>
                        <button type="submit" className="rounded-md border border-white/10 px-3 py-1 text-xs text-muted-foreground transition hover:bg-white/10">
                          Tandai reviewed
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center gap-2 text-sm">
          {currentPage > 1 && (
            <Link href={pageUrl(currentPage - 1)} className="rounded-md border border-white/10 px-3 py-1 transition hover:bg-white/10">
              ← Prev
            </Link>
          )}
          <span className="text-muted-foreground">
            Halaman {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link href={pageUrl(currentPage + 1)} className="rounded-md border border-white/10 px-3 py-1 transition hover:bg-white/10">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
