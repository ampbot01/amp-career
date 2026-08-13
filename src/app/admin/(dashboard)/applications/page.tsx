import Link from "next/link";
import { prisma } from "@/lib/db";
import { markReviewed, viewResume } from "@/lib/admin-actions";
import { StatusBadge } from "@/app/admin/(dashboard)/page";
import { AdminWaActions } from "@/components/admin-wa-actions";
import { AdminAiModal } from "@/components/admin-ai-modal";
import {
  Users,
  Filter,
  ExternalLink,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Briefcase,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function formatRupiah(val: string | null | undefined) {
  if (!val) return null;
  const num = parseInt(String(val).replace(/\D/g, ""), 10);
  if (isNaN(num)) return val;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

const STAGES = [
  { value: "new", label: "Baru (New)" },
  { value: "interview", label: "Tahap Interview" },
  { value: "offering", label: "Tahap Offering" },
  { value: "accepted", label: "Resmi Diterima (Hired)" },
  { value: "rejected", label: "Ditolak" },
];

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; status?: string; page?: string }>;
}) {
  const { job: jobId, status, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const where: any = {};
  if (jobId) where.jobId = jobId;
  if (status) where.status = status;

  const [applications, total, jobs] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { job: { select: { title: true, category: true, requirements: true } } },
    }),
    prisma.application.count({ where }),
    prisma.job.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (jobId) params.set("job", jobId);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin/applications?${params}`;
  };

  return (
    <div suppressHydrationWarning className="space-y-6">
      {/* Header & Filter Controls */}
      <div suppressHydrationWarning className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div suppressHydrationWarning>
          <h1 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
            Daftar Lamaran & Recruitment Pipeline
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Total {total} lamaran masuk di pipeline rekrutmen AMP dengan Penilaian ATS AI
          </p>
        </div>

        {/* Filter Form */}
        <form method="get" className="flex flex-wrap items-center gap-2">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-xs text-white outline-none focus:border-amp-blue"
          >
            <option value="">Semua Pipeline Stage</option>
            {STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            name="job"
            defaultValue={jobId ?? ""}
            className="rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-xs text-white outline-none focus:border-amp-blue"
          >
            <option value="">Semua Posisi Lowongan</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
          >
            <Filter className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Main Applications Table */}
      <div suppressHydrationWarning className="rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl min-h-[360px]">
        <div suppressHydrationWarning className="overflow-x-auto rounded-2xl pb-16">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-white/[0.08] bg-black/30 text-neutral-400 uppercase tracking-wider text-[10px]">
                <th className="px-5 py-4 font-semibold">Nama Pelamar</th>
                <th className="px-5 py-4 font-semibold">Posisi Dilamar</th>
                <th className="px-5 py-4 font-semibold">Skor ATS AI</th>
                <th className="px-5 py-4 font-semibold">Kontak</th>
                <th className="px-5 py-4 font-semibold">Ekspektasi Gaji</th>
                <th className="px-5 py-4 font-semibold">Portfolio</th>
                <th className="px-5 py-4 font-semibold">Tanggal Kirim</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold text-right">Tindakan Rekrutmen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-neutral-500">
                    <Users className="mx-auto h-8 w-8 text-neutral-600 mb-2" />
                    <p className="font-semibold text-white">Belum Ada Lamaran</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Belum ada kandidat yang mengirim lamaran untuk filter ini.
                    </p>
                  </td>
                </tr>
              ) : (
                applications.map((a) => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Pelamar */}
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 font-heading font-extrabold text-amp-blue-light text-xs shrink-0">
                          {a.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span>{a.fullName}</span>
                          {a.source && (
                            <span className="block text-[10px] text-neutral-500 font-normal">
                              Via {a.source}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Posisi */}
                    <td className="px-5 py-4 text-neutral-200">
                      <span className="font-semibold text-white">{a.job.title}</span>
                      <span className="block text-[10px] text-neutral-500">{a.job.category}</span>
                    </td>

                    {/* Skor ATS AI */}
                    <td className="px-5 py-4">
                      <AdminAiModal
                        applicationId={a.id}
                        fullName={a.fullName}
                        jobTitle={a.job.title}
                        aiScore={a.aiScore}
                        aiSummary={a.aiSummary}
                        aiAnalysisJson={a.aiAnalysis}
                      />
                    </td>

                    {/* Kontak */}
                    <td className="px-5 py-4 text-neutral-300">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-neutral-500 shrink-0" />
                        <a href={`mailto:${a.email}`} className="hover:text-amp-blue-light transition truncate max-w-[160px]">
                          {a.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-neutral-400 text-[11px]">
                        <Phone className="h-3 w-3 text-neutral-500 shrink-0" />
                        <span>{a.phone}</span>
                      </div>
                    </td>

                    {/* Current & Expected Salary */}
                    <td className="px-5 py-4 text-neutral-300">
                      {a.expectedSalary ? (
                        <div>
                          <span className="block font-semibold text-emerald-400 text-[11px]">
                            Exp: {a.expectedSalary}
                          </span>
                          {a.currentSalary && (
                            <span className="block text-[10px] text-neutral-400">
                              Curr: {a.currentSalary}
                            </span>
                          )}
                        </div>
                      ) : a.currentSalary ? (
                        <span className="text-[11px] text-neutral-400">Curr: {a.currentSalary}</span>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Portfolio */}
                    <td className="px-5 py-4">
                      {a.portfolioUrl ? (
                        <a
                          href={a.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300 hover:bg-blue-500/20 transition"
                        >
                          <span>Buka Portfolio</span>
                          <ExternalLink className="h-3 w-3 text-amp-blue-light" />
                        </a>
                      ) : (
                        <span className="text-neutral-500 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="px-5 py-4 text-neutral-400 text-[11px]">
                      {a.createdAt.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={a.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end">
                        <AdminWaActions
                          applicationId={a.id}
                          fullName={a.fullName}
                          phone={a.phone}
                          jobTitle={a.job.title}
                          currentStatus={a.status}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs">
          <span className="text-neutral-400">
            Halaman <strong className="text-white">{currentPage}</strong> dari{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={pageUrl(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-white hover:bg-white/[0.08]"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={pageUrl(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 font-semibold text-white hover:bg-white/[0.08]"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

