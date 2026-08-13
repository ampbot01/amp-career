import Link from "next/link";
import { prisma } from "@/lib/db";
import { toggleJobOpen } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Lowongan</h1>
        <Link
          href="/admin/jobs/new"
          className="bg-btn-gradient rounded-md px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          + Lowongan Baru
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/20 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Posisi</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Tipe</th>
              <th className="px-4 py-3 font-medium">Lamaran</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada lowongan.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-white/[0.08] bg-card">
                <td className="px-4 py-3 font-medium">{job.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{job.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{TYPE_LABEL[job.type] ?? job.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{job._count.applications}</td>
                <td className="px-4 py-3">
                  {job.isOpen ? (
                    <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-400">Open</span>
                  ) : (
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">Closed</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="rounded-md border border-white/10 px-3 py-1 text-xs transition hover:bg-white/10"
                    >
                      Edit
                    </Link>
                    <form action={toggleJobOpen.bind(null, job.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-white/10 px-3 py-1 text-xs text-muted-foreground transition hover:bg-white/10"
                      >
                        {job.isOpen ? "Tutup" : "Buka"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
