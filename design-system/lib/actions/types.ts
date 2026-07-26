/**
 * Common shape every Server Action in lib/actions returns, so every
 * client-side form component can share one result-handling branch
 * instead of each form inventing its own success/error shape.
 */
export type ActionResult<T = undefined> =
  | { status: "success"; data?: T }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

export function actionError(message: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { status: "error", message, fieldErrors };
}

export function actionSuccess<T>(data?: T): ActionResult<T> {
  return { status: "success", data };
}
