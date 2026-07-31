-- 025_organizational_tools_free_assessments.sql
-- Phase: For Organizations tool migration. Free web versions of two paid
-- AbeerGRC toolkits (Cybersecurity Posture Assessment, ISO/IEC 27001 Gap
-- Assessment), migrated per the founder's decision to make them free.
-- Reuses tool_submissions (nullable user_id already supports anonymous
-- use; RLS already lets a signed-in user read their own past rows).

alter table tool_submissions drop constraint if exists tool_submissions_tool_key_check;
alter table tool_submissions add constraint tool_submissions_tool_key_check
  check (tool_key in (
      'greentrust_quick_assessment',
      'greentrust_free_assessment',
      'quantum_quick_assessment',
      'skill_assessment',
      'cyber_posture_assessment',
      'iso27001_gap_assessment'
  ));
