import { Bot, Scale, ShieldAlert, Database, Atom, GraduationCap, type LucideIcon } from "lucide-react";

/**
 * Maps the 6 top-level content-pillar `key`s (seeded in
 * 012_content_engine_expansion.sql) to a Lucide icon, so the Insights
 * page's "Popular Topics" rail and any other pillar chip can show a
 * consistent glyph without hardcoding icon choices per page.
 */
const PILLAR_ICON_MAP: Record<string, LucideIcon> = {
  pillar_ai_security_governance: Bot,
  pillar_grc_governance: Scale,
  pillar_cyber_defense: ShieldAlert,
  pillar_data_trust: Database,
  pillar_future_security: Atom,
  pillar_learn_cybersecurity: GraduationCap,
};

export function getPillarIcon(key: string): LucideIcon {
  return PILLAR_ICON_MAP[key] ?? Scale;
}
