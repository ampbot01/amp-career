import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ApplyForm } from "@/components/apply-form";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await prisma.job.findUnique({ where: { slug } });
  if (!job || !job.isOpen) notFound();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-8">
      <Link href={`/jobs/${job.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Kembali ke detail lowongan
      </Link>

      <div className="mt-6 rounded-2xl border border-white/10 bg-card p-6 sm:p-10">
        <p className="text-sm text-muted-foreground">Melamar untuk</p>
        <h1 className="mt-1 text-2xl font-semibold">{job.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {job.location} · {job.category}
        </p>

        <div className="mt-8">
          <ApplyForm jobId={job.id} jobTitle={job.title} />
        </div>
      </div>
    </main>
  );
}
