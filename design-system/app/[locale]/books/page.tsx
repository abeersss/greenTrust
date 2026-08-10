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
 * from the books table (migration 029) -- title, description, and
 * the Amazon purchase link, plus an optional up-to-4-image gallery
 * (migration 030) shown as a sliding carousel when present.
 */
export default async function BooksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();

  const t = await getTranslations({ locale, namespace: "books" });
  const books = await getPublishedBooks();

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
            {book.imageUrls.length > 0 && (
              <ImageCarousel images={book.imageUrls} alt={book.title} heightClassName="h-64" />
            )}
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
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
