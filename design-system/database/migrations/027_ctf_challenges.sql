-- =====================================================================
-- Migration 027: CyberAbeer CTF track -- 6 flag-submission challenges
-- (2 web, 2 forensics, 2 crypto), replacing the "coming soon" /labs/ctf
-- placeholder with real, playable content.
--
-- Context: CTF is a second, structurally different challenge format
-- from Decision Labs. Decision Labs is a branching-scenario engine;
-- CTF is a flag-submission engine (challenge_type = 'flag', the
-- built-in but previously-unused type from the original 003 schema).
-- All 6 challenges are fully client-side simulations -- no live
-- exploitation infrastructure -- rendered by
-- components/ctf/ctf-challenge.tsx from static data in
-- lib/ctf/challenges.ts. These `challenges`/`challenge_translations`/
-- `badges`/`badge_translations` rows exist purely so the shared,
-- generic challenge infrastructure (lib/actions/challenge.ts,
-- anonymous_challenge_sessions, xp_events, user_badges) can save
-- progress, award XP, and unlock badges exactly like every Decision
-- Lab already does -- the row content itself is never rendered
-- directly; page copy comes from lib/ctf/challenges.ts.
--
-- Keys here must exactly match CHALLENGE_KEYS / CHALLENGE_BADGE_KEYS
-- in design-system/lib/challenges/keys.ts and the `key` field on each
-- entry in design-system/lib/ctf/challenges.ts.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Web -- Hidden in Plain Sight (beginner, 100 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_web_hidden_in_plain_sight', null, 'flag', 'beginner', 100, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'Hidden in Plain Sight', 'Read the raw HTML of a staff login page and find what a developer forgot to remove.'
from challenges where key = 'ctf_web_hidden_in_plain_sight';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'مخفي في العلن', 'اقرأ شيفرة HTML الخام لصفحة تسجيل دخول الموظفين واعثر على ما نسي أحد المطورين إزالته.'
from challenges where key = 'ctf_web_hidden_in_plain_sight';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_hidden_in_plain_sight', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_web_hidden_in_plain_sight'), null, 15);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'Hidden in Plain Sight', 'Found a flag hidden in HTML source' from badges where key = 'flag_hidden_in_plain_sight';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'مخفي في العلن', 'عثر على علم مخفي في مصدر HTML' from badges where key = 'flag_hidden_in_plain_sight';

-- ---------------------------------------------------------------------
-- 2. Web -- Broken Access Control (intermediate, 150 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_web_broken_access_control', null, 'flag', 'intermediate', 150, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'Broken Access Control', 'A billing API trusts the invoice ID in the request. See what it hands over if you change it.'
from challenges where key = 'ctf_web_broken_access_control';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'تحكم وصول مكسور', 'واجهة برمجة الفوترة تثق بمعرّف الفاتورة الوارد في الطلب. اكتشف ما الذي ستكشفه إن غيّرته.'
from challenges where key = 'ctf_web_broken_access_control';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_broken_access_control', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_web_broken_access_control'), null, 20);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'Broken Access Control', 'Exploited an IDOR to read another user''s data' from badges where key = 'flag_broken_access_control';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'تحكم وصول مكسور', 'استغل ثغرة IDOR لقراءة بيانات مستخدم آخر' from badges where key = 'flag_broken_access_control';

-- ---------------------------------------------------------------------
-- 3. Forensics -- Suspicious Log (beginner, 100 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_forensics_suspicious_log', null, 'flag', 'beginner', 100, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'Suspicious Log', 'Scroll a server access log for the one line that doesn''t belong, then decode it.'
from challenges where key = 'ctf_forensics_suspicious_log';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'سجل مشبوه', 'تصفّح سجل وصول الخادم بحثًا عن السطر الوحيد الذي لا ينتمي إلى النمط، ثم فكّ ترميزه.'
from challenges where key = 'ctf_forensics_suspicious_log';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_suspicious_log', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_forensics_suspicious_log'), null, 15);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'Suspicious Log', 'Decoded a base64 flag hidden in a log file' from badges where key = 'flag_suspicious_log';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'سجل مشبوه', 'فكّ تشفير علم base64 مخفي في ملف سجل' from badges where key = 'flag_suspicious_log';

