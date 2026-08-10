-- =============================================================
-- 029_books.sql
--
-- CyberAbeer Platform Phase II -- Books. The public site currently
-- has no data model for Dr. Abeer's book(s): the founder sidebar has
-- had a disabled "Books" nav entry ("Coming soon") since Phase 1 with
-- nothing behind it. This migration adds the minimal table needed for
-- a real listing -- one row per book, with exactly the three fields a
-- reader needs: title, description, and the Amazon purchase link --
-- plus a handful of ordering/visibility columns so the founder can
-- add a book from the admin UI before it's ready to go public, and
-- control the display order once there's more than one.
-- =============================================================

create table books (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  description     text not null,
  amazon_url      text not null,
  cover_image_url text,
  display_order   int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index books_display_order_idx on books (display_order);
create index books_is_active_idx on books (is_active);

-- Public readers only ever see active books; the founder's own
-- session (is_platform_admin(), defined in migration 007) gets full
-- read/write so the admin page can list drafts too and let her add,
-- edit, or unpublish -- same split as articles (published vs. draft)
-- but simpler since a book has no editorial workflow states.
alter table books enable row level security;
alter table books force row level security;

create policy books_public_read on books for select
  using (is_active = true);

create policy books_admin_all on books for all
  using (is_platform_admin()) with check (is_platform_admin());
