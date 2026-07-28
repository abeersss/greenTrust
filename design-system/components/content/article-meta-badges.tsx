import { Badge } from "@/components/ui/badge";

export interface ArticleMetaBadgesProps {
  difficulty: "beginner" | "intermediate" | "advanced" | null;
  audience: string[];
  difficultyLabels: Record<"beginner" | "intermediate" | "advanced", string>;
  audienceLabels: Record<string, string>;
}

const DIFFICULTY_VARIANT = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
} as const;

/**
 * Difficulty + audience chips shown under an article's title. Both
 * fields are optional in the schema (plenty of evergreen content has
 * neither), so this renders nothing rather than an empty badge row
 * when both are unset.
 */
export function ArticleMetaBadges({ difficulty, audience, difficultyLabels, audienceLabels }: ArticleMetaBadgesProps) {
  if (!difficulty && audience.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {difficulty && <Badge variant={DIFFICULTY_VARIANT[difficulty]}>{difficultyLabels[difficulty]}</Badge>}
      {audience.map((a) => (
        <Badge key={a} variant="outline">
          {audienceLabels[a] ?? a}
        </Badge>
      ))}
    </div>
  );
}
