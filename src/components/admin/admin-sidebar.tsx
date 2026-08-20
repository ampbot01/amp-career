"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  LogOut,
  ExternalLink,
  Sparkles,
  Menu,
  X,
  Plus,
} from "lucide-react";

type AdminSidebarProps = {
  signOutAction: () => Promise<void>;
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/jobs", label: "Kelola Lowongan", icon: Briefcase, exact: false },
  { href: "/admin/applications", label: "Kelola Lamaran", icon: Users, exact: false },
];

export function AdminSidebar({ signOutAction }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Tutup drawer mobile secara otomatis ketika route/path berubah
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Kunci scroll body saat drawer mobile terbuka
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="mb-6 flex items-center justify-between px-3 pt-2">
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

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-xl p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Main Menu
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-3 font-semibold transition-all text-xs sm:py-2.5 ${
                  isActive
                    ? "bg-amp-blue/15 text-white border-l-2 border-amp-blue shadow-sm shadow-blue-500/10"
                    : "text-neutral-400 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-amp-blue-light" : "text-neutral-400"
                  }`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="space-y-3 border-t border-white/[0.08] pt-4">
        {/* Candidate Site Quick Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-neutral-300 transition hover:bg-white/[0.08] hover:text-white"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-amp-blue-light" />
            <span className="text-xs">Website Candidate</span>
          </span>
          <ExternalLink className="h-3 w-3 text-neutral-500" />
        </a>

        {/* User Pill & Sign Out */}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs text-neutral-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Keluar Sesi</span>
            </span>
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Fixed Sidebar */}
      <aside
        suppressHydrationWarning
        className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#080808] p-4 text-xs font-medium min-h-screen sticky top-0"
      >
        {navContent}
      </aside>

      {/* 2. Mobile Floating Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs border-r border-white/10 bg-[#0a0a0a] p-4 shadow-2xl animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}

      {/* 3. Mobile Header Bar (Visible on mobile screens) */}
      <header
        suppressHydrationWarning
        className="lg:hidden sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-white/[0.08] bg-[#050505]/90 px-4 backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white transition active:scale-95"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            <img
              src="https://res.cloudinary.com/dtjq8cgqh/image/upload/v1766389028/AMP_dark_4x_kf9k4p.webp"
              alt="AMP Logo"
              className="h-6 w-auto object-contain"
            />
            <span className="font-heading text-xs font-bold text-white tracking-tight">
              Admin Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/jobs/new"
            className="flex h-8 items-center gap-1.5 rounded-xl bg-btn-gradient px-3 text-[11px] font-bold text-white shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">+ Lowongan</span>
          </Link>
        </div>
      </header>

      {/* 4. Mobile Bottom Navigation Bar (For quick 1-thumb switching on phones) */}
      <nav
        suppressHydrationWarning
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/[0.08] bg-[#080808]/95 px-2 backdrop-blur-xl pb-safe"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-amp-blue-light font-bold"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                  isActive ? "bg-amp-blue/20 shadow-sm shadow-blue-500/30" : ""
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[80px]">
                {item.label.replace("Kelola ", "").replace("Dashboard ", "")}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
