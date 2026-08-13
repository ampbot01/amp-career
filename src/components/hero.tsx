export function Hero() {
  return (
    <section className="bg-hero-glow relative overflow-hidden rounded-2xl border border-white/[0.08] px-6 py-14 sm:px-12 sm:py-20">
      <div className="bg-grid-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="relative">
        <p className="mb-3 text-sm font-medium tracking-wide text-amp-blue-light">
          Careers at AMP
        </p>
        <h1 className="max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
          Berkarya bersama tim kreatif{" "}
          <span className="text-amp-blue-light">powered by AI</span>
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          AMP merakit bespoke creative teams untuk brand-brand terbaik. Temukan
          posisi yang cocok dengan keahlianmu dan lamar dalam hitungan menit.
        </p>
      </div>
    </section>
  );
}
