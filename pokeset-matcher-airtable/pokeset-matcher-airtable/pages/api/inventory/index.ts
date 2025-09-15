
import type { NextApiRequest, NextApiResponse } from 'next'
import { getAll, createOne } from '../../../lib/airtable'

type Inv = {
  id?: string
  set_name: string
  set_code: string
  card_number: string
  name: string
  finish: string
  language: string
  condition: string
  price: number
  qty: number
  fictitious: boolean
}

const TABLE = process.env.AIRTABLE_INVENTORY_TABLE || 'inventory'
const VIEW = process.env.AIRTABLE_INVENTORY_VIEW || ''

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const recs = await getAll<Inv>(TABLE, VIEW || undefined)
      const items = recs.map(r => ({ recordId: r.id, ...r.fields }))
      return res.status(200).json(items)
    }
    if (req.method === 'POST') {
      const body = req.body || {}
      // derive id if not provided
      const id = body.id || [body.set_code, body.card_number, (body.language||'').toUpperCase(), (body.finish||'').toLowerCase()].filter(Boolean).join('-')
      const fields = { ...body, id }
      const rec = await createOne<Inv>(TABLE, fields)
      return res.status(201).json({ recordId: rec.id, ...rec.fields })
    }
    res.setHeader('Allow', 'GET,POST')
    return res.status(405).end()
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) })
  }
}
