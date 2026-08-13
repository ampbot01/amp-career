"use client";

import ReCAPTCHA from "react-google-recaptcha";

type Props = {
  onVerify: (token: string | null) => void;
};

export function RecaptchaWidget({ onVerify }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!siteKey) return null;

  return (
    <div suppressHydrationWarning className="flex justify-center my-4 overflow-hidden rounded-xl border border-white/10 p-2 bg-black/40">
      <ReCAPTCHA
        sitekey={siteKey}
        theme="dark"
        onChange={(token) => onVerify(token)}
        onExpired={() => onVerify(null)}
      />
    </div>
  );
}
