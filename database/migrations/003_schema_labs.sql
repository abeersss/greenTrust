-- =====================================================================
-- 003_schema_labs.sql
-- CYBERABEER LABS domain: learning paths -> courses -> modules -> labs ->
-- challenges -> questions -> answers, plus attempts, progress, XP, badges,
-- streaks, leaderboards, and certificates.
-- =====================================================================

create table learning_paths (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  order_index int not null default 0,
  icon        text,
  status      content_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create trigger trg_learning_paths_updated_at before update on learning_paths
  for each row execute function set_updated_at();

create table learning_path_translations (
  learning_path_id  uuid not null references learning_paths(id) on delete cascade,
  locale            locale_code not null,
  name              text not null,
  slug              text not null,
  description       text,
  primary key (learning_path_id, locale),
  constraint learning_path_translations_slug_locale_unique unique (locale, slug)
);

create table courses (
  id               uuid primary key default gen_random_uuid(),
  learning_path_id uuid references learning_paths(id) on delete set null,
  order_index      int not null default 0,
  status           content_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);
create index courses_path_idx on courses (learning_path_id);
create trigger trg_courses_updated_at before update on courses
  for each row execute function set_updated_at();

create table course_translations (
  course_id   uuid not null references courses(id) on delete cascade,
  locale      locale_code not null,
  title       text not null,
  slug        text not null,
  description text,
  primary key (course_id, locale),
  constraint course_translations_slug_locale_unique unique (locale, slug)
);

create table modules (
  id         uuid primary key default gen_random_uuid(),
  course_id  uuid not null references courses(id) on delete cascade,
  order_index int not null default 0,
  status     content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index modules_course_idx on modules (course_id);
create trigger trg_modules_updated_at before update on modules
  for each row execute function set_updated_at();

create table module_translations (
  module_id   uuid not null references modules(id) on delete cascade,
  locale      locale_code not null,
  title       text not null,
  description text,
  primary key (module_id, locale)
);

-- "labs" here is the CyberAbeer Labs content unit (a browser-based
-- scenario/exercise) — distinct from the GreenTrust product despite the
-- shared brand word. Not to be confused with the `governance_controls`
-- or `crypto_assets` tables in the GreenTrust/Quantum domains.
create table labs (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid references modules(id) on delete set null,
  lab_type    text not null default 'scenario' check (lab_type in ('scenario','quiz','flag')),
  difficulty  text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  order_index int not null default 0,
  xp_reward   int not null default 0,
  status      content_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index labs_module_idx on labs (module_id);
create trigger trg_labs_updated_at before update on labs
  for each row execute function set_updated_at();

create table lab_translations (
  lab_id       uuid not null references labs(id) on delete cascade,
  locale       locale_code not null,
  title        text not null,
  description  text,
  instructions text,
  primary key (lab_id, locale)
);

create table challenges (
  id             uuid primary key default gen_random_uuid(),
  lab_id         uuid references labs(id) on delete set null,
  key            text not null unique,
  challenge_type text not null default 'quiz' check (challenge_type in ('quiz','flag','scenario')),
  difficulty     text not null default 'beginner' check (difficulty in ('beginner','intermediate','advanced')),
  xp_reward      int not null default 0,
  starts_at      timestamptz,
  ends_at        timestamptz,
  status         content_status not null default 'draft',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index challenges_lab_idx on challenges (lab_id);
create index challenges_active_idx on challenges (status, starts_at, ends_at);
create trigger trg_challenges_updated_at before update on challenges
  for each row execute function set_updated_at();

create table challenge_translations (
  challenge_id uuid not null references challenges(id) on delete cascade,
  locale       locale_code not null,
  title        text not null,
  description  text,
  primary key (challenge_id, locale)
);

create table questions (
  id                 uuid primary key default gen_random_uuid(),
  challenge_id       uuid not null references challenges(id) on delete cascade,
  order_index        int not null default 0,
  question_type      text not null default 'multiple_choice'
                     check (question_type in ('multiple_choice','true_false','flag_submit','short_answer')),
  points             int not null default 1,
  correct_flag_hash  text, -- populated only when question_type = 'flag_submit'
  created_at         timestamptz not null default now()
);
create index questions_challenge_idx on questions (challenge_id);

create table question_translations (
  question_id  uuid not null references questions(id) on delete cascade,
  locale       locale_code not null,
  prompt       text not null,
  explanation  text,
  primary key (question_id, locale)
);

create table answers (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references questions(id) on delete cascade,
  is_correct   boolean not null default false,
  order_index  int not null default 0
);
create index answers_question_idx on answers (question_id);

create table answer_translations (
  answer_id  uuid not null references answers(id) on delete cascade,
  locale     locale_code not null,
  text       text not null,
  primary key (answer_id, locale)
);

create table attempts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  challenge_id  uuid not null references challenges(id) on delete cascade,
  status        text not null default 'in_progress' check (status in ('in_progress','completed','abandoned')),
  score         int not null default 0,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index attempts_user_idx on attempts (user_id);
create index attempts_challenge_idx on attempts (challenge_id);

create table attempt_answers (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references attempts(id) on delete cascade,
  question_id     uuid not null references questions(id) on delete cascade,
  answer_id       uuid references answers(id) on delete set null,
  submitted_flag  text,
  is_correct      boolean not null default false,
  submitted_at    timestamptz not null default now(),
  constraint attempt_answers_unique unique (attempt_id, question_id)
);

-- Progress is tracked as three explicit tables (path/course/module) rather
-- than one polymorphic table, so every row keeps a real, enforceable
-- foreign key — Postgres cannot enforce "entity_id points at whichever
-- table entity_type names," so we do not rely on that pattern here.
create table user_learning_path_progress (
  user_id           uuid not null references auth.users(id) on delete cascade,
  learning_path_id  uuid not null references learning_paths(id) on delete cascade,
  status            text not null default 'not_started'
                    check (status in ('not_started','in_progress','completed')),
  percent           numeric not null default 0,
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, learning_path_id)
);

create table user_course_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_id   uuid not null references courses(id) on delete cascade,
  status      text not null default 'not_started'
              check (status in ('not_started','in_progress','completed')),
  percent     numeric not null default 0,
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, course_id)
);

create table user_module_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  module_id   uuid not null references modules(id) on delete cascade,
  status      text not null default 'not_started'
              check (status in ('not_started','in_progress','completed')),
  percent     numeric not null default 0,
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  primary key (user_id, module_id)
);

