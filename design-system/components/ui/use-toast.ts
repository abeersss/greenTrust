"use client";

import * as React from "react";
import type { ToastProps } from "./toast";

/**
 * Minimal toast state manager (shadcn pattern): a module-level store so
 * `toast()` can be called from anywhere (server action callbacks,
 * event handlers) without prop-drilling, while React components
 * subscribe via the `useToast` hook to re-render when the list changes.
 */
const TOAST_LIMIT = 3;
const TOAST_REMOVE_DELAY = 5000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type State = { toasts: ToasterToast[] };
const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: { type: "ADD" | "REMOVE"; toast?: ToasterToast; id?: string }) {
  if (action.type === "ADD" && action.toast) {
    memoryState = { toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
  }
  if (action.type === "REMOVE") {
    memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.id) };
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  dispatch({ type: "ADD", toast: { ...props, id } });
  window.setTimeout(() => dispatch({ type: "REMOVE", id }), TOAST_REMOVE_DELAY);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);
  return { toasts: state.toasts, toast };
}
