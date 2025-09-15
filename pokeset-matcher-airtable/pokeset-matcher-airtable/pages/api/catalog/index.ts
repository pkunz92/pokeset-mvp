
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAll, createOne } from '../../../lib/airtable'

type Cat = {
  set_name: string
  set_code: string
  card_number: string
  name: string
  finishes: string[]
  languages: string[]
}

const TABLE = process.env.AIRTABLE_CATALOG_TABLE || 'catalog'
const VIEW = process.env.AIRTABLE_CATALOG_VIEW || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const recs = await getAll<Cat>(TABLE, VIEW || undefined)
      const items = recs.map(r => ({ recordId: r.id, ...r.fields }))
      return res.status(200).json(items)
    }
    if (req.method === 'POST') {
      const body = req.body || {}
      const rec = await createOne<Cat>(TABLE, body)
      return res.status(201).json({ recordId: rec.id, ...rec.fields })
    }
    res.setHeader('Allow', 'GET,POST')
    return res.status(405).end()
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) })
  }
}
