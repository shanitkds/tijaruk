const MEDIA_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
).replace(/\/api\/?$/, "");

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${MEDIA_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
