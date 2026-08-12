import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getBooksForFounder } from "@/lib/founder/books-admin";
import { FounderBooksForm } from "@/components/founder/founder-books-form";
import { FounderBookRowActions } from "@/components/founder/founder-book-row-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder Books admin (Phase II). Every book is two real editions, not
 * one record with a translated label -- separate title, description,
 * Amazon link, and cover images for English and Arabic (migration 032)
 * -- so each row shows both editions side by side. "Hide" unpublishes
 * both editions without deleting -- the public /books page only shows
 * is_active rows, and each locale renders its own edition.
 */
export default async function FounderBooksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);
  const books = await getBooksForFounder();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Books</h1>
      <p className="mt-1 text-sm text-text-muted">
        Add and manage the books shown on the public Books page. Every book needs a complete English
        edition and a complete Arabic edition -- title, description, and Amazon link for each.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add a book</CardTitle>
        </CardHeader>
        <CardContent>
          <FounderBooksForm locale={l} />
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Your books</h2>
      <div className="mt-3 space-y-4">
        {books.map((book) => (
          <Card key={book.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={book.isActive ? "success" : "danger"}>
                      {book.isActive ? "Live" : "Hidden"}
                    </Badge>
                  </div>

                  <div className="grid gap-4 tablet:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        English edition
                      </p>
                      <p className="mt-1 font-medium text-text-primary">{book.titleEn}</p>
                      <p className="mt-1 text-sm text-text-muted">{book.descriptionEn}</p>
                      <a
                        href={book.amazonUrlEn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm text-primary underline underline-offset-4"
                      >
                        {book.amazonUrlEn}
                      </a>
                    </div>

                    <div dir="rtl" className="border-t border-border pt-4 tablet:border-l tablet:border-t-0 tablet:pl-4 tablet:pt-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                        النسخة العربية
                      </p>
                      <p className="mt-1 font-medium text-text-primary">{book.titleAr}</p>
                      <p className="mt-1 text-sm text-text-muted">{book.descriptionAr}</p>
                      <a
                        href={book.amazonUrlAr}
                        target="_blank"
                        rel="noopener noreferrer"
                        dir="ltr"
                        className="mt-1 inline-block text-sm text-primary underline underline-offset-4"
                      >
                        {book.amazonUrlAr}
                      </a>
                    </div>
                  </div>
                </div>
                <FounderBookRowActions locale={l} bookId={book.id} isActive={book.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
        {books.length === 0 && (
          <p className="text-sm text-text-muted">No books yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
