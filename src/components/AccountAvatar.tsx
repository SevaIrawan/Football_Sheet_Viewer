"use client";

import { UserRound } from "lucide-react";
import { useCallback, useState } from "react";

/**
 * Logo akun header. Letakkan file di:
 * `public/logos/account/avatar.png` (atau `avatar.webp` / `avatar.svg`)
 */
const BASE = "/logos/account/avatar";
const EXT = ["png", "webp", "svg"] as const;

/** Dipakai bersama logo liga header — diameter harus sama. */
export const HEADER_LOGO_MATCH_SIZE =
  "h-14 w-14 shrink-0 sm:h-16 sm:w-16";

type Props = {
  className?: string;
};

export function AccountAvatar({ className = HEADER_LOGO_MATCH_SIZE }: Props) {
  const [i, setI] = useState(0);

  const src = i < EXT.length ? `${BASE}.${EXT[i]}` : "";

  const onError = useCallback(() => {
    setI((x) => x + 1);
  }, []);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-white/25 bg-white/[0.07] shadow-inner shadow-black/20 ${className}`}
      aria-label="Logo akun"
      role="img"
    >
      {i >= EXT.length ? (
        <UserRound
          className="h-6 w-6 text-white/50 sm:h-7 sm:w-7"
          strokeWidth={1.75}
          aria-hidden
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={onError}
        />
      )}
    </div>
  );
}
