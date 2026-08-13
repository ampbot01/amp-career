import { signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Bell, Search, ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-[#030303]">
      <AdminSidebar signOutAction={handleSignOut} />

      <div suppressHydrationWarning className="flex flex-1 flex-col overflow-hidden">
        {/* Top Dashboard Header Bar */}
        <header suppressHydrationWarning className="flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#050505] px-6">
          <div suppressHydrationWarning className="flex items-center gap-3">
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-500/20">
              AMP Careers Management System
            </span>
          </div>

          <div suppressHydrationWarning className="flex items-center gap-4">
            <div suppressHydrationWarning className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span>Admin Authorized</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main suppressHydrationWarning className="flex-1 overflow-y-auto p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

