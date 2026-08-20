"use client";

import { useState, useTransition } from "react";
import { runAiAtsAnalysis, AiAnalysisData } from "@/lib/ai-ats";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  RefreshCw,
  Award,
  TrendingUp,
  Brain,
} from "lucide-react";

type Props = {
  applicationId: string;
  fullName: string;
  jobTitle: string;
  aiScore: number | null;
  aiSummary: string | null;
  aiAnalysisJson: string | null;
};

export function AdminAiModal({
  applicationId,
  fullName,
  jobTitle,
  aiScore,
  aiSummary,
  aiAnalysisJson,
}: Props) {
  const [open, setOpen] = useState(false);
  const [liveAnalysis, setLiveAnalysis] = useState<AiAnalysisData | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  let parsedAnalysis: AiAnalysisData | null = null;
  if (aiAnalysisJson) {
    try {
      parsedAnalysis = JSON.parse(aiAnalysisJson);
    } catch (e) {
      parsedAnalysis = null;
    }
  }

  const activeAnalysis = liveAnalysis ?? parsedAnalysis;

  const score = activeAnalysis?.score ?? aiScore ?? 0;
  const badgeText = activeAnalysis?.badge ?? (score >= 85 ? "Sangat Layak" : score >= 70 ? "Layak" : score >= 50 ? "Dipertimbangkan" : "Belum Sesuai");

  const getScoreColor = (val: number) => {
    if (val >= 85) return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" };
    if (val >= 70) return { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", bar: "bg-blue-500" };
    if (val >= 50) return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500" };
    return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", bar: "bg-red-500" };
  };

  const colorStyle = getScoreColor(score);

  const handleRunAnalysis = () => {
    setSuccessMsg(null);
    startTransition(async () => {
      const result = await runAiAtsAnalysis(applicationId);
      if (result) {
        setLiveAnalysis(result);
        setSuccessMsg(`Diperbarui pkl ${result.updatedAt ?? new Date().toLocaleTimeString()}`);
      }
    });
  };

  return (
    <>
      {/* Clickable AI Score Pill Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:scale-105 active:scale-95 ${colorStyle.border} ${colorStyle.bg} ${colorStyle.text}`}
        title="Klik untuk melihat detail analisis ATS AI"
      >
        <Sparkles className="h-3 w-3 shrink-0 animate-pulse" />
        <span>{score > 0 ? `${score}% ${badgeText}` : "Analisis AI"}</span>
      </button>

      {/* AI Analysis Dialog Modal */}
      {open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl border border-white/15 bg-[#0e0e0e] p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="flex h-9 sm:h-10 w-9 sm:w-10 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                  <Brain className="h-4 sm:h-5 w-4 sm:w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                    Hasil Analisis ATS AI
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400">
                    Evaluasi berkas <span className="text-neutral-200 font-semibold">{fullName}</span> untuk posisi <span className="text-neutral-200 font-semibold">{jobTitle}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Score Banner Gauge */}
            <div className={`rounded-2xl border p-4 sm:p-5 space-y-2.5 sm:space-y-3 ${colorStyle.border} ${colorStyle.bg}`}>
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <Award className={`h-4 sm:h-5 w-4 sm:w-5 ${colorStyle.text}`} />
                  <span className="font-heading text-xs sm:text-sm font-bold text-white">Skor Kesesuaian ATS</span>
                </div>
                <span className={`font-heading text-xl sm:text-2xl font-extrabold ${colorStyle.text}`}>
                  {score}% — {badgeText}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 sm:h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${colorStyle.bar}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                {activeAnalysis?.summary ?? aiSummary ?? "Belum ada rangkuman analisis."}
              </p>
            </div>

            {/* Strengths List */}
            {activeAnalysis?.strengths && activeAnalysis.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Kelebihan Utama Kandidat</span>
                </h4>
                <div className="space-y-1.5">
                  {activeAnalysis.strengths.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs text-emerald-200"
                    >
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gaps List */}
            {activeAnalysis?.gaps && activeAnalysis.gaps.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Area Perhatian & Skill Gaps</span>
                </h4>
                <div className="space-y-1.5">
                  {activeAnalysis.gaps.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-950/20 p-2.5 text-xs text-amber-200"
                    >
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Box */}
            {activeAnalysis?.recommendation && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-3.5 sm:p-4 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span>Rekomendasi Rekrutmen</span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed">
                  {activeAnalysis.recommendation}
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center justify-between gap-2 border-t border-white/[0.08] pt-3 sm:pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/[0.08] hover:text-white transition text-center"
              >
                Tutup
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleRunAnalysis}
                  className="w-full xs:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 active:scale-95 transition disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                      <span>Menganalisis AI...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 text-purple-400" />
                      <span>Jalankan Ulang AI</span>
                    </>
                  )}
                </button>
                {successMsg && (
                  <span className="text-[10px] font-semibold text-emerald-400 animate-in fade-in shrink-0">
                    ✓ {successMsg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
