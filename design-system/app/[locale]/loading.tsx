/**
 * Automatic Next.js loading UI for every route under [locale]. Shown
 * while a route segment's async Server Components (data fetching) are
 * in flight, so navigation always shows visible progress instead of a
 * blank/frozen tab. Pure CSS animation — globals.css already disables
 * all animations under prefers-reduced-motion, so this needs no manual
 * motion-reduce handling.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 px-4 py-24"
    >
      <div className="relative flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-border border-t-primary" />
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <polygon
            points="16,2 26,6.4 26,16.5 16,30 6,16.5 6,6.4"
            fill="var(--color-primary)"
            stroke="var(--color-accent)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polyline
            points="10.8,16.2 14.3,19.7 21.4,12.2"
            fill="none"
            stroke="#ffffff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="sr-only">Loading</span>
    </div>
  );
}
