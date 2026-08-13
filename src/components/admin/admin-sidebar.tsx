"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ExternalLink,
  Sparkles,
} from "lucide-react";

type AdminSidebarProps = {
  signOutAction: () => Promise<void>;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
  { href: "/admin/jobs", label: "Kelola Lowongan", icon: Briefcase },
  { href: "/admin/applications", label: "Kelola Lamaran", icon: Users },
];

export function AdminSidebar({ signOutAction }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside suppressHydrationWarning className="flex w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#080808] p-4 text-xs font-medium">
      {/* Brand Header */}
      <div className="mb-6 px-3 pt-2">
        <Link href="/admin" className="flex items-center gap-2.5">
          <img
            src="https://res.cloudinary.com/dtjq8cgqh/image/upload/v1766389028/AMP_dark_4x_kf9k4p.webp"
            alt="AMP Logo"
            className="h-7 w-auto object-contain"
          />
          <div className="flex flex-col">
            <span className="font-heading text-xs font-bold tracking-tight text-white">
              Careers Admin
            </span>
            <span className="text-[10px] text-neutral-400">Control Panel</span>
          </div>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          Main Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 font-semibold transition-all ${
                isActive
                  ? "bg-amp-blue/15 text-white border-l-2 border-amp-blue shadow-sm shadow-blue-500/10"
                  : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-amp-blue-light" : "text-neutral-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="space-y-3 border-t border-white/[0.08] pt-4">
        {/* Candidate Site Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>Lihat Website Candidate</span>
          </span>
          <ExternalLink className="h-3 w-3 text-neutral-500" />
        </a>

        {/* User Pill & Sign Out */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2 text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Keluar Sesi</span>
            </span>
          </button>
        </form>
      </div>
    </aside>
  );
}

