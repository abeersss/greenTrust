/**
 * Renders one or more JSON-LD objects as <script type="application/ld+json">
 * tags. Server Component (no "use client"): this never needs
 * interactivity, and rendering it on the server means the structured
 * data is present in the initial HTML for crawlers that don't execute
 * JavaScript.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        // eslint-disable-next-line react/no-danger
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
