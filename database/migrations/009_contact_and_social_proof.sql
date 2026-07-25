-- 009_contact_and_social_proof.sql
-- Milestone 1 addition: general contact messages, plus CMS-ready
-- placeholders for testimonials and customer logos.
--
-- Both testimonials and customer_logos are created EMPTY. Nothing in
-- this migration seeds a testimonial, a customer name, a logo, or a
-- statistic. Public site code must only ever render rows where
-- is_published = true AND is_verified = true.

create table contact_messages (
    id         uuid primary key default gen_random_uuid(),
    contact_id uuid not null references contacts(id) on delete cascade,
    page_path  text,
    locale     locale_code not null default 'en',
    message    text not null,
    status     text not null default 'new'
               check (status in ('new','read','replied','archived')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
create index contact_messages_contact_idx on contact_messages (contact_id);
create index contact_messages_status_idx on contact_messages (status);
create trigger trg_contact_messages_updated_at before update on contact_messages
  for each row execute function set_updated_at();

create table testimonials (
    id                   uuid primary key default gen_random_uuid(),
    author_name          text not null,
    author_title         text,
    author_organization  text,
    quote                text not null,
    avatar_url           text,
    related_product      text check (related_product in ('greentrust','labs','general')),
    is_verified          boolean not null default false,
    is_published         boolean not null default false,
    display_order        int not null default 0,
    created_at           timestamptz not null default now(),
    updated_at           timestamptz not null default now(),
    deleted_at           timestamptz
  );
create index testimonials_public_idx on testimonials (is_published, is_verified)
  where deleted_at is null;
create trigger trg_testimonials_updated_at before update on testimonials
  for each row execute function set_updated_at();

create table customer_logos (
    id                uuid primary key default gen_random_uuid(),
    organization_name text not null,
    logo_url          text,
    website_url       text,
    is_verified       boolean not null default false,
    is_published      boolean not null default false,
    display_order     int not null default 0,
    created_at        timestamptz not null default now(),
    deleted_at        timestamptz
  );
create index customer_logos_public_idx on customer_logos (is_published, is_verified)
  where deleted_at is null;

alter table contact_messages enable row level security;
alter table contact_messages force row level security;
alter table testimonials enable row level security;
alter table testimonials force row level security;
alter table customer_logos enable row level security;
alter table customer_logos force row level security;

create policy contact_messages_admin_all on contact_messages
  for all using (is_platform_admin()) with check (is_platform_admin());

create policy testimonials_public_read on testimonials
  for select using (is_published = true and is_verified = true and deleted_at is null);
create policy testimonials_admin_all on testimonials
  for all using (is_platform_admin()) with check (is_platform_admin());

create policy customer_logos_public_read on customer_logos
  for select using (is_published = true and is_verified = true and deleted_at is null);
create policy customer_logos_admin_all on customer_logos
  for all using (is_platform_admin()) with check (is_platform_admin());
