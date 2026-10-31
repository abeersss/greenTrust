/**
 * Verified press coverage for the public Media & Press page.
 *
 * Rules for adding an entry:
 * - Open the original article and copy the headline exactly as published.
 * - Use the publication date shown on the article itself.
 * - Write an original short summary; never paste article paragraphs.
 * - Do not copy newspaper photos or screenshots without a licence.
 * - Coverage is reporting, not endorsement; never imply otherwise.
 */
export type PressItem = {
  id: string;
  publication: string;
  /** Exact headline as published, in the article's own language. */
  headline: string;
  headlineLang: "en" | "ar";
  /** ISO date (YYYY-MM-DD) as shown on the article. */
  date: string;
  author?: string;
  url: string;
  summary: { en: string; ar: string };
};

export const pressItems: PressItem[] = [
  {
    id: "kuwait-times-2026-10-25",
    publication: "Kuwait Times",
    headline: "Expert launches CyberAbeer initiative to bring cybersecurity within reach",
    headlineLang: "en",
    date: "2026-10-25",
    author: "Faten Omar",
    url: "https://kuwaittimes.com/article/52369/kuwait/expert-launches-cyberabeer-initiative-to-bring-cybersecurity-within-reach/",
    summary: {
      en: "An interview on the launch of the CyberAbeer Initiative and its goal of making cybersecurity and governance more accessible to individuals and organizations. The conversation covers responsible AI use at work, the organizational gaps Dr. Abeer encounters most often, and next steps for the AEGIS governance platform.",
      ar: "مقابلة حول إطلاق مبادرة CyberAbeer وهدفها في تقريب الأمن السيبراني والحوكمة من الأفراد والمؤسسات. تتناول المقابلة الاستخدام المسؤول للذكاء الاصطناعي في بيئة العمل، وأبرز الثغرات التنظيمية التي تصادفها د. عبير، والخطوات القادمة لمنصة AEGIS للحوكمة.",
    },
  },
];

/**
 * Approved gallery photos. Add only photos you own or are licensed to
 * publish, with verified captions and dates. Do not include identifiable
 * participants without consent or any confidential workplace material.
 * Files live in /public/media/gallery/.
 */
export type GalleryItem = {
  id: string;
  src: string;
  alt: { en: string; ar: string };
  caption: { en: string; ar: string };
  /** ISO date, only when verified. */
  date?: string;
};

export const galleryItems: GalleryItem[] = [];
