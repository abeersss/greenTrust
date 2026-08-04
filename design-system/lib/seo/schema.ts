import { siteUrl, siteName, sameAsLinks } from "./site";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * JSON-LD builders. Every field here is either a structural fact
 * (URLs derived from routes, dates) or drawn directly from verified
 * project information (Dr. Abeer's real credentials and
 * memberships). None of these builders accept or fabricate customer
 * counts, review ratings, or testimonial content; AggregateRating and
 * Review types are deliberately not implemented here for that reason.
 */

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    sameAs: sameAsLinks,
    founder: {
      "@type": "Person",
      name: "Dr. Abeer Alshammari",
    },
  };
}

export function personSchema(locale: AppLocale) {
  const url = `${siteUrl}/${locale}/about`;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Dr. Abeer Alshammari",
    url,
    honorificPrefix: "Dr.",
    jobTitle: "Cybersecurity Governance, Risk, and Compliance Practitioner",
    knowsAbout: [
      "Cybersecurity governance",
      "Governance, risk, and compliance (GRC)",
      "AI governance",
      "AI security",
      "AI risk management",
      "Digital trust",
      "Information security governance",
      "Data governance",
      "Zero trust architecture",
      "Cloud security governance",
      "Identity and access management",
      "Post-quantum cryptography",
      "Cyber resilience",
      "Regulatory compliance",
      "ISO/IEC 27001",
      "ISO/IEC 42001",
      "NIST Cybersecurity Framework",
      "Third-party risk management",
      "Cybersecurity strategy",
      "Responsible AI"
    ],
    hasCredential: [
      "Doctorate in Cybersecurity and Information Assurance",
      "CISM, Certified Information Security Manager",
      "CISSP, Certified Information Systems Security Professional",
      "ISO/IEC 27001:2022 Lead Auditor",
      "GRCP and GRCA, Governance, Risk and Compliance Professional and Auditor",
    ].map((name) => ({ "@type": "EducationalOccupationalCredential", name })),
    memberOf: [
      { "@type": "Organization", name: "ISACA", url: "https://www.isaca.org" },
      { "@type": "Organization", name: "ISC2", url: "https://www.isc2.org" },
      { "@type": "Organization", name: "IEEE", url: "https://www.ieee.org" },
      { "@type": "Organization", name: "Women in Cybersecurity (WiCyS)", url: "https://www.wicys.org" },
      {
        "@type": "Organization",
        name: "International Leadership Association (ILA)",
        url: "https://www.ila-net.org",
      },
      { "@type": "Organization", name: "Australian Computer Society (ACS)", url: "https://www.acs.org.au" },
      { "@type": "Organization", name: "Gartner", url: "https://www.gartner.com" },
      { "@type": "Organization", name: "Info-Tech Research Group", url: "https://www.infotech.com" },
    ],
  };
}

export function websiteSchema(locale: AppLocale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale,
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string; // path after locale, no leading slash, "" for home
}

export function breadcrumbSchema(locale: AppLocale, items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path ? `/${item.path}` : ""}`,
    })),
  };
}

export interface ArticleSchemaInput {
  locale: AppLocale;
  slug: string;
  title: string;
  description: string | null;
  datePublished: string | null;
  /** articles.updated_at -- omitted when equal to/unset relative to datePublished so we never claim a revision that didn't happen. */
  dateModified?: string | null;
  authorName: string | null;
  imageUrl: string | null;
  /** "insights" (default) or "intelligence" -- must match the actual route the article lives at, since this URL is what search engines index. */
  basePath?: "insights" | "intelligence";
  /** Cyber Intelligence items use NewsArticle (Section 27); regular evergreen content stays Article. */
  schemaType?: "Article" | "NewsArticle";
}

export interface LearningResourceSchemaInput {
  locale: AppLocale;
  path: string;
  name: string;
  description: string;
  isFree: boolean;
}

/**
 * Used for the First Defender challenge (Milestone 2). LearningResource
 * is a real schema.org type (not invented for this project) with
 * `teaches`/`isAccessibleForFree` properties that fit an interactive,
 * free, educational scenario better than Quiz, which schema.org does
 * not formally define as a top-level type.
 */
export function learningResourceSchema(input: LearningResourceSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: input.name,
    description: input.description,
    url: `${siteUrl}/${input.locale}/${input.path}`,
    inLanguage: input.locale,
    isAccessibleForFree: input.isFree,
    learningResourceType: "Interactive scenario",
    provider: { "@type": "Organization", name: siteName },
  };
}

export function articleSchema(input: ArticleSchemaInput) {
  const basePath = input.basePath ?? "insights";
  return {
    "@context": "https://schema.org",
    "@type": input.schemaType ?? "Article",
    headline: input.title,
    description: input.description ?? undefined,
    datePublished: input.datePublished ?? undefined,
    dateModified:
      input.dateModified && input.dateModified !== input.datePublished ? input.dateModified : undefined,
    inLanguage: input.locale,
    url: `${siteUrl}/${input.locale}/${basePath}/${input.slug}`,
    image: input.imageUrl ?? undefined,
    author: input.authorName ? { "@type": "Person", name: input.authorName } : undefined,
    publisher: { "@type": "Organization", name: siteName },
  };
}
