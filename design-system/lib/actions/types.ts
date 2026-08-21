/**
 * Common shape every Server Action in lib/actions returns, so every
 * client-side form component can share one result-handling branch
 * instead of each form inventing its own success/error shape.
 */
export type ActionResult<T = undefined> =
    | { status: "success"; data?: T }
  | {
          status: "error";
          message: string;
          fieldErrors?: Record<string, string[]>;
          /**
           * Seconds the caller should wait before retrying, when the error is a
           * cooldown rather than a permanent failure (e.g. Supabase's built-in
           * confirmation-email resend limit). Forms use this to disable the
           * submit button and show a live countdown instead of leaving it
           * clickable to immediately re-trigger the same cooldown.
           */
        retryAfterSeconds?: number;
  };

export function actionError(
    message: string,
    fieldErrors?: Record<string, string[]>,
    retryAfterSeconds?: number
  ): ActionResult<never> {
    return { status: "error", message, fieldErrors, retryAfterSeconds };
}

export function actionSuccess<T>(data?: T): ActionResult<T> {
    return { status: "success", data };
}
