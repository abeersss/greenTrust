/**
 * Site-wide constants used by metadata, JSON-LD, and the sitemap. No
 * social media links are listed here: none have been supplied for
 * this project, and inventing them would produce broken or
 * misleading `sameAs` links in the Organization schema. Add real
 * profile URLs here once they exist.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cyberabeer.com").replace(/\/$/, "");

export const siteName = "CyberAbeer";

/** Real social/profile URLs go here once they exist. Empty by design. */
export const sameAsLinks: string[] = [];