-- XP is an append-only ledger. A user's total is always a computed sum of
-- this table (materialized into user_xp_totals below for fast reads), never
-- a directly-mutated counter — this avoids double-counting and race
-- conditions, and makes any disputed total independently auditable.
create table xp_events (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  event_type          text not null
                      check (event_type in ('challenge_completed','badge_awarded','streak_bonus','manual_adjustment')),
  points              int not null,
  related_entity_type text,
  related_entity_id   uuid,
  created_at          timestamptz not null default now()
);
create index xp_events_user_idx on xp_events (user_id);
create index xp_events_created_idx on xp_events (created_at);

create table levels (
  id            uuid primary key default gen_random_uuid(),
  level_number  int not null unique,
  xp_required   int not null
);

create table level_translations (
  level_id  uuid not null references levels(id) on delete cascade,
  locale    locale_code not null,
  name      text not null,
  primary key (level_id, locale)
);

-- Cache/rollup table: source of truth is xp_events; this table exists
-- purely so "show me my XP and level" is a single indexed-row lookup
-- instead of a SUM() over the full ledger on every page view.
create table user_xp_totals (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  total_xp    int not null default 0,
  level_id    uuid references levels(id) on delete set null,
  updated_at  timestamptz not null default now()
);

create or replace function fn_apply_xp_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into user_xp_totals (user_id, total_xp, updated_at)
  values (new.user_id, new.points, now())
  on conflict (user_id) do update
    set total_xp = user_xp_totals.total_xp + excluded.total_xp,
        updated_at = now();

  update user_xp_totals t
    set level_id = (
      select l.id from levels l
      where l.xp_required <= t.total_xp
      order by l.xp_required desc
      limit 1
    )
  where t.user_id = new.user_id;

  return new;
end;
$$;

create trigger trg_xp_events_apply
  after insert on xp_events
  for each row execute function fn_apply_xp_event();

create table badges (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  criteria    jsonb not null default '{}',
  icon_url    text,
  xp_bonus    int not null default 0,
  created_at  timestamptz not null default now()
);

create table badge_translations (
  badge_id     uuid not null references badges(id) on delete cascade,
  locale       locale_code not null,
  name         text not null,
  description  text,
  primary key (badge_id, locale)
);

create table user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  badge_id    uuid not null references badges(id) on delete cascade,
  awarded_at  timestamptz not null default now(),
  constraint user_badges_unique unique (user_id, badge_id)
);
create index user_badges_user_idx on user_badges (user_id);

-- Streaks are a cached derivation of xp_events activity dates, refreshed
-- by the same application logic that inserts a qualifying xp_event.
create table streaks (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  current_streak   int not null default 0,
  longest_streak    int not null default 0,
  last_activity_date date,
  updated_at        timestamptz not null default now()
);

create table leaderboard_snapshots (
  id           uuid primary key default gen_random_uuid(),
  period_type  text not null check (period_type in ('weekly','monthly','all_time')),
  period_start date not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  rank         int not null,
  xp           int not null,
  created_at   timestamptz not null default now(),
  constraint leaderboard_snapshots_unique unique (period_type, period_start, user_id)
);
create index leaderboard_snapshots_period_idx on leaderboard_snapshots (period_type, period_start, rank);
-- Live leaderboards are served from a view over user_xp_totals + profiles;
-- snapshots exist only to preserve historical weekly/monthly standings.

create table certificates (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  learning_path_id    uuid references learning_paths(id) on delete set null,
  course_id           uuid references courses(id) on delete set null,
  certificate_number  text not null unique,
  issued_at           timestamptz not null default now(),
  pdf_url             text,
  revoked_at          timestamptz
);
create index certificates_user_idx on certificates (user_id);
