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
  /** "coverage" = reporting about Dr. Abeer; "column" = an article she wrote for the publication. */
  kind: "coverage" | "column";
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
    id: "alwatan-2026-10-19",
    kind: "column",
    publication: "Al-Watan (Kuwait)",
    headline: "الذكاء الاصطناعي في المؤسسات: الابتكار يحتاج إلى حوكمة",
    headlineLang: "ar",
    date: "2026-10-19",
    author: "د. عبير صالح الشمري",
    url: "https://alwatan.kuwait.tt/articledetails.aspx?id=835111&writerid=498",
    summary: {
      en: "An opinion column by Dr. Abeer on governing AI inside organizations. It argues that risk depends on the specific use case, that data protection starts before anything is typed into an AI tool, that persuasive outputs still need qualified human review, and that AI governance is a shared responsibility across business, security, legal, and HR teams.",
      ar: "مقال رأي بقلم د. عبير حول حوكمة الذكاء الاصطناعي داخل المؤسسات. يوضح أن المخاطر تختلف باختلاف حالة الاستخدام، وأن حماية البيانات تبدأ قبل إدخالها في الأداة، وأن المخرجات المقنعة تحتاج إلى مراجعة بشرية مؤهلة، وأن الحوكمة مسؤولية مشتركة بين الإدارات المستفيدة والأمن السيبراني والجهات القانونية والموارد البشرية.",
    },
  },
  {
    id: "kuwait-times-2026-10-25",
    kind: "coverage",
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
