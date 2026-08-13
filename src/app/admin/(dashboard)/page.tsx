import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  Briefcase,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [openJobs, totalApps, newApps, recent] = await Promise.all([
    prisma.job.count({ where: { isOpen: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "new" } }),
    prisma.application.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true, category: true } } },
    }),
  ]);

  return (
    <div suppressHydrationWarning className="space-y-8">
      {/* Dashboard Title & Quick Action Bar */}
      <div suppressHydrationWarning className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div suppressHydrationWarning>
          <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Ringkasan posisi lowongan dan pelamar masuk di portal karir AMP
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs/new"
            className="bg-btn-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            <span>+ Lowongan Baru</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {/* Metric 1 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl transition hover:border-amp-blue/40">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amp-blue/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Lowongan Dibuka</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-amp-blue-light border border-blue-500/20">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 font-heading text-3xl font-extrabold text-white">{openJobs}</p>
          <p className="mt-2 text-[11px] text-neutral-400">Posisi aktif dapat dilamar publik</p>
        </div>

        {/* Metric 2 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl transition hover:border-purple-500/40">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-purple-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Total Lamaran Masuk</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 font-heading text-3xl font-extrabold text-white">{totalApps}</p>
          <p className="mt-2 text-[11px] text-neutral-400">Akumulasi seluruh kandidat</p>
        </div>

        {/* Metric 3 */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl transition hover:border-amber-500/40">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Lamaran Belum Direview</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="font-heading text-3xl font-extrabold text-amber-400">{newApps}</p>
            {newApps > 0 && (
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Membutuhkan tindakan
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-neutral-400">Menunggu verifikasi tim HR</p>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-amp-blue-light" />
              Lamaran Terbaru Masuk
            </h2>
            <p className="text-xs text-neutral-400">5 pelamar terakhir yang mengirimkan dokumen</p>
          </div>

          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amp-blue-light hover:underline"
          >
            <span>Semua Lamaran</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="px-4 py-3 font-semibold">Pelamar</th>
                <th className="px-4 py-3 font-semibold">Posisi</th>
                <th className="px-4 py-3 font-semibold">Kontak</th>
                <th className="px-4 py-3 font-semibold">Tanggal Kirim</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-500">
                    Belum ada lamaran yang masuk.
                  </td>
                </tr>
              ) : (
                recent.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-heading font-extrabold text-white text-xs shrink-0">
                        {a.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span>{a.fullName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-300">
                      <span className="inline-block font-semibold text-white">{a.job.title}</span>
                      <span className="block text-[10px] text-neutral-500">{a.job.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-400">
                      <div className="text-neutral-200">{a.email}</div>
                      <div className="text-[10px] text-neutral-500">{a.phone}</div>
                    </td>
                    <td className="px-4 py-3.5 text-neutral-400">
                      {a.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/admin/applications"
                        className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-neutral-200 hover:border-white/20 hover:bg-white/[0.08]"
                      >
                        Detail
                      </Link>
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

export function StatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Resmi Diterima
      </span>
    );
  }
  if (status === "offering") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400">
        <UserCheck className="h-3 w-3" />
        Tahap Offering
      </span>
    );
  }
  if (status === "interview") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400">
        <UserCheck className="h-3 w-3" />
        Tahap Interview
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">
        <AlertCircle className="h-3 w-3" />
        Ditolak
      </span>
    );
  }
  if (status === "reviewed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
        <UserCheck className="h-3 w-3" />
        Ditinjau
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-500/30 bg-neutral-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-neutral-300">
      <Clock className="h-3 w-3 animate-pulse" />
      Baru
    </span>
  );
}

