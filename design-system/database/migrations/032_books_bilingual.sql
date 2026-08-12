-- =============================================================
-- 032_books_bilingual.sql
--
-- The Books admin only ever captured one language's worth of
-- content (title/description/amazon_url/image_urls), but the site
-- is bilingual end to end and a book's English and Arabic editions
-- are genuinely different products -- different blurb, different
-- Amazon storefront link, often a different cover. This migration
-- splits every book-facing field into an _en and _ar pair so the
-- founder can manage both editions from one form and each public
-- locale renders its own edition. The books table has never had a
-- successful insert (0 rows in production), so this is a clean
-- rename + additive migration with no backfill required.
-- =============================================================

alter table books rename column title to title_en;
alter table books rename column description to description_en;
alter table books rename column amazon_url to amazon_url_en;
alter table books rename column cover_image_url to cover_image_url_en;
alter table books rename column image_urls to image_urls_en;

alter table books
  add column title_ar text not null,
  add column description_ar text not null,
  add column amazon_url_ar text not null,
  add column cover_image_url_ar text,
  add column image_urls_ar text[] not null default '{}';
