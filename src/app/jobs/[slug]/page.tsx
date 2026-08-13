import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

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
  const job = await prisma.job.findUnique({ where: { slug } });
  if (!job || !job.isOpen) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-8">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Semua lowongan
      </Link>

      <div className="mt-6 rounded-2xl border border-white/10 bg-card p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-amp-blue/10 px-2.5 py-0.5 font-medium text-blue-300">
            {job.category}
          </span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-muted-foreground">
            {job.location}
          </span>
          <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-muted-foreground">
            {TYPE_LABEL[job.type] ?? job.type}
          </span>
        </div>

        <h1 className="mt-4 text-2xl font-semibold sm:text-4xl">{job.title}</h1>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Tentang Peran Ini</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Kualifikasi</h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{job.requirements}</p>
        </section>

        <div className="mt-10 border-t border-white/[0.08] pt-6">
          <Link
            href={`/jobs/${job.slug}/apply`}
            className="bg-btn-gradient inline-block rounded-md px-6 py-3 font-medium text-white transition hover:brightness-110"
          >
            Lamar Posisi Ini
          </Link>
        </div>
      </div>
    </main>
  );
}
