import type { AppLocale } from "@/lib/i18n/config";

/**
 * Data Governance & Information Management Center: static configuration
 * and localized UI copy. Route identifiers stay in English in both
 * locales (stable URLs); only display text is localized. Resource
 * content itself lives in the content engine (articles) and is edited
 * through the Founder CMS; this file only holds interface chrome.
 */

export type DgCategoryRoute = "classification" | "governance" | "quality" | "mdm";

export interface DgCategoryConfig {
  route: DgCategoryRoute;
  /** categories.key seeded by migration 033. */
  dbKey: string;
}

export const DG_CATEGORIES: DgCategoryConfig[] = [
  { route: "classification", dbKey: "dg_classification" },
  { route: "governance", dbKey: "dg_governance" },
  { route: "quality", dbKey: "dg_quality" },
  { route: "mdm", dbKey: "dg_mdm" },
];

export function isDgCategoryRoute(value: string): value is DgCategoryRoute {
  return DG_CATEGORIES.some((c) => c.route === value);
}

export function routeForDbKey(dbKey: string | null | undefined): DgCategoryRoute | null {
  return DG_CATEGORIES.find((c) => c.dbKey === dbKey)?.route ?? null;
}

export type DgStageKey = "sources" | "classification" | "quality" | "governance" | "master" | "decisions";

export const DG_STAGE_ORDER: DgStageKey[] = [
  "sources",
  "classification",
  "quality",
  "governance",
  "master",
  "decisions",
];

export type DgResourceType = "guide" | "checklist" | "framework" | "example" | "template";

interface StageCopy {
  title: string;
  purpose: string;
}

interface CategoryCopy {
  title: string;
  short: string;
  description: string;
  theme: string;
}

export interface DgCopy {
  hub: {
    title: string;
    subtitle: string;
    breadcrumb: string;
    metaTitle: string;
    metaDescription: string;
    eyebrow: string;
  };
  hero: {
    networkLabel: string;
    networkHint: string;
    stageDetailLabel: string;
    searchPlaceholder: string;
    searchLabel: string;
    searchButton: string;
    featuredLabel: string;
    featuredEmpty: string;
    readFeatured: string;
    categoriesLabel: string;
  };
  stages: Record<DgStageKey, StageCopy>;
  categories: Record<DgCategoryRoute, CategoryCopy>;
  panels: {
    heading: string;
    resourcesCount: (n: number) => string;
    featuredGuide: string;
    noFeatured: string;
    explore: string;
  };
  grid: {
    heading: string;
    subheading: string;
    searchPlaceholder: string;
    searchLabel: string;
    allCategories: string;
    allTopics: string;
    categoryFilter: string;
    topicFilter: string;
    sortLabel: string;
    sortRecent: string;
    sortFeatured: string;
    reset: string;
    showing: (shown: number, total: number) => string;
    empty: string;
    noneYet: string;
    interactive: string;
    featured: string;
    minRead: (n: number) => string;
    updated: string;
  };
  types: Record<DgResourceType, string>;
  categoryPage: {
    back: string;
    resources: string;
  };
  resource: {
    guidanceTitle: string;
    guidanceText: string;
    guidanceButton: string;
    sourcesTitle: string;
    accessed: string;
    relatedTitle: string;
    published: string;
    updated: string;
    backToCategory: string;
  };
}

