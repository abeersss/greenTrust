"use client";

import * as React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface AssessmentOption {
  id: string;
  label: string;
}

export interface AssessmentQuestionProps {
  id: string;
  prompt: string;
  helpText?: string;
  options: AssessmentOption[];
  /** 'single' -> radio group (one answer); 'multiple' -> checkboxes */
  mode: "single" | "multiple";
  value: string | string[];
  onChange: (value: string | string[]) => void;
  className?: string;
}

/**
 * AssessmentQuestion — one question in the GreenTrust/Quantum/Labs
 * assessment flows (Phase 3: tool_submissions.inputs is built up from
 * a sequence of these). Deliberately plain form controls, not custom
 * "card select" widgets, so keyboard and screen-reader behavior is the
 * native, well-tested browser behavior rather than something this
 * design system has to reinvent and re-test for accessibility.
 */
export function AssessmentQuestion({ id, prompt, helpText, options, mode, value, onChange, className }: AssessmentQuestionProps) {
  return (
    <fieldset className={cn("flex flex-col gap-3", className)}>
      <legend className="font-display text-lg font-semibold text-text-primary">{prompt}</legend>
      {helpText && <p className="-mt-2 text-sm text-text-muted">{helpText}</p>}

      {mode === "single" ? (
        <RadioGroup value={value as string} onValueChange={onChange}>
          {options.map((option) => (
            <div key={option.id} className="flex items-center gap-2.5">
              <RadioGroupItem value={option.id} id={`${id}-${option.id}`} />
              <Label htmlFor={`${id}-${option.id}`} className="font-normal">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      ) : (
        <div className="flex flex-col gap-2.5">
          {options.map((option) => {
            const selected = Array.isArray(value) && value.includes(option.id);
            return (
              <div key={option.id} className="flex items-center gap-2.5">
                <Checkbox
                  id={`${id}-${option.id}`}
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    onChange(checked ? [...current, option.id] : current.filter((v) => v !== option.id));
                  }}
                />
                <Label htmlFor={`${id}-${option.id}`} className="font-normal">
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      )}
    </fieldset>
  );
}
