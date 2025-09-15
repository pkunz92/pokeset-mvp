
export type AirtableRecord<T> = { id: string; fields: T }
const BASE = process.env.AIRTABLE_BASE_ID!
const TOKEN = process.env.AIRTABLE_API_TOKEN!
function urlFor(table: string, params?: Record<string,string>) {
  const q = new URLSearchParams(params||{}).toString()
  return `https://api.airtable.com/v0/${BASE}/${encodeURIComponent(table)}${q?`?${q}`:''}`
}
async function atFetch(input: RequestInfo, init?: RequestInit) {
  if (!BASE || !TOKEN) throw new Error('Airtable env not configured')
  const res = await fetch(input, {
    ...(init||{}),
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers||{})
    },
    cache: 'no-store'
  })
  if (!res.ok) {
    const t = await res.text().catch(()=> '')
    throw new Error(`Airtable error ${res.status}: ${t}`)
  }
  return res.json()
}
export async function getAll<T>(table: string, view?: string): Promise<AirtableRecord<T>[]> {
  let out: AirtableRecord<T>[] = []
  let offset: string|undefined = undefined
  do {
    const params: Record<string,string> = {}
    if (view) params['view'] = view
    if (offset) params['offset'] = offset
    const data = await atFetch(urlFor(table, params))
    out = out.concat(data.records as AirtableRecord<T>[])
    offset = data.offset
  } while (offset)
  return out
}
export async function createOne<T>(table: string, fields: any) {
  const data = await atFetch(urlFor(table), { method: 'POST', body: JSON.stringify({ fields }) })
  return data as AirtableRecord<T>
}
export async function updateOne<T>(table: string, id: string, fields: any) {
  const data = await atFetch(urlFor(table), { method: 'PATCH', body: JSON.stringify({ records: [{ id, fields }] }) })
  const rec = (data.records && data.records[0]) || null
  return rec as AirtableRecord<T>
}
export async function deleteOne(table: string, id: string) {
  const data = await atFetch(urlFor(table, { 'records[]': id }), { method: 'DELETE' })
  return data
}
