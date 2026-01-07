export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && typeof envUrl === 'string') {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  if (typeof window !== 'undefined') return window.location.origin;

  return '';
}
