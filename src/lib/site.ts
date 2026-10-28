// Where clubs and families can reach PitchPath. Shown in the footer and the legal pages.
export const CONTACT_EMAIL = "pitchpathsoccer@gmail.com";

// Public base URL used for canonical links, sitemap and social cards. Set SITE_URL in production.
export function siteUrl() {
  const raw = process.env.SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
