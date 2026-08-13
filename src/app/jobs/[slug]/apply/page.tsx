import Link from "next/link";
import { notFound } from "next/navigation";
import { getJobBySlug } from "@/lib/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ApplyForm } from "@/components/apply-form";
import { ChevronLeft, Briefcase, MapPin, Sparkles, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job || !job.isOpen) notFound();

  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col bg-[#030303]">
      <Header />

      <main suppressHydrationWarning className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
        {/* Navigation */}
        <Link
          href={`/jobs/${job.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Kembali ke Detail Lowongan</span>
        </Link>

        {/* Form Container */}
        <div suppressHydrationWarning className="mt-6 rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div suppressHydrationWarning className="absolute top-0 right-0 h-48 w-48 rounded-full bg-amp-blue/10 blur-3xl pointer-events-none" />

          {/* Job Summary Banner Header */}
          <div className="border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-semibold text-blue-300">
                <Sparkles className="h-3 w-3 text-amp-blue-light" />
                Formulir Lamaran
              </span>
              <span className="text-neutral-400">• AMPed Media</span>
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {job.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5 text-amp-blue-light" />
                {job.category}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                {job.location}
              </span>
            </div>
          </div>

          {/* Security & Confidentiality Banner */}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 text-xs text-emerald-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Data & CV kamu tersimpan dengan aman dan hanya diakses oleh Tim Rekrutmen AMP.</span>
          </div>

          {/* Apply Form */}
          <div className="mt-8">
            <ApplyForm jobId={job.id} jobTitle={job.title} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