-- ---------------------------------------------------------------------
-- 4. Forensics -- The Deleted File (intermediate, 150 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_forensics_deleted_file', null, 'flag', 'intermediate', 150, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'The Deleted File', 'Read the ASCII column of a recovered hex dump to reconstruct a "deleted" flag.'
from challenges where key = 'ctf_forensics_deleted_file';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'الملف المحذوف', 'اقرأ عمود ASCII في تفريغ سداسي عشري مسترجَع لإعادة بناء علم "محذوف".'
from challenges where key = 'ctf_forensics_deleted_file';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_deleted_file', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_forensics_deleted_file'), null, 20);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'The Deleted File', 'Recovered a flag from unallocated disk space' from badges where key = 'flag_deleted_file';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'الملف المحذوف', 'استرجع علمًا من مساحة قرص غير مخصصة' from badges where key = 'flag_deleted_file';

-- ---------------------------------------------------------------------
-- 5. Crypto -- Caesar's Mistake (beginner, 100 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_crypto_caesars_mistake', null, 'flag', 'beginner', 100, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'Caesar''s Mistake', 'Slide through 25 possible shifts until a Caesar cipher becomes legible.'
from challenges where key = 'ctf_crypto_caesars_mistake';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'خطأ قيصر', 'جرّب الإزاحات الـ25 الممكنة حتى تصبح شفرة قيصر قابلة للقراءة.'
from challenges where key = 'ctf_crypto_caesars_mistake';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_caesars_mistake', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_crypto_caesars_mistake'), null, 15);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'Caesar''s Mistake', 'Brute-forced a Caesar cipher to recover the flag' from badges where key = 'flag_caesars_mistake';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'خطأ قيصر', 'كسر شفرة قيصر بتجربة كل الاحتمالات لاسترجاع العلم' from badges where key = 'flag_caesars_mistake';

-- ---------------------------------------------------------------------
-- 6. Crypto -- The Weak Key (intermediate, 150 XP)
-- ---------------------------------------------------------------------
insert into challenges (key, lab_id, challenge_type, difficulty, xp_reward, status)
values ('ctf_crypto_weak_key', null, 'flag', 'intermediate', 150, 'published');

insert into challenge_translations (challenge_id, locale, title, description)
select id, 'en', 'The Weak Key', 'Peel back two stacked, non-cryptographic encodings to recover the flag.'
from challenges where key = 'ctf_crypto_weak_key';
insert into challenge_translations (challenge_id, locale, title, description)
select id, 'ar', 'المفتاح الضعيف', 'أزل طبقتين متراكبتين من الترميز غير التشفيري لاسترجاع العلم.'
from challenges where key = 'ctf_crypto_weak_key';

insert into badges (key, criteria, icon_url, xp_bonus)
values ('flag_weak_key', jsonb_build_object('type', 'challenge_completed', 'challenge_key', 'ctf_crypto_weak_key'), null, 20);
insert into badge_translations (badge_id, locale, name, description)
select id, 'en', 'The Weak Key', 'Unwound two stacked encodings to recover the flag' from badges where key = 'flag_weak_key';
insert into badge_translations (badge_id, locale, name, description)
select id, 'ar', 'المفتاح الضعيف', 'فكّ طبقتين متراكبتين من الترميز لاسترجاع العلم' from badges where key = 'flag_weak_key';

-- Verification query (run manually after the inserts above to confirm
-- all 6 challenges + 6 badges landed with both locales' translations):
-- select c.key, c.challenge_type, c.difficulty, c.xp_reward, ct.locale, ct.title
-- from challenges c join challenge_translations ct on ct.challenge_id = c.id
-- where c.key like 'ctf_%' order by c.key, ct.locale;
--
-- select b.key, b.xp_bonus, bt.locale, bt.name
-- from badges b join badge_translations bt on bt.badge_id = b.id
-- where b.key like 'flag_%' order by b.key, bt.locale;
