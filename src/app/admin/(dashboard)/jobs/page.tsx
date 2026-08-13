import Link from "next/link";
import { prisma } from "@/lib/db";
import { toggleJobOpen } from "@/lib/admin-actions";
import { Plus, Briefcase, Edit, Eye, Sparkles, CheckCircle2, XCircle } from "lucide-react";

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
    <div suppressHydrationWarning className="space-y-6">
      {/* Page Header */}
      <div suppressHydrationWarning className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div suppressHydrationWarning>
          <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
            Kelola Lowongan Pekerjaan
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Daftar seluruh posisi pekerjaan aktif dan tertutup di AMP
          </p>
        </div>

        <Link
          href="/admin/jobs/new"
          className="bg-btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          <span>+ Lowongan Baru</span>
        </Link>
      </div>

      {/* Main Table Container */}
      <div suppressHydrationWarning className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl">
        <div suppressHydrationWarning className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/30 text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4 font-semibold">Posisi Pekerjaan</th>
                <th className="px-5 py-4 font-semibold">Kategori</th>
                <th className="px-5 py-4 font-semibold">Tipe</th>
                <th className="px-5 py-4 font-semibold">Jumlah Pelamar</th>
                <th className="px-5 py-4 font-semibold">Status Lowongan</th>
                <th className="px-5 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                    <Briefcase className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
                    <p className="font-semibold text-white">Belum Ada Lowongan</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Klik "+ Lowongan Baru" untuk membuat posisi pertama.
                    </p>
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/jobs/${job.slug}`}
                          target="_blank"
                          className="hover:text-amp-blue-soft transition"
                        >
                          {job.title}
                        </Link>
                      </div>
                      <span className="block text-[10px] text-neutral-500 font-normal mt-0.5">
                        {job.location}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                        <Sparkles className="h-3 w-3 text-amp-blue-light" />
                        {job.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-neutral-300 font-medium">
                      {TYPE_LABEL[job.type] ?? job.type}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white">
                        {job._count.applications} Pelamar
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {job.isOpen ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Terbuka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-neutral-400">
                          <XCircle className="h-3 w-3" />
                          Ditutup
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-neutral-200 hover:border-white/20 hover:bg-white/[0.08] transition"
                        >
                          <Edit className="h-3 w-3 text-amp-blue-light" />
                          <span>Edit</span>
                        </Link>
                        <form action={toggleJobOpen.bind(null, job.id)}>
                          <button
                            type="submit"
                            className={`rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition ${
                              job.isOpen
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            }`}
                          >
                            {job.isOpen ? "Tutup" : "Buka Lowongan"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

