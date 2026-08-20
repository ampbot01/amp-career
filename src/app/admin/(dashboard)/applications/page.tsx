import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
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
  Calendar,
  DollarSign,
  Globe,
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

  let query = supabaseAdmin
    .from("Application")
    .select("*, Job(title, category, requirements)", { count: "exact" })
    .order("createdAt", { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1);

  if (jobId) query = query.eq("jobId", jobId);
  if (status) query = query.eq("status", status);

  const [appsRes, jobsRes] = await Promise.all([
    query,
    supabaseAdmin.from("Job").select("id, title").order("title", { ascending: true }),
  ]);

  const applications = (appsRes.data || []).map((a: any) => ({
    ...a,
    job: a.Job,
  }));
  const total = appsRes.count || 0;
  const jobs = jobsRes.data || [];

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (jobId) params.set("job", jobId);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin/applications?${params}`;
  };

  return (
    <div suppressHydrationWarning className="space-y-5 sm:space-y-6">
      {/* Header & Filter Controls */}
      <div suppressHydrationWarning className="flex flex-col gap-4">
        <div suppressHydrationWarning className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-extrabold text-white sm:text-2xl lg:text-3xl">
            Kelola Lamaran & ATS AI Pipeline
          </h1>
          <p className="text-xs text-neutral-400">
            Total <span className="font-semibold text-white">{total}</span> lamaran masuk di pipeline rekrutmen AMP
          </p>
        </div>

        {/* Filter Form */}
        <form
          method="get"
          className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 rounded-2xl border border-white/10 bg-[#0a0a0a] p-3 shadow-lg"
        >
          <div className="flex-1 min-w-[180px]">
            <select
              name="status"
              defaultValue={status ?? ""}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amp-blue transition"
            >
              <option value="" className="bg-[#0e0e0e]">Semua Status Pipeline</option>
              {STAGES.map((s) => (
                <option key={s.value} value={s.value} className="bg-[#0e0e0e]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <select
              name="job"
              defaultValue={jobId ?? ""}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-xs text-white outline-none focus:border-amp-blue transition"
            >
              <option value="" className="bg-[#0e0e0e]">Semua Posisi Lowongan</option>
              {jobs.map((j: { id: string; title: string }) => (
                <option key={j.id} value={j.id} className="bg-[#0e0e0e]">
                  {j.title}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-btn-gradient px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:brightness-110 active:scale-95 shrink-0"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Terapkan Filter</span>
          </button>
        </form>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-8 sm:p-12 text-center text-neutral-500 shadow-xl">
          <Users className="mx-auto h-10 w-10 text-neutral-600 mb-3" />
          <p className="font-semibold text-white text-sm sm:text-base">Belum Ada Lamaran Ditemukan</p>
          <p className="mt-1 text-xs text-neutral-400">
            Tidak ada kandidat yang cocok dengan kriteria filter saat ini.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Mobile Candidate Cards (< md) */}
          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {applications.map((a: any) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl space-y-3.5 transition hover:border-white/20"
              >
                {/* Header: Candidate Info & Status Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 font-heading font-extrabold text-amp-blue-light text-sm shrink-0">
                      {a.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{a.fullName}</div>
                      <div className="text-xs text-neutral-400">{a.job?.title ?? "Posisi Lowongan"}</div>
                      {a.source && (
                        <span className="text-[10px] text-neutral-500">Via {a.source}</span>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={a.status} />
                </div>

                {/* ATS AI Score & Quick Summary Banner */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-xs font-semibold text-neutral-300">Hasil ATS AI:</span>
                  </div>
                  <AdminAiModal
                    applicationId={a.id}
                    fullName={a.fullName}
                    jobTitle={a.job?.title ?? "Lowongan"}
                    aiScore={a.aiScore}
                    aiSummary={a.aiSummary}
                    aiAnalysisJson={a.aiAnalysis}
                  />
                </div>

                {/* Candidate Details & Salary */}
                <div className="space-y-1.5 text-xs text-neutral-300 border-t border-white/[0.06] pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Mail className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                      <a href={`mailto:${a.email}`} className="text-neutral-300 hover:text-amp-blue-light truncate">
                        {a.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-neutral-400 shrink-0">
                      <Calendar className="h-3 w-3 text-neutral-500" />
                      <span>
                        {new Date(a.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <Phone className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                    <a href={`tel:${a.phone}`} className="text-neutral-300 hover:text-white">
                      {a.phone}
                    </a>
                  </div>

                  {(a.expectedSalary || a.currentSalary) && (
                    <div className="flex items-center justify-between text-[11px] bg-white/[0.02] rounded-lg px-2.5 py-1.5 border border-white/[0.04] mt-2">
                      <span className="text-neutral-400">Ekspektasi Gaji:</span>
                      <span className="font-semibold text-emerald-400">
                        {a.expectedSalary ?? a.currentSalary}
                      </span>
                    </div>
                  )}

                  {a.portfolioUrl && (
                    <div className="pt-1">
                      <a
                        href={a.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-400 hover:underline"
                      >
                        <Globe className="h-3 w-3" />
                        <span>Buka Link Portfolio / LinkedIn</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex items-center justify-end border-t border-white/[0.06] pt-3">
                  <AdminWaActions
                    applicationId={a.id}
                    fullName={a.fullName}
                    phone={a.phone}
                    jobTitle={a.job?.title ?? "Lowongan"}
                    currentStatus={a.status}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 2. Desktop Table View (>= md) */}
          <div suppressHydrationWarning className="hidden md:block rounded-2xl border border-white/10 bg-[#0a0a0a] shadow-xl min-h-[360px]">
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
                  {applications.map((a: any) => (
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
                        <span className="font-semibold text-white">{a.job?.title ?? "—"}</span>
                        <span className="block text-[10px] text-neutral-500">{a.job?.category ?? "—"}</span>
                      </td>

                      {/* Skor ATS AI */}
                      <td className="px-5 py-4">
                        <AdminAiModal
                          applicationId={a.id}
                          fullName={a.fullName}
                          jobTitle={a.job?.title ?? "Lowongan"}
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

                      {/* Salary */}
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
                        {new Date(a.createdAt).toLocaleDateString("id-ID", {
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
                            jobTitle={a.job?.title ?? "Lowongan"}
                            currentStatus={a.status}
                          />
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-white/[0.08] pt-4 text-xs">
          <span className="text-neutral-400">
            Hlm <strong className="text-white">{currentPage}</strong> dari{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={pageUrl(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-semibold text-white hover:bg-white/[0.08] active:scale-95 transition"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={pageUrl(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-semibold text-white hover:bg-white/[0.08] active:scale-95 transition"
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
