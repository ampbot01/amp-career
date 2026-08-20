"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { updateApplicationStatus, getResumeUrl } from "@/lib/admin-actions";
import {
  MoreVertical,
  UserCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  RotateCcw,
  Send,
  MessageCircle,
  ExternalLink,
  X,
  PhoneCall,
  Sparkles,
} from "lucide-react";

type Props = {
  applicationId: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  currentStatus: string;
};

function formatWhatsappPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return cleaned;
}

export function AdminWaActions({
  applicationId,
  fullName,
  phone,
  jobTitle,
  currentStatus,
}: Props) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [modalTarget, setModalTarget] = useState<{
    nextStatus: string;
    msgText: string;
    actionTitle: string;
    statusLabel: string;
  } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const formattedPhone = formatWhatsappPhone(phone);

  const updateCoords = () => {
    if (buttonRef.current && window.innerWidth >= 768) {
      const rect = buttonRef.current.getBoundingClientRect();
      const popupHeight = 280;
      const popupWidth = 224; // w-56

      const spaceBelow = window.innerHeight - rect.bottom;
      let top = rect.bottom + 6;
      if (spaceBelow < popupHeight && rect.top > popupHeight) {
        top = rect.top - popupHeight - 6;
      }

      let left = rect.right - popupWidth;
      if (left < 10) left = 10;

      setCoords({ top, left });
    }
  };

  const toggleOpen = () => {
    if (!open) {
      updateCoords();
    }
    setOpen((prev) => !prev);
  };

  // Recalculate or close on scroll/resize/click outside
  useEffect(() => {
    if (!open) return;

    function handleScrollOrResize() {
      if (window.innerWidth >= 768) {
        updateCoords();
      }
    }

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // 1. Template WA: Undang Interview
  const interviewMsg = encodeURIComponent(
    `Halo ${fullName}, terima kasih telah melamar posisi *${jobTitle}* di AMP (Amped Media).\n\nSetelah meninjau profil & portfolio Anda, kami ingin mengundang Anda untuk sesi *Wawancara (Interview)* secara online via Google Meet.\n\nApakah Anda memiliki waktu luang dalam 1-2 hari ini? Mohon konfirmasinya. Terima kasih!`
  );

  // 2. Template WA: Kirim Offering
  const offeringMsg = encodeURIComponent(
    `Halo ${fullName}, selamat! Berdasarkan hasil wawancara untuk posisi *${jobTitle}* di AMP (Amped Media), tim kami sangat tertarik untuk bekerjasama dengan Anda.\n\nKami ingin mengirimkan dokumen *Offering Letter (Penawaran Kerja)*. Mohon konfirmasi bahwa alamat email ini masih aktif. Terima kasih!`
  );

  // 3. Template WA: Resmi Diterima (Hired)
  const acceptMsg = encodeURIComponent(
    `Halo ${fullName}, selamat bergabung di keluarga besar AMP (Amped Media)!\n\nPenawaran kerja Anda untuk posisi *${jobTitle}* telah resmi disetujui. Tim kami akan segera mengirimkan dokumen onboarding dan instruksi persiapan hari pertama Anda. Welcome aboard!`
  );

  // 4. Template WA: Penolakan
  const rejectMsg = encodeURIComponent(
    `Halo ${fullName}, terima kasih banyak telah melamar posisi *${jobTitle}* di AMP (Amped Media).\n\nSetelah meninjau profil & kualifikasi Anda, saat ini kami memilih kandidat lain yang lebih sesuai dengan kebutuhan spesifik tim kami untuk posisi ini.\n\nKualifikasi Anda tetap kami simpan dalam talent pool kami untuk lowongan di masa mendatang. Semoga sukses selalu!`
  );

  const requestConfirmation = (nextStatus: string, msgText: string, actionTitle: string, statusLabel: string) => {
    setOpen(false);
    setModalTarget({ nextStatus, msgText, actionTitle, statusLabel });
  };

  const handleConfirmAndProceed = () => {
    if (!modalTarget) return;

    const { nextStatus, msgText } = modalTarget;
    const waUrl = `https://wa.me/${formattedPhone}?text=${msgText}`;

    setModalTarget(null);

    startTransition(async () => {
      await updateApplicationStatus(applicationId, nextStatus);
      window.open(waUrl, "_blank", "noopener,noreferrer");
    });
  };

  const handleViewResume = () => {
    setOpen(false);
    startTransition(async () => {
      try {
        const url = await getResumeUrl(applicationId);
        if (url) {
          window.open(url, "_blank", "noopener,noreferrer");
        }
      } catch (err) {
        alert("Berkas CV tidak ditemukan atau terhapus di Supabase Storage.");
      }
    });
  };

  const actionMenuItems = (
    <>
      <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400 border-b border-white/[0.08] mb-1.5 flex items-center justify-between">
        <span>Tindakan Rekrutmen</span>
        <span className="text-[10px] text-neutral-500 font-normal">{fullName}</span>
      </div>

      {/* Lihat CV */}
      <button
        type="button"
        onClick={handleViewResume}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-200 hover:bg-white/10 active:bg-white/15 transition text-left"
      >
        <FileText className="h-4 w-4 text-purple-400 shrink-0" />
        <span>Buka Berkas CV / Resume</span>
      </button>

      <div className="my-1.5 border-t border-white/[0.06]" />

      {/* 1. Undang Interview */}
      <button
        type="button"
        onClick={() => requestConfirmation("interview", interviewMsg, "Undang Interview via WA", "Tahap Interview")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 active:bg-blue-500/20 transition text-left"
      >
        <UserCheck className="h-4 w-4 shrink-0 text-blue-400" />
        <span>Panggil Interview (WhatsApp)</span>
      </button>

      {/* 2. Kirim Offering */}
      <button
        type="button"
        onClick={() => requestConfirmation("offering", offeringMsg, "Kirim Offering Letter via WA", "Tahap Offering")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-purple-400 hover:bg-purple-500/10 active:bg-purple-500/20 transition text-left"
      >
        <FileCheck className="h-4 w-4 shrink-0 text-purple-400" />
        <span>Kirim Offering (WhatsApp)</span>
      </button>

      {/* 3. Resmi Diterima */}
      <button
        type="button"
        onClick={() => requestConfirmation("accepted", acceptMsg, "Konfirmasi Penerimaan Kerja via WA", "Resmi Diterima")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition text-left"
      >
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        <span>Resmi Diterima / Hired (WhatsApp)</span>
      </button>

      <div className="my-1.5 border-t border-white/[0.06]" />

      {/* 4. Tolak WA */}
      <button
        type="button"
        onClick={() => requestConfirmation("rejected", rejectMsg, "Tolak Lamaran Kandidat via WA", "Ditolak")}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 active:bg-red-500/20 transition text-left"
      >
        <XCircle className="h-4 w-4 shrink-0 text-red-400" />
        <span>Tolak Kandidat (WhatsApp)</span>
      </button>

      {/* 5. Follow Up WA (If Accepted) */}
      {currentStatus === "accepted" && (
        <button
          type="button"
          onClick={() => requestConfirmation("accepted", acceptMsg, "Follow Up Pesan WhatsApp", "Resmi Diterima")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10 active:bg-emerald-500/20 transition text-left"
        >
          <Send className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>Follow Up WhatsApp</span>
        </button>
      )}

      {/* 6. Buka Kembali (If Rejected) */}
      {currentStatus === "rejected" && (
        <button
          type="button"
          onClick={() => requestConfirmation("interview", interviewMsg, "Buka Kembali Status Pelamar", "Tahap Interview")}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-neutral-400 hover:bg-white/10 active:bg-white/15 transition text-left"
        >
          <RotateCcw className="h-4 w-4 shrink-0 text-neutral-400" />
          <span>Buka Kembali Status</span>
        </button>
      )}
    </>
  );

  return (
    <>
      <div suppressHydrationWarning className="relative inline-block text-left">
        {/* Trigger Button (Desktop: Small Icon Button, Mobile: Can also be used as full touch button) */}
        <button
          ref={buttonRef}
          type="button"
          disabled={isPending}
          onClick={toggleOpen}
          className="inline-flex h-9 px-3 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs font-semibold text-neutral-200 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white focus:outline-none disabled:opacity-50 active:scale-95"
          title="Opsi Tindakan Rekrutmen"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amp-blue-light" />
          ) : (
            <>
              <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>Aksi</span>
              <MoreVertical className="h-3.5 w-3.5 text-neutral-400" />
            </>
          )}
        </button>

        {/* 1. Desktop Popover Dropdown (>= 768px) */}
        {open && coords && (
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="hidden md:block w-64 rounded-2xl border border-white/15 bg-[#0d0d0d] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/10 focus:outline-none animate-in fade-in zoom-in-95"
          >
            {actionMenuItems}
          </div>
        )}

        {/* 2. Mobile Bottom Sheet Drawer (< 768px) */}
        {open && (
          <div className="fixed inset-0 z-[100000] flex items-end justify-center bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in">
            {/* Backdrop */}
            <div className="fixed inset-0" onClick={() => setOpen(false)} />

            {/* Bottom Sheet Drawer */}
            <div className="relative z-10 w-full max-w-lg rounded-t-3xl border-t border-white/15 bg-[#0e0e0e] p-4 shadow-2xl space-y-2 animate-in slide-in-from-bottom pb-8 max-h-[85vh] overflow-y-auto">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20" />
              {actionMenuItems}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] py-3 text-xs font-semibold text-neutral-300 active:bg-white/[0.08]"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal (Works seamlessly on desktop & mobile) */}
      {modalTarget && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#0e0e0e] p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-3 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-white">
                    {modalTarget.actionTitle}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400">
                    Konfirmasi pesan WhatsApp & pembaharuan status
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalTarget(null)}
                className="rounded-xl p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Info Box */}
            <div className="space-y-3 text-xs text-neutral-300">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 space-y-1.5">
                <div className="font-bold text-white text-sm">{fullName}</div>
                <div className="text-neutral-400 text-xs">Posisi: <span className="text-neutral-200 font-medium">{jobTitle}</span></div>
                <div className="text-neutral-400 text-xs">Status Baru: <span className="text-emerald-400 font-bold">{modalTarget.statusLabel}</span></div>
                <div className="text-neutral-400 text-xs">WhatsApp: <span className="text-blue-300 font-mono">+{formattedPhone}</span></div>
              </div>

              <div>
                <span className="block font-semibold text-neutral-300 mb-1.5 text-xs">Draf Pesan WhatsApp:</span>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-[11px] sm:text-xs leading-relaxed text-emerald-200 max-h-32 sm:max-h-36 overflow-y-auto whitespace-pre-wrap font-sans">
                  {decodeURIComponent(modalTarget.msgText)}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 border-t border-white/[0.08] pt-3 sm:pt-4">
              <button
                type="button"
                onClick={() => setModalTarget(null)}
                className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-white/[0.08] hover:text-white transition"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmAndProceed}
                className="w-full sm:w-auto bg-btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:brightness-110 transition active:scale-95"
              >
                <span>Lanjutkan ke WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
