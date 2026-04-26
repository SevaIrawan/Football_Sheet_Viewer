"use client";

import { useCallback, useState } from "react";
import { proxiedLogoImageSrc } from "@/lib/logoImageProxy";
import { isLikelyDirectImageUrl } from "@/lib/logoImageUrl";

const EXT = ["png", "webp", "svg"] as const;

type Props = {
  kind: "teams" | "leagues";
  logoKey?: string;
  logoUrl?: string;
  label: string;
  className?: string;
};

export function LogoImg({
  kind,
  logoKey = "",
  logoUrl = "",
  label,
  className = "",
}: Props) {
  const base = `/logos/${kind}/${logoKey || "_"}`;
  const [i, setI] = useState(0);
  const [useRemote, setUseRemote] = useState(true);
  const cleanUrl = logoUrl.trim();
  /** URL remote hanya jika bentuknya jelas link gambar; selain itu langsung `logoKey` lokal. */
  const hasRemote =
    useRemote && cleanUrl.length > 0 && isLikelyDirectImageUrl(cleanUrl);
  const src = hasRemote
    ? proxiedLogoImageSrc(cleanUrl)
    : logoKey && i < EXT.length
      ? `${base}.${EXT[i]}`
      : "";

  const onError = useCallback(() => {
    // Jika URL remote gagal, fallback ke mode key lokal.
    if (hasRemote) {
      setUseRemote(false);
      setI(0);
      return;
    }
    setI((x) => x + 1);
  }, [hasRemote]);

  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  if ((!hasRemote && !logoKey) || (!hasRemote && i >= EXT.length)) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-white/80 ${className}`}
        aria-hidden
      >
        {initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={onError}
    />
  );
}
