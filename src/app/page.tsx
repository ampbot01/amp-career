import Link from "next/link";
import { prisma } from "@/lib/db";
import { Hero } from "@/components/hero";
import { JobCard } from "@/components/job-card";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const [jobs, categories] = await Promise.all([
    prisma.job.findMany({
      where: { isOpen: true, ...(category ? { category } : {}) },
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.findMany({
      where: { isOpen: true },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-6 sm:px-8 sm:pt-10">
      <Hero />

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {jobs.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-card p-10 text-center text-muted-foreground">
              {category
                ? `Belum ada lowongan di kategori "${category}".`
                : "Belum ada lowongan terbuka saat ini. Cek lagi nanti!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} {...job} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-card p-5">
            <h2 className="mb-3 text-sm font-semibold">Kategori</h2>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/"
                  className={!category ? "font-medium text-amp-blue-light" : "text-muted-foreground hover:text-foreground"}
                >
                  Semua
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.category}>
                  <Link
                    href={`/?category=${encodeURIComponent(c.category)}`}
                    className={
                      category === c.category
                        ? "font-medium text-amp-blue-light"
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    {c.category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-white/10 bg-card p-5 text-sm text-muted-foreground">
            <p>
              Gak nemu posisi yang cocok? Pantau terus halaman ini — tim AMP
              terus berkembang.
            </p>
          </div>
        </aside>
      </div>

      <footer className="mt-20 border-t border-white/[0.08] py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AMP — Bespoke Creative Teams, Powered by AI</p>
      </footer>
    </main>
  );
}
