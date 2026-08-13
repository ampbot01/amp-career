import Link from "next/link";
import { MapPin, Clock, ArrowRight, Sparkles, Users } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  fulltime: "Full-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
};

type JobCardProps = {
  slug: string;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  applicantCount?: number;
};

export function JobCard({ slug, title, category, location, type, description, applicantCount }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${slug}`}
      suppressHydrationWarning
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-amp-blue/40 hover:bg-[#0c0c0c] hover:shadow-2xl hover:shadow-amp-blue/10"
    >
      {/* Top subtle blue gradient accent line on hover */}
      <div suppressHydrationWarning className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-amp-blue/0 to-transparent transition-all duration-300 group-hover:via-amp-blue-light" />

      <div>
        {/* Badges Row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 shadow-sm">
            <Sparkles className="h-3 w-3 text-amp-blue-light" />
            {category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            Aktif
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-amp-blue-soft">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
          {description}
        </p>

        {/* Meta Chips Row */}
        <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-neutral-300">
            <MapPin className="h-3.5 w-3.5 text-amp-blue-light" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-neutral-300">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>{TYPE_LABEL[type] ?? type}</span>
          </div>
          {typeof applicantCount === "number" && (
            <div className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 text-purple-300 font-semibold">
              <Users className="h-3.5 w-3.5 text-purple-400" />
              <span>{applicantCount} Pelamar</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-6 flex items-center justify-end border-t border-white/[0.08] pt-4">
        <span className="bg-btn-gradient inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all duration-300 group-hover:brightness-110 group-hover:shadow-lg group-hover:shadow-blue-500/30">
          <span>Detail & Lamar</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}



