import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageCarousel } from "@/components/site/image-carousel";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { getPublishedBooks } from "@/lib/books/books";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "books",
    title: t("booksTitle"),
    description: t("booksDescription"),
  });
}

/**
 * Public Books page (CyberAbeer Platform). Reads only is_active rows
 * from the books table (migration 029) and, per migration 032, each
 * book carries a full English and a full Arabic edition -- title,
 * description, and Amazon link -- so this resolves the row to the
 * caller's locale before rendering, plus an optional up-to-4-image
 * gallery per edition (migration 032) shown as a sliding carousel
 * when present.
 *
 * The cover renders as a CSS-only 3D book mockup (ImageCarousel's
 * variant="book") instead of the flat cropped-rectangle treatment
 * used for tool-resource screenshots elsewhere -- a book cover is
 * portrait, text-heavy, and meant to be read whole, not cropped to
 * fill a wide box. Each card is laid out as a fixed-width mockup
 * beside the title/description/CTA rather than stacked full-width
 * above them, both because that reads as a more natural "book
 * listing" than a hero-image card, and because flexbox's `row` axis
 * is direction-aware: in the Arabic (rtl) tree the same markup
 * places the mockup on the reader's right without any extra
 * language-specific layout code, matching how a shelved book's
 * spine sits toward the near hand in each reading direction.
 */
export default async function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "books" });
  const books = await getPublishedBooks(locale as AppLocale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 tablet:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("kicker")}</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-text-primary tablet:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg text-text-secondary">{t("intro")}</p>

      <div className="mt-8 space-y-6">
        {books.map((book) => (
          <Card key={book.id} className="overflow-hidden">
            <CardContent className="flex flex-col gap-6 p-6 tablet:flex-row tablet:items-start">
              {book.imageUrls.length > 0 && (
                <ImageCarousel
                  images={book.imageUrls}
                  alt={book.title}
                  variant="book"
                  className="w-36 shrink-0 tablet:w-40"
                />
              )}
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-xl font-bold text-text-primary">{book.title}</h2>
                  <p className="mt-2 text-text-secondary">{book.description}</p>
                  <Button asChild className="mt-4">
                    <a href={book.amazonUrl} target="_blank" rel="noopener noreferrer">
                      {t("buyButton")}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {books.length === 0 && <p className="text-text-muted">{t("empty")}</p>}
      </div>
    </div>
  );
}

