"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Sparkles } from "lucide-react";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  // References for glowing background orbs
  const orb1Ref = useRef<HTMLDivElement>(null); // Top Right Blue
  const orb2Ref = useRef<HTMLDivElement>(null); // Bottom Left Purple
  const orb3Ref = useRef<HTMLDivElement>(null); // Center Cyan Glow
  const orb4Ref = useRef<HTMLDivElement>(null); // Bottom Right Fuchsia Glow

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Stagger Timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });

      tl.from(badgeRef.current, { y: -20, opacity: 0, scale: 0.9 })
        .from(titleRef.current, { y: 30, opacity: 0 }, "-=0.5")
        .from(subtitleRef.current, { y: 20, opacity: 0 }, "-=0.6");

      // 2. Continuous Organic Orb Motion Loops
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          x: "+=45",
          y: "-=35",
          scale: 1.25,
          opacity: 0.35,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          x: "-=40",
          y: "+=45",
          scale: 1.3,
          opacity: 0.3,
          duration: 7,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orb3Ref.current) {
        gsap.to(orb3Ref.current, {
          x: "+=35",
          y: "+=25",
          scale: 0.85,
          opacity: 0.25,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      if (orb4Ref.current) {
        gsap.to(orb4Ref.current, {
          x: "-=30",
          y: "-=40",
          scale: 1.2,
          opacity: 0.25,
          duration: 9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      // 3. Interactive Mouse Parallax Effect on Glowing Orbs
      const handleMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        gsap.to(orb1Ref.current, {
          x: mouseX * 0.06,
          y: mouseY * 0.06,
          duration: 1.2,
          ease: "power2.out",
        });
        gsap.to(orb2Ref.current, {
          x: -mouseX * 0.05,
          y: -mouseY * 0.05,
          duration: 1.2,
          ease: "power2.out",
        });
        gsap.to(orb3Ref.current, {
          x: mouseX * 0.04,
          y: mouseY * 0.04,
          duration: 1.5,
          ease: "power2.out",
        });
        gsap.to(orb4Ref.current, {
          x: -mouseX * 0.04,
          y: -mouseY * 0.04,
          duration: 1.5,
          ease: "power2.out",
        });
      };

      const container = containerRef.current;
      if (container) {
        container.addEventListener("mousemove", handleMouseMove);
      }

      return () => {
        if (container) {
          container.removeEventListener("mousemove", handleMouseMove);
        }
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="bg-hero-glow bg-purple-glow relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-[#070707] px-5 py-7 sm:px-12 sm:py-14 shadow-2xl"
    >
      {/* Top Border Light Beam Sweep Animation */}
      <div className="absolute inset-x-0 top-0 h-[2px] overflow-hidden rounded-t-2xl sm:rounded-t-3xl pointer-events-none z-20">
        <div className="animate-border-beam h-full w-1/2 bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-80" />
      </div>

      {/* Background 48px grid pattern */}
      <div className="bg-grid-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black,transparent)] opacity-75 z-0" />

      {/* Dynamic Animated Background Glowing Orbs */}
      <div
        ref={orb1Ref}
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 sm:h-80 sm:w-80 rounded-full bg-gradient-to-br from-[#2266f1]/35 to-[#3b82f6]/10 blur-3xl"
      />
      <div
        ref={orb2Ref}
        className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-[#8350e8]/30 to-[#d946ef]/15 blur-3xl"
      />
      <div
        ref={orb3Ref}
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 h-52 w-52 sm:h-72 sm:w-72 rounded-full bg-cyan-500/15 blur-3xl"
      />
      <div
        ref={orb4Ref}
        className="pointer-events-none absolute -bottom-10 right-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-fuchsia-500/15 blur-3xl"
      />

      <div className="relative z-10 max-w-4xl">
        {/* Eyebrow Badge Pill */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-medium text-blue-300 shadow-lg shadow-blue-500/10 backdrop-blur-md transition hover:border-blue-500/50"
        >
          <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amp-blue-light animate-pulse" />
          <span className="font-heading uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold text-blue-200">
            Careers at AMP
          </span>
          <span className="h-2.5 w-[1px] bg-blue-500/30" />
          <span className="text-neutral-300 font-normal">Bespoke Creative Teams</span>
        </div>

        {/* Main Headline with Animated Gradient Text */}
        <h1
          ref={titleRef}
          className="mt-4 sm:mt-6 font-heading text-2xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight sm:leading-[1.12]"
        >
          Build your career with a{" "}
          <span className="animate-gradient-text block sm:inline font-black drop-shadow-md">
            creative team, powered by AI
          </span>
        </h1>

        {/* Subtitle / Description */}
        <p
          ref={subtitleRef}
          className="mt-3.5 sm:mt-6 max-w-2xl text-xs sm:text-base leading-relaxed text-neutral-300 sm:text-lg"
        >
          AMP merancang dan mengoperasikan tim kreatif berkinerja tinggi untuk brand global terkemuka.
          Bergabunglah dengan workflow AI-native dan kembangkan potensimu bersama kami.
        </p>
      </div>
    </section>
  );
}





