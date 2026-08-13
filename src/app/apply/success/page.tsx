import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckCircle2, ArrowRight, Clock, FileCheck, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata = { title: "Lamaran Terkirim — AMP Careers" };

export default function ApplySuccessPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#030303]">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0a] p-8 sm:p-12 text-center shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Glowing Checkmark Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Lamaran Berhasil Terkirim!
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
            Terima kasih telah melamar di AMP. Tim Talent Acquisition kami telah menerima profil dan file CV kamu.
          </p>

          {/* Timeline Process Steps */}
          <div className="mt-8 border-t border-b border-white/[0.08] py-6 text-left space-y-4">
            <p className="text-xs font-bold text-white font-heading">Tahapan Selanjutnya:</p>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                1
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Review Dokumen & CV</p>
                <p className="text-[11px] text-neutral-400">Tim HR meninjau kelayakan profil & portfolio (1-2 hari kerja).</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-neutral-400 text-xs font-bold">
                2
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Kontak & Undangan Wawancara</p>
                <p className="text-[11px] text-neutral-400">Kandidat terpilih akan dihubungi melalui Email / WhatsApp.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="bg-btn-gradient flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:brightness-110"
            >
              <span>Lihat Lowongan Lainnya</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

