export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  const jsonLdPayload = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data,
      }
    : {
        '@context': 'https://schema.org',
        ...data,
      };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPayload) }}
    />
  );
}
