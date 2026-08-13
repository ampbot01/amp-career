import Link from "next/link";

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
};

export function JobCard({ slug, title, category, location, type, description }: JobCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-card p-5 transition hover:border-white/20">
      <div>
        <div className="mb-3 flex items-start justify-between gap-2">
          <span className="rounded-full bg-amp-blue/10 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            {category}
          </span>
          <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-400">
            Open
          </span>
        </div>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{location}</span>
          <span aria-hidden>·</span>
          <span>{TYPE_LABEL[type] ?? type}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-end border-t border-white/[0.08] pt-4">
        <Link
          href={`/jobs/${slug}`}
          className="bg-btn-gradient rounded-md px-4 py-2 text-sm font-medium text-white transition hover:brightness-110"
        >
          Lihat & Lamar
        </Link>
      </div>
    </div>
  );
}
