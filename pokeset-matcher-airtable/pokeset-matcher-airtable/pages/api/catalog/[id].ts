
import type { NextApiRequest, NextApiResponse } from 'next'
import { updateOne, deleteOne } from '../../../lib/airtable'

const TABLE = process.env.AIRTABLE_CATALOG_TABLE || 'catalog'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing record id' })
  try {
    if (req.method === 'PATCH') {
      const fields = req.body || {};
      const rec = await updateOne(TABLE, id, fields);
      return res.status(200).json({ recordId: rec.id, ...rec.fields }); // OK nach Schritt 1
    }
    if (req.method === 'DELETE') {
      await deleteOne(TABLE, id)
      return res.status(204).end()
    }
    res.setHeader('Allow', 'PATCH,DELETE')
    return res.status(405).end()
  } catch (e: any) {
    return res.status(500).json({ error: e.message || String(e) })
  }
}
