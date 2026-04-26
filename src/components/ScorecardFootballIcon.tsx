"use client";

import { useEffect, useState } from "react";

/** Letakkan file PNG di repo ini untuk mengganti ikon bawaan (transparan, ±48px disarankan). */
const BALL_PNG = "/icons/bola.png";

function ScorecardFootballSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      shapeRendering="geometricPrecision"
    >
      <circle cx="16" cy="16" r="14" fill="#f1f5f9" />
      <circle cx="16" cy="16" r="5.25" fill="#0f172a" />
      <path
        fill="none"
        stroke="#334155"
        strokeWidth="2.35"
        strokeLinecap="round"
        d="M16 3.5v25M3.5 16h25"
      />
      <path
        fill="none"
        stroke="#475569"
        strokeWidth="2.1"
        strokeLinecap="round"
        d="M5 9.5Q16 17 27 9.5M5 22.5Q16 15 27 22.5"
      />
    </svg>
  );
}

/**
 * Ikon bola di kartu pencetak gol.
 * Jika `public/icons/bola.png` ada → dipakai; jika tidak → SVG bawaan (tanpa 404 di UI).
 */
export function ScorecardFootballIcon({
  className = "h-6 w-6 shrink-0",
}: {
  className?: string;
}) {
  const [pngOk, setPngOk] = useState<boolean | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setPngOk(true);
    img.onerror = () => setPngOk(false);
    img.src = BALL_PNG;
  }, []);

  if (pngOk === true) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={BALL_PNG}
        alt=""
        className={`object-contain ${className}`}
        width={32}
        height={32}
        decoding="async"
      />
    );
  }

  return <ScorecardFootballSvg className={className} />;
}
