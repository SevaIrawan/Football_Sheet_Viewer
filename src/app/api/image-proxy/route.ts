import { NextResponse } from "next/server";
import { isLogoImageProxyHostname } from "@/lib/logoImageProxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function refererForHost(hostname: string): string {
  if (hostname === "static.flashscore.com" || hostname === "www.flashscore.com") {
    return "https://www.flashscore.com/";
  }
  if (hostname === "media.api-sports.io") {
    return "https://www.api-football.com/";
  }
  if (hostname === "resources.premierleague.com") {
    return "https://www.premierleague.com/";
  }
  return "";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Parameter url wajib." }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "URL tidak valid." }, { status: 400 });
  }

  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "Hanya HTTPS." }, { status: 400 });
  }
  if (!isLogoImageProxyHostname(target.hostname)) {
    return NextResponse.json({ error: "Host tidak diizinkan." }, { status: 403 });
  }

  const referer = refererForHost(target.hostname);
  const upstream = await fetch(target.toString(), {
    headers: {
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ...(referer ? { Referer: referer } : {}),
    },
    next: { revalidate: 86_400 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Upstream HTTP ${upstream.status}` },
      { status: 502 },
    );
  }

  const buf = await upstream.arrayBuffer();
  const ctRaw =
    upstream.headers.get("content-type")?.split(";")[0]?.trim() ||
    "application/octet-stream";
  if (ctRaw.includes("text/html")) {
    return NextResponse.json({ error: "Upstream mengembalikan HTML." }, { status: 502 });
  }
  const ct = ctRaw.startsWith("image/") ? ctRaw : "image/png";

  return new NextResponse(buf, {
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
