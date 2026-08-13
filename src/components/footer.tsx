import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer suppressHydrationWarning className="mt-20 border-t border-white/[0.08] bg-[#050505] py-12 text-sm text-neutral-400">
      <div suppressHydrationWarning className="mx-auto max-w-7xl px-4 sm:px-8">
        <div suppressHydrationWarning className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand Info */}
          <div suppressHydrationWarning className="space-y-2 max-w-md">
            <div suppressHydrationWarning className="flex items-center gap-2 mb-2">
              <img
                src="https://res.cloudinary.com/dtjq8cgqh/image/upload/v1766389028/AMP_dark_4x_kf9k4p.webp"
                alt="AMPed Media Logo"
                className="h-8 w-auto object-contain"
              />
              <span className="font-heading text-base font-bold text-white tracking-tight">
                CAREERS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400">
              Bespoke Creative Teams, Powered by AI. Kami membangun tim kreatif modern dan berkinerja tinggi untuk brand terkemuka dunia.
            </p>
          </div>

          {/* Kultur Kami Badge */}
          <div suppressHydrationWarning className="max-w-xs rounded-xl border border-white/10 bg-card p-4">
            <div suppressHydrationWarning className="flex items-center gap-2 text-xs font-medium text-blue-300">
              <Sparkles className="h-3.5 w-3.5 text-amp-blue-light" />
              <span>AI-Native Culture</span>
            </div>
            <p className="mt-1.5 text-[11px] leading-normal text-neutral-400">
              Setiap posisi di AMP didukung oleh tools AI tercanggih untuk melipatgandakan produktivitas dan kreativitas.
            </p>
          </div>
        </div>

        <div suppressHydrationWarning className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-neutral-400 sm:flex-row">
          <p suppressHydrationWarning>© {new Date().getFullYear()} AMP (Amped Media). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for high performance creative talent
          </p>
        </div>
      </div>
    </footer>
  );
}


