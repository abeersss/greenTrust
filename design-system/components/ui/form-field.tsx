import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactElement;
}

/**
 * FormField — the standard wrapper every text/select/textarea input
 * should be placed in. It wires up the accessibility relationships by
 * hand so individual pages never have to: htmlFor/id, aria-describedby
 * pointing at the hint and/or error, and aria-invalid on the control
 * itself (WCAG 2.2 SC 3.3.1 Error Identification, 3.3.2 Labels/
 * Instructions, 4.1.2 Name/Role/Value).
 */
export function FormField({ id, label, required, hint, error, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const control = React.cloneElement(children, {
    id,
    "aria-describedby": describedBy,
    "aria-invalid": Boolean(error) || undefined,
    invalid: Boolean(error) || undefined,
    required,
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {control}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