const en: DgCopy = {
  hub: {
    title: "Data Governance & Information Management",
    subtitle:
      "Explore practical frameworks, interactive visualizations, and implementation guidance for protecting, governing, and improving enterprise data.",
    breadcrumb: "Data Governance",
    metaTitle: "Data Governance & Information Management | CyberAbeer",
    metaDescription:
      "Practical frameworks, interactive visualizations, and implementation guidance for data classification, data governance, data quality, and master data management.",
    eyebrow: "Knowledge Center",
  },
  hero: {
    networkLabel: "From raw data to trusted decisions",
    networkHint: "Select a stage to see its purpose.",
    stageDetailLabel: "Stage purpose",
    searchPlaceholder: "Search guides, checklists, and frameworks",
    searchLabel: "Search resources",
    searchButton: "Search",
    featuredLabel: "Featured resource",
    featuredEmpty: "Featured guides will appear here as they are published.",
    readFeatured: "Read the guide",
    categoriesLabel: "Browse by discipline",
  },
  stages: {
    sources: {
      title: "Data Sources",
      purpose:
        "Systems, files, and feeds where data is created or collected. Knowing what exists and where it lives is the starting point for every control that follows.",
    },
    classification: {
      title: "Classification",
      purpose:
        "Each data set is labeled by sensitivity so that encryption, access, retention, and sharing rules can be applied consistently.",
    },
    quality: {
      title: "Quality Controls",
      purpose:
        "Profiling, validation rules, and monitoring catch incomplete, duplicate, or inconsistent data before it reaches reports and decisions.",
    },
    governance: {
      title: "Governance",
      purpose:
        "Named owners and stewards, clear policies, and decision rights make sure someone is accountable for the data and the rules that protect it.",
    },
    master: {
      title: "Master Data",
      purpose:
        "Shared entities such as customers, products, and suppliers are matched and merged into one trusted record used across systems.",
    },
    decisions: {
      title: "Trusted Decisions",
      purpose:
        "Leaders and teams act on data they can trace, explain, and rely on, which is the outcome every earlier stage exists to serve.",
    },
  },
  categories: {
    classification: {
      title: "Data Classification & Information Protection",
      short: "Classification",
      description:
        "Secure documents with sensitivity labels, encryption, and access controls that follow the data through its lifecycle.",
      theme: "Labels, encryption, access controls",
    },
    governance: {
      title: "Data Governance",
      short: "Governance",
      description:
        "Build the frameworks, ownership model, and decision rights that make accountability for data real.",
      theme: "Frameworks, ownership, decisions",
    },
    quality: {
      title: "Data Quality Management",
      short: "Quality",
      description:
        "Measure, profile, and validate data with dashboards and metrics that show whether it is fit for use.",
      theme: "Metrics, profiling, validation",
    },
    mdm: {
      title: "Master Data Management",
      short: "MDM",
      description:
        "Connect records across systems into golden records and integration patterns the whole business can trust.",
      theme: "Golden records, integration",
    },
  },
  panels: {
    heading: "Four disciplines, one trusted data foundation",
    resourcesCount: (n) => (n === 1 ? "1 resource" : `${n} resources`),
    featuredGuide: "Featured guide",
    noFeatured: "Guides are being published.",
    explore: "Explore",
  },
  grid: {
    heading: "Resource library",
    subheading: "Guides, checklists, frameworks, and worked examples. Filter by discipline or topic.",
    searchPlaceholder: "Search resources",
    searchLabel: "Search resources",
    allCategories: "All disciplines",
    allTopics: "All topics",
    categoryFilter: "Discipline",
    topicFilter: "Topic",
    sortLabel: "Sort",
    sortRecent: "Most recent",
    sortFeatured: "Featured first",
    reset: "Reset filters",
    showing: (shown, total) => `Showing ${shown} of ${total}`,
    empty: "No resources match these filters.",
    noneYet: "Resources are being published. Please check back soon.",
    interactive: "Interactive",
    featured: "Featured",
    minRead: (n) => `${n} min read`,
    updated: "Updated",
  },
  types: {
    guide: "Guide",
    checklist: "Checklist",
    framework: "Framework",
    example: "Worked example",
    template: "Template",
  },
  categoryPage: {
    back: "Back to Data Governance",
    resources: "Resources",
  },
  resource: {
    guidanceTitle: "Need help applying this in your organization?",
    guidanceText:
      "Tell us about your context and we will respond with practical guidance on adapting this approach to your data, regulations, and team.",
    guidanceButton: "Request Guidance",
    sourcesTitle: "References and further reading",
    accessed: "Accessed",
    relatedTitle: "Continue exploring",
    published: "Published",
    updated: "Updated",
    backToCategory: "Back to",
  },
};

