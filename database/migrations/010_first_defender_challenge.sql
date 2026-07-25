-- 010_first_defender_challenge.sql
-- Milestone 2: CyberAbeer Free Cyber Challenge ("First Defender: Spot
-- the Phish"). Plugs into the existing Phase 3 Labs gamification
-- schema (challenges/badges/xp_events/user_badges) rather than
-- inventing a parallel one, and adds one new table to support the
-- anonymous-first play pattern: a visitor can play and complete the
-- whole scenario before ever creating an account.

insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('first_defender_spot_the_phish', null, 'scenario', 'beginner', 150, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en',
  'First Defender: Spot the Phish',
  'An interactive phishing-detection scenario. Inspect five realistic messages, decide what to do, and earn the CyberAbeer First Defender badge.'
from challenges where key = 'first_defender_spot_the_phish';

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar',
  'المدافع الأول: اكتشف التصيد الاحتيالي',
  'سيناريو تفاعلي لاكتشاف التصيد الاحتيالي. افحص خمس رسائل واقعية، وقرر ماذا تفعل، واحصل على شارة المدافع الأول من CyberAbeer.'
from challenges where key = 'first_defender_spot_the_phish';

insert into badges (key, criteria, icon_url, xp_bonus)
values (
    'first_defender',
    jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'first_defender_spot_the_phish'),
    null,
    25
  );

insert into badge_translations (badge_id, locale, name, description)
select id, 'en',
  'CyberAbeer First Defender',
  'Awarded for completing the First Defender: Spot the Phish challenge, CyberAbeer''s free introduction to recognizing phishing and social engineering.'
from badges where key = 'first_defender';

insert into badge_translations (badge_id, locale, name, description)
select id, 'ar',
  'المدافع الأول من CyberAbeer',
  'تُمنح هذه الشارة عند إتمام تحدي المدافع الأول: اكتشف التصيد الاحتيالي، وهو مقدمة مجانية من CyberAbeer للتعرف على التصيد الاحتيالي والهندسة الاجتماعية.'
from badges where key = 'first_defender';

create table anonymous_challenge_sessions (
    id            uuid primary key default gen_random_uuid(),
    anon_id       uuid not null unique,
    challenge_key text not null references challenges(key) on delete cascade,
    status        text not null default 'in_progress' check (status in ('in_progress','completed')),
    current_step  int not null default 0,
    score         int not null default 0,
    xp_earned     int not null default 0,
    hints_used    int not null default 0,
    steps_state   jsonb not null default '{}',
    locale        locale_code not null default 'en',
    started_at    timestamptz not null default now(),
    completed_at  timestamptz,
    claimed_by    uuid references auth.users(id) on delete set null,
    claimed_at    timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
  );
create index anonymous_challenge_sessions_challenge_idx on anonymous_challenge_sessions (challenge_key);
create index anonymous_challenge_sessions_claimed_idx on anonymous_challenge_sessions (claimed_by);
create trigger trg_anonymous_challenge_sessions_updated_at before update on anonymous_challenge_sessions
  for each row execute function set_updated_at();

alter table anonymous_challenge_sessions enable row level security;
alter table anonymous_challenge_sessions force row level security;

create policy anonymous_challenge_sessions_admin_all on anonymous_challenge_sessions
  for all using (is_platform_admin()) with check (is_platform_admin());
