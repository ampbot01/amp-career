import Link from "next/link";
import { signOut } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/jobs", label: "Lowongan" },
  { href: "/admin/applications", label: "Lamaran" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/[0.08] bg-[#080808] p-4">
        <div className="mb-8 px-2 pt-2">
          <span className="font-heading text-lg font-semibold">AMP Careers</span>
          <p className="text-xs text-muted-foreground">Admin</p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition hover:bg-white/5 hover:text-red-400"
          >
            Keluar
          </button>
        </form>
      </aside>
      <main className="flex-1 p-6 sm:p-8">{children}</main>
    </div>
  );
}
