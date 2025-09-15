
import type { NextApiRequest, NextApiResponse } from 'next'
import { createOne } from '../../lib/airtable'

const TABLE = process.env.AIRTABLE_ORDERS_TABLE || 'orders'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST'); return res.status(405).end()
  }
  try {
    const body = req.body || {}
    if (!body.email) return res.status(400).json({ error: 'email required' })
    const rec = await createOne(TABLE, {
      ...body,
      created_at: new Date().toISOString(),
      status: body.status || 'requested'
    })
    return res.status(201).json({ recordId: rec.id, ok: true })
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) })
  }
}
