import { signOut } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ShieldCheck } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  }

  return (
    <div suppressHydrationWarning className="flex min-h-screen flex-col lg:flex-row bg-[#030303]">
      <AdminSidebar signOutAction={handleSignOut} />

      <div suppressHydrationWarning className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar (Hidden on Mobile because AdminSidebar has mobile header) */}
        <header
          suppressHydrationWarning
          className="hidden lg:flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#050505] px-8"
        >
          <div suppressHydrationWarning className="flex items-center gap-3">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 border border-blue-500/20">
              AMP Careers Management System
            </span>
          </div>

          <div suppressHydrationWarning className="flex items-center gap-4">
            <div
              suppressHydrationWarning
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs text-neutral-400"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
              <span>Admin Authorized</span>
            </div>
          </div>
        </header>

        {/* Main Content Area with bottom padding on mobile for bottom navigation bar */}
        <main
          suppressHydrationWarning
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:p-8 pb-24 lg:pb-8 max-w-full"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
