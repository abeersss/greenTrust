"use client";

import * as React from "react";
import { Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator";
import { Badge } from "@/components/ui/badge";

export interface AgentCardProps {
  name: string;
  agentType: string;
  status: "active" | "inactive" | "deprecated" | "shadow";
  environment: "production" | "staging" | "development";
  riskLevel?: RiskLevel;
  ownerName?: string;
  onClick?: () => void;
}

const statusTone: Record<AgentCardProps["status"], "positive" | "neutral" | "negative" | "pending"> = {
  active: "positive",
  inactive: "neutral",
  deprecated: "negative",
  shadow: "pending",
};

/**
 * AgentCard — one row of the AI agent inventory (Phase 3: ai_agents),
 * rendered as a card for grid layouts (list/table view uses the same
 * data through components/ui/table.tsx instead).
 */
export function AgentCard({ name, agentType, status, environment, riskLevel, ownerName, onClick }: AgentCardProps) {
  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display font-semibold text-text-primary">{name}</p>
            <p className="text-xs text-text-muted capitalize">{agentType.replace("_", " ")}</p>
          </div>
        </div>
        {riskLevel && <RiskIndicator level={riskLevel} />}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusIndicator label={status} tone={statusTone[status]} />
        <Badge variant="outline" className="capitalize">
          {environment}
        </Badge>
      </div>
      {ownerName && <p className="mt-3 text-xs text-text-muted">Owner: {ownerName}</p>}
    </Card>
  );
}