const ar: DgCopy = {
  hub: {
    title: "حوكمة البيانات وإدارة المعلومات",
    subtitle:
      "استكشف الأطر العملية والرسوم التفاعلية والإرشادات التطبيقية لحماية بيانات المؤسسات وحوكمتها وتحسين جودتها.",
    breadcrumb: "حوكمة البيانات",
    metaTitle: "حوكمة البيانات وإدارة المعلومات | CyberAbeer",
    metaDescription:
      "أطر عملية ورسوم تفاعلية وإرشادات تطبيقية لتصنيف البيانات وحوكمتها وإدارة جودتها وإدارة البيانات الرئيسية.",
    eyebrow: "مركز المعرفة",
  },
  hero: {
    networkLabel: "من البيانات الخام إلى القرارات الموثوقة",
    networkHint: "اختر مرحلة لعرض الغرض منها.",
    stageDetailLabel: "الغرض من المرحلة",
    searchPlaceholder: "ابحث في الأدلة وقوائم التحقق والأطر",
    searchLabel: "البحث في الموارد",
    searchButton: "بحث",
    featuredLabel: "مورد مميز",
    featuredEmpty: "ستظهر الأدلة المميزة هنا فور نشرها.",
    readFeatured: "اقرأ الدليل",
    categoriesLabel: "تصفح حسب المجال",
  },
  stages: {
    sources: {
      title: "مصادر البيانات",
      purpose:
        "الأنظمة والملفات والتدفقات التي تُنشأ أو تُجمع فيها البيانات. معرفة ما هو موجود وأين يوجد هي نقطة البداية لكل ضابط يليها.",
    },
    classification: {
      title: "التصنيف",
      purpose:
        "تُوسم كل مجموعة بيانات بحسب حساسيتها كي تُطبَّق قواعد التشفير والوصول والاحتفاظ والمشاركة بصورة متسقة.",
    },
    quality: {
      title: "ضوابط الجودة",
      purpose:
        "يكشف التحليل وقواعد التحقق والمراقبة البيانات الناقصة أو المكررة أو غير المتسقة قبل أن تصل إلى التقارير والقرارات.",
    },
    governance: {
      title: "الحوكمة",
      purpose:
        "يضمن وجود ملاك ومشرفين معيّنين وسياسات واضحة وصلاحيات قرار أن هناك من يتحمل المسؤولية عن البيانات والقواعد التي تحميها.",
    },
    master: {
      title: "البيانات الرئيسية",
      purpose:
        "تُطابَق الكيانات المشتركة مثل العملاء والمنتجات والموردين وتُدمج في سجل واحد موثوق تستخدمه جميع الأنظمة.",
    },
    decisions: {
      title: "قرارات موثوقة",
      purpose:
        "يتصرف القادة والفرق بناءً على بيانات يمكن تتبعها وشرحها والاعتماد عليها، وهي النتيجة التي تخدمها كل المراحل السابقة.",
    },
  },
  categories: {
    classification: {
      title: "تصنيف البيانات وحماية المعلومات",
      short: "التصنيف",
      description:
        "أمّن المستندات بتسميات الحساسية والتشفير وضوابط الوصول التي ترافق البيانات طوال دورة حياتها.",
      theme: "التسميات والتشفير وضوابط الوصول",
    },
    governance: {
      title: "حوكمة البيانات",
      short: "الحوكمة",
      description: "ابنِ الأطر ونموذج الملكية وصلاحيات القرار التي تجعل المساءلة عن البيانات واقعاً.",
      theme: "الأطر والملكية والقرارات",
    },
    quality: {
      title: "إدارة جودة البيانات",
      short: "الجودة",
      description: "قِس البيانات وحلّلها وتحقق منها بلوحات ومقاييس تُظهر مدى صلاحيتها للاستخدام.",
      theme: "المقاييس والتحليل والتحقق",
    },
    mdm: {
      title: "إدارة البيانات الرئيسية",
      short: "البيانات الرئيسية",
      description: "اربط السجلات عبر الأنظمة في سجلات ذهبية وأنماط تكامل تثق بها الأعمال بأكملها.",
      theme: "السجلات الذهبية والتكامل",
    },
  },
  panels: {
    heading: "أربعة مجالات وأساس واحد موثوق للبيانات",
    resourcesCount: (n) => (n === 1 ? "مورد واحد" : n === 2 ? "موردان" : `${n} موارد`),
    featuredGuide: "دليل مميز",
    noFeatured: "جارٍ نشر الأدلة.",
    explore: "استكشف",
  },
  grid: {
    heading: "مكتبة الموارد",
    subheading: "أدلة وقوائم تحقق وأطر وأمثلة تطبيقية. صفِّ حسب المجال أو الموضوع.",
    searchPlaceholder: "ابحث في الموارد",
    searchLabel: "البحث في الموارد",
    allCategories: "جميع المجالات",
    allTopics: "جميع المواضيع",
    categoryFilter: "المجال",
    topicFilter: "الموضوع",
    sortLabel: "الترتيب",
    sortRecent: "الأحدث",
    sortFeatured: "المميز أولاً",
    reset: "إعادة ضبط التصفية",
    showing: (shown, total) => `عرض ${shown} من ${total}`,
    empty: "لا توجد موارد تطابق هذه التصفية.",
    noneYet: "جارٍ نشر الموارد. يرجى المراجعة قريباً.",
    interactive: "تفاعلي",
    featured: "مميز",
    minRead: (n) => `${n} دقيقة قراءة`,
    updated: "آخر تحديث",
  },
  types: {
    guide: "دليل",
    checklist: "قائمة تحقق",
    framework: "إطار",
    example: "مثال تطبيقي",
    template: "نموذج",
  },
  categoryPage: {
    back: "العودة إلى حوكمة البيانات",
    resources: "الموارد",
  },
  resource: {
    guidanceTitle: "هل تحتاج مساعدة في تطبيق هذا في مؤسستك؟",
    guidanceText:
      "أخبرنا بسياق مؤسستك وسنرد عليك بإرشادات عملية لتكييف هذا النهج مع بياناتك وأنظمتك التنظيمية وفريقك.",
    guidanceButton: "اطلب إرشاداً",
    sourcesTitle: "المراجع والقراءات الإضافية",
    accessed: "تاريخ الاطلاع",
    relatedTitle: "تابع الاستكشاف",
    published: "نُشر",
    updated: "حُدّث",
    backToCategory: "العودة إلى",
  },
};

export function getDgCopy(locale: AppLocale): DgCopy {
  return locale === "ar" ? ar : en;
}
