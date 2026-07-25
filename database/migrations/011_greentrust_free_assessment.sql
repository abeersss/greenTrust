-- 011_greentrust_free_assessment.sql
-- Phase 8: GreenTrust Free Assessment. Widens tool_submissions.tool_key
-- to admit 'greentrust_free_assessment'; no new table needed since
-- tool_submissions already supports nullable user_id (anonymous use)
-- and its RLS policy already lets a signed-in user read their own past
-- rows via user_id = auth.uid().

alter table tool_submissions drop constraint if exists tool_submissions_tool_key_check;
alter table tool_submissions add constraint tool_submissions_tool_key_check
  check (tool_key in (
      'greentrust_quick_assessment',
      'greentrust_free_assessment',
      'quantum_quick_assessment',
      'skill_assessment'
    ));

create index if not exists tool_submissions_user_tool_idx
  on tool_submissions (user_id, tool_key, created_at desc);

comment on column tool_submissions.result is
  'For tool_key=''greentrust_free_assessment'': { domainScores, riskClassification, topRecommendations, answers }.';
