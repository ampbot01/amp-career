import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { JobForm } from "@/components/admin/job-form";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Edit: {job.title}</h1>
      <div className="mt-6 rounded-xl border border-white/10 bg-card p-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}
