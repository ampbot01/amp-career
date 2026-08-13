import { JobForm } from "@/components/admin/job-form";

export const metadata = { title: "Lowongan Baru — AMP Careers Admin" };

export default function NewJobPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Lowongan Baru</h1>
      <div className="mt-6 rounded-xl border border-white/10 bg-card p-6">
        <JobForm />
      </div>
    </div>
  );
}
