"use client";

import { useCallback, useState } from "react";

const EXT = ["png", "webp", "svg"] as const;

type Props = {
  kind: "teams" | "leagues";
  logoKey: string;
  label: string;
  className?: string;
};

export function LogoImg({ kind, logoKey, label, className = "" }: Props) {
  const base = `/logos/${kind}/${logoKey || "_"}`;
  const [i, setI] = useState(0);

  const src =
    logoKey && i < EXT.length ? `${base}.${EXT[i]}` : "";

  const onError = useCallback(() => {
    setI((x) => x + 1);
  }, []);

  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  if (!logoKey || i >= EXT.length) {
    return (
      <div
        className={`flex items-center justify-center bg-white/10 text-sm font-bold text-white/80 ${className}`}
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
      onError={onError}
    />
  );
}
