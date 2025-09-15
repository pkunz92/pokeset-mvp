// lib/airtable.ts
export type AirtableRecord<T extends Record<string, any> = Record<string, any>> = {
  id: string;
  fields: T;
};

const BASE = process.env.AIRTABLE_BASE_ID!;
const TOKEN = process.env.AIRTABLE_API_TOKEN!;

function urlFor(table: string, params?: Record<string, string>) {
  const q = new URLSearchParams(params || {}).toString();
  return `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}${q ? `?${q}` : ''}`;
}

async function atFetch(input: RequestInfo, init?: RequestInit) {
  if (!BASE || !TOKEN) throw new Error('Airtable env not configured');
  const res = await fetch(input, {
    ...(init || {}),
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`Airtable error ${res.status}: ${t}`);
  }
  return res.json();
}

export async function getAll<T extends Record<string, any>>(
  table: string,
  view?: string
): Promise<AirtableRecord<T>[]> {
  let out: AirtableRecord<T>[] = [];
  let offset: string | undefined = undefined;
  do {
    const params: Record<string, string> = {};
    if (view) params['view'] = view;
    if (offset) params['offset'] = offset;
    const data = await atFetch(urlFor(table, params));
    out = out.concat((data.records as AirtableRecord<T>[]) || []);
    offset = (data as any).offset;
  } while (offset);
  return out;
}

export async function createOne<T extends Record<string, any>>(table: string, fields: any) {
  const data = await atFetch(urlFor(table), {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });
  return data as AirtableRecord<T>;
}

export async function updateOne<T extends Record<string, any>>(
  table: string,
  id: string,
  fields: any
) {
  const data = await atFetch(urlFor(table), {
    method: 'PATCH',
    body: JSON.stringify({ records: [{ id, fields }] }),
  });
  const rec = (data as any).records?.[0];
  if (!rec) throw new Error('Airtable: record not returned');
  return rec as AirtableRecord<T>;
}

export async function deleteOne(table: string, id: string) {
  // Airtable supports DELETE with records[]=... in query string
  return atFetch(urlFor(table, { 'records[]': id }), { method: 'DELETE' });
}
