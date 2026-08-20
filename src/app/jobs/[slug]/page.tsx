import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/lib/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Share2,
  Calendar,
  Building2,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);

  if (!job || !job.isOpen) notFound();

  // Helper formatting for multi-line requirements
  const reqList = job.requirements
    ? job.requirements
        .split("\n")
        .map((line: string) => line.trim())
        .filter(Boolean)
    : [];

  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-[#030303]">
      <Header />

      <main suppressHydrationWarning className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-8 sm:py-10">
        {/* Breadcrumb & Navigation */}
        <div suppressHydrationWarning className="flex items-center gap-2 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition flex items-center gap-1">
            <ChevronLeft className="h-3.5 w-3.5" />
            Lowongan
          </Link>
          <span>/</span>
          <span className="text-neutral-500">{job.category}</span>
          <span>/</span>
          <span className="text-white font-medium truncate max-w-[160px] sm:max-w-[240px]">{job.title}</span>
        </div>

        {/* Hero Banner for Job */}
        <div className="mt-5 sm:mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#0a0a0a] via-[#070707] to-[#030303] p-5 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-amp-blue/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 font-semibold text-blue-300">
                  <Sparkles className="h-3 w-3 text-amp-blue-light" />
                  {job.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
                  Open Position
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-3 sm:mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                {job.title}
              </h1>

              {/* Quick Meta */}
              <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-neutral-300">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amp-blue-light" />
                  <span>AMPed Media</span>
                </div>
                <div className="hidden xs:block h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amp-blue-light" />
                  <span>{job.location}</span>
                </div>
                <div className="hidden xs:block h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span>{TYPE_LABEL[job.type] ?? job.type}</span>
                </div>
                <div className="hidden xs:block h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                  <Users className="h-4 w-4 text-purple-400" />
                  <span>{job._count?.applications ?? 0} Pelamar</span>
                </div>
                <div className="hidden sm:block h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Calendar className="h-4 w-4 text-neutral-500" />
                  <span suppressHydrationWarning>
                    Diposting {new Date(job.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Button Header */}
            <Link
              href={`/jobs/${job.slug}/apply`}
              className="bg-btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 shrink-0 active:scale-95"
            >
              <span>Lamar Posisi Ini</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-8 shadow-xl">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Briefcase className="h-4 sm:h-5 w-4 sm:w-5 text-amp-blue-light" />
                Deskripsi & Peran
              </h2>
              <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-neutral-300">
                {job.description}
              </p>
            </div>

            {/* Requirements Section */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-8 shadow-xl">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-4 sm:h-5 w-4 sm:w-5 text-emerald-400" />
                Kualifikasi & Persyaratan
              </h2>

              {reqList.length > 1 ? (
                <ul className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  {reqList.map((req: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="leading-relaxed">{req.replace(/^[•\-\*]\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed text-neutral-300">
                  {job.requirements}
                </p>
              )}
            </div>

            {/* Perks & Benefits Section */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a0a0a] to-black p-5 sm:p-8 shadow-xl">
              <h2 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Zap className="h-4 sm:h-5 w-4 sm:w-5 text-amber-400" />
                Benefit & Fasilitas Utama
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-xs font-bold text-white">AI Tools Subscription</p>
                  <p className="mt-1 text-xs text-neutral-400">Akses ke tools AI & infrastruktur terbaru.</p>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                  <p className="text-xs font-bold text-white">Jam Kerja Fleksibel</p>
                  <p className="mt-1 text-xs text-neutral-400">Dukungan penuh kerja Hybrid & Remote opsional.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-6">
            {/* Quick Summary Card */}
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#0a0a0a] p-5 sm:p-6 shadow-xl space-y-5">
              <div>
                <h3 className="font-heading text-base font-bold text-white">Ringkasan Lowongan</h3>
                <p className="text-xs text-neutral-400">AMPed Media Career Desk</p>
              </div>

              <div className="space-y-3.5 border-y border-white/[0.08] py-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Kategori:</span>
                  <span className="font-semibold text-white">{job.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Tipe Pekerjaan:</span>
                  <span className="font-semibold text-white">{TYPE_LABEL[job.type] ?? job.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Lokasi:</span>
                  <span className="font-semibold text-white">{job.location}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-neutral-400">Total Pelamar:</span>
                  <span className="font-bold text-purple-300 flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    {job._count?.applications ?? 0} Pelamar
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Status:</span>
                  <span className="font-semibold text-emerald-400">Menerima Lamaran</span>
                </div>
              </div>

              <Link
                href={`/jobs/${job.slug}/apply`}
                className="bg-btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:brightness-110 active:scale-95"
              >
                <span>Lamar Posisi Ini</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="pt-1 text-center">
                <p className="text-[11px] text-neutral-400">
                  Respon awal dikirim maksimal dalam 2 hari kerja.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
