import Link from "next/link";
import { prisma } from "@/lib/db";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/hero";
import { JobCard } from "@/components/job-card";
import { Briefcase, Layers, Sparkles, Search, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;

  const whereClause: any = { isOpen: true };
  if (category) {
    whereClause.category = category;
  }
  if (q) {
    whereClause.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [jobs, categories, totalJobsCount] = await Promise.all([
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

  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-[#030303]">
      <Header />

      <main suppressHydrationWarning className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8 sm:py-10">
        {/* High-Impact Hero */}
        <Hero />

        {/* Search & Filter Header Bar */}
        <div suppressHydrationWarning className="mt-10 flex flex-col gap-4 border-b border-white/[0.08] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-amp-blue-light" />
              Posisi Terbuka Saat Ini
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Menampilkan {jobs.length} dari {totalJobsCount} lowongan aktif di AMP
            </p>
          </div>

          {/* Search Input Form */}
          <form method="get" className="relative max-w-md w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Cari posisi atau skill…"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 outline-none transition focus:border-amp-blue focus:bg-black focus:ring-1 focus:ring-amp-blue/50"
            />
            {category && <input type="hidden" name="category" value={category} />}
          </form>
        </div>

        {/* Category Pills Bar */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              !category
                ? "bg-btn-gradient text-white shadow-md shadow-blue-500/25"
                : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Semua Posisi</span>
            <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {totalJobsCount}
            </span>
          </Link>

          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/?category=${encodeURIComponent(c.category)}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                category === c.category
                  ? "bg-btn-gradient text-white shadow-md shadow-blue-500/25"
                  : "border border-white/10 bg-white/[0.03] text-neutral-400 hover:border-white/20 hover:text-white"
              }`}
            >
              <span>{c.category}</span>
            </Link>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
          {/* Job Cards Column */}
          <div className="lg:col-span-2">
            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-card p-12 text-center shadow-inner">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.04] text-neutral-400 mb-4">
                  <Briefcase className="h-6 w-6 text-amp-blue-light" />
                </div>
                <h3 className="font-heading text-lg font-bold text-white">Tidak ada posisi ditemukan</h3>
                <p className="mt-2 text-xs text-neutral-400 max-w-sm mx-auto">
                  {category
                    ? `Belum ada posisi terbuka untuk kategori "${category}". Coba lihat kategori lain!`
                    : "Belum ada lowongan baru saat ini. Silakan periksa kembali nanti."}
                </p>
                {category && (
                  <Link
                    href="/"
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-amp-blue-light hover:underline"
                  >
                    Lihat semua posisi →
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {jobs.map((job) => (
                  <JobCard key={job.id} {...job} applicantCount={job._count.applications} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar Widgets */}
          <aside className="space-y-6">
            {/* Why Join AMP Widget */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-amp-blue/10 blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-sm font-bold font-heading text-white">
                <Sparkles className="h-4 w-4 text-amp-blue-light" />
                <span>Mengapa Bergabung di AMP?</span>
              </div>
              <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
                Kami percaya pada gabungan talenta terbaik manusia dan efisiensi AI.
              </p>

              <ul className="mt-4 space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Akses tools AI premium & infrastruktur terdepan</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Budaya kerja fleksibel (Hybrid / Remote)</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
