import Link from "next/link";

export const metadata = { title: "Lamaran Terkirim — AMP Careers" };

export default function ApplySuccessPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="glass w-full max-w-md rounded-2xl p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl text-teal-400">
          ✓
        </div>
        <h1 className="text-2xl font-semibold">Lamaran terkirim!</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Terima kasih sudah melamar ke AMP. Tim kami akan meninjau lamaranmu
          dan menghubungi lewat email atau WhatsApp jika profilmu cocok.
        </p>
        <Link
          href="/"
          className="bg-btn-gradient mt-8 inline-block rounded-md px-6 py-2.5 text-sm font-medium text-white transition hover:brightness-110"
        >
          Lihat Lowongan Lain
        </Link>
      </div>
    </main>
  );
}
