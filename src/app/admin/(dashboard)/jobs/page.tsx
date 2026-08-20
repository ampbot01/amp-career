import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import { toggleJobOpen } from "@/lib/admin-actions";
import {
  Plus,
  Briefcase,
  Edit,
  Eye,
  Sparkles,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export default async function AdminJobsPage() {
  const [jobsRes, appsRes] = await Promise.all([
    supabaseAdmin.from("Job").select("*").order("createdAt", { ascending: false }),
    supabaseAdmin.from("Application").select("id, jobId"),
  ]);

  const appCounts: Record<string, number> = {};
  (appsRes.data || []).forEach((a: any) => {
    appCounts[a.jobId] = (appCounts[a.jobId] || 0) + 1;
  });

  const jobs = (jobsRes.data || []).map((j: any) => ({
    ...j,
    _count: { applications: appCounts[j.id] || 0 },
  }));

  return (
    <div suppressHydrationWarning className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div suppressHydrationWarning className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div suppressHydrationWarning>
          <h1 className="font-heading text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
            Kelola Lowongan Pekerjaan
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Total <span className="font-semibold text-white">{jobs.length}</span> posisi terdaftar di portal karir AMP
          </p>
        </div>

        <Link
          href="/admin/jobs/new"
          className="bg-btn-gradient flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110 active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>+ Buat Lowongan Baru</span>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 sm:p-12 text-center text-neutral-500 shadow-xl">
          <Briefcase className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
          <p className="font-semibold text-white text-sm sm:text-base">Belum Ada Lowongan</p>
          <p className="mt-1 text-xs text-neutral-400">
            Klik tombol "+ Buat Lowongan Baru" di atas untuk mempublikasikan posisi pertama.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Job Management Cards (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {jobs.map((job: any) => (
              <div
                key={job.id}
                className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl space-y-3.5 transition hover:border-white/20"
              >
                {/* Header: Title, Category, Open/Closed Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/jobs/${job.slug}`}
                      target="_blank"
                      className="font-heading font-bold text-white text-sm hover:text-amp-blue-soft transition flex items-center gap-1.5"
                    >
                      <span>{job.title}</span>
                      <ExternalLink className="h-3 w-3 text-neutral-500 shrink-0" />
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-emerald-400" />
                        <span>{job.location}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>{TYPE_LABEL[job.type] ?? job.type}</span>
                      </div>
                    </div>
                  </div>

                  {job.isOpen ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                      Buka
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-neutral-400 shrink-0">
                      Tutup
                    </span>
                  )}
                </div>

                {/* Badges & Stats */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-300">
                    <Sparkles className="h-3 w-3 text-amp-blue-light" />
                    {job.category}
                  </span>

                  <Link
                    href={`/admin/applications?job=${job.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-500/20"
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>{job._count.applications} Pelamar</span>
                  </Link>
                </div>

                {/* Mobile Action Buttons */}
                <div className="grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-3">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-semibold text-neutral-200 hover:bg-white/[0.08] active:scale-95 transition"
                  >
                    <Edit className="h-3.5 w-3.5 text-amp-blue-light" />
                    <span>Edit Data</span>
                  </Link>

                  <form action={toggleJobOpen.bind(null, job.id)} className="w-full">
                    <button
                      type="submit"
                      className={`w-full flex items-center justify-center rounded-xl border py-2.5 text-xs font-semibold active:scale-95 transition ${
                        job.isOpen
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      }`}
                    >
                      {job.isOpen ? "Tutup Lowongan" : "Buka Lowongan"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop Table View (>= md) */}
          <div suppressHydrationWarning className="hidden md:block overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl">
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
                  {jobs.map((job: any) => (
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
                        <Link
                          href={`/admin/applications?job=${job.id}`}
                          className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/[0.08]"
                        >
                          {job._count.applications} Pelamar
                        </Link>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
