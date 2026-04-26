/** Hostname yang boleh di-proxy lewat `/api/image-proxy` (hindari SSRF). */
export const LOGO_IMAGE_PROXY_HOSTNAMES: readonly string[] = [
  "static.flashscore.com",
  "www.flashscore.com",
  "media.api-sports.io",
  "resources.premierleague.com",
];

export function isLogoImageProxyHostname(hostname: string): boolean {
  return LOGO_IMAGE_PROXY_HOSTNAMES.includes(hostname);
}

export function proxiedLogoImageSrc(rawUrl: string): string {
  const url = rawUrl.trim();
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return url;
    if (!isLogoImageProxyHostname(u.hostname)) return url;
    return `/api/image-proxy?url=${encodeURIComponent(u.toString())}`;
  } catch {
    return url;
  }
}
