export interface Bilingual {
  en: string;
  ar: string;
}

export function pick(text: Bilingual, locale: string): string {
  return locale === "ar" ? text.ar : text.en;
}
