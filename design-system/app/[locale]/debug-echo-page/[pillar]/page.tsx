export default async function DebugEchoPage({
  params,
}: {
  params: Promise<{ locale: string; pillar: string }>;
}) {
  const { locale, pillar } = await params;
  return (
    <pre style={{ whiteSpace: "pre-wrap", padding: 20 }}>
      {JSON.stringify(
        {
          locale,
          pillar,
          len: pillar.length,
          codePoints: [...pillar].map((c) => c.codePointAt(0)),
        },
        null,
        2
      )}
    </pre>
  );
}
