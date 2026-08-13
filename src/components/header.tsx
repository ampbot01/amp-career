import Link from "next/link";
import { Sparkles, Globe, ArrowUpRight } from "lucide-react";

export function Header() {
  return (
    <header suppressHydrationWarning className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#030303]/85 backdrop-blur-xl">
      <div suppressHydrationWarning className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo & Title */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex items-center transition-transform duration-300 group-hover:scale-105">
            <img
              src="https://res.cloudinary.com/dtjq8cgqh/image/upload/v1766389028/AMP_dark_4x_kf9k4p.webp"
              alt="AMPed Media Logo"
              className="h-8 sm:h-9 w-auto object-contain"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-heading text-base font-bold tracking-tight text-white group-hover:text-amp-blue-soft transition-colors">
                CAREERS
              </span>
              <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-300 sm:inline-flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-blue-400" /> AI Powered
              </span>
            </div>
            <span className="text-[10px] text-neutral-400 hidden sm:block">
              Bespoke Creative Teams
            </span>
          </div>
        </Link>

        {/* Right Section - Status Pill & Main Website Button */}
        <div className="flex items-center gap-3">
          {/* We are hiring status badge */}
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>We are hiring</span>
          </div>

          {/* Main Website External Link Button */}
          <a
            href="https://ampedmedia.id"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-neutral-200 transition-all duration-300 hover:border-amp-blue/50 hover:bg-white/[0.08] hover:text-white hover:shadow-lg hover:shadow-blue-500/10"
          >
            <Globe className="h-3.5 w-3.5 text-amp-blue-light transition-transform duration-200 group-hover:rotate-12" />
            <span>Main Website</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </a>
        </div>
      </div>
    </header>
  );
}




