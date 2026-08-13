import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [openJobs, totalApps, newApps, recent] = await Promise.all([
    prisma.job.count({ where: { isOpen: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "new" } }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { job: { select: { title: true } } },
    }),
  ]);

  const stats = [
    { label: "Lowongan dibuka", value: openJobs },
    { label: "Total lamaran", value: totalApps },
    { label: "Belum direview", value: newApps, highlight: newApps > 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-white/10 bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${s.highlight ? "text-amp-blue-light" : ""}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Lamaran terbaru</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-black/20 text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Posisi</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  Belum ada lamaran masuk.
                </td>
              </tr>
            )}
            {recent.map((a) => (
              <tr key={a.id} className="border-t border-white/[0.08] bg-card">
                <td className="px-4 py-3">{a.fullName}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.job.title}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {a.createdAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link href="/admin/applications" className="mt-4 inline-block text-sm text-amp-blue-light hover:underline">
        Lihat semua lamaran →
      </Link>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return status === "reviewed" ? (
    <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-400">
      Reviewed
    </span>
  ) : (
    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
      Baru
    </span>
  );
}
