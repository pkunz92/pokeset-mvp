
import { useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import Papa from 'papaparse'

type CatalogCard = {
  recordId?: string
  set_name: string
  set_code: string
  card_number: string
  name: string
  finishes: string[]
  languages: string[]
}
type InventoryItem = {
  recordId?: string
  id: string
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

type WantRow = {
  set_name?: string
  set_code?: string
  language?: string
  card_number?: string
  card_name?: string
  finish?: string
  quantity?: number
  max_price?: number
  min_condition?: string
  notes?: string
}

type MatchStatus = 'available' | 'unavailable' | 'not_found' | 'format_error' | 'over_budget'

type MatchResult = {
  row: WantRow
  key: string
  catalog?: CatalogCard
  inventory?: InventoryItem
  status: MatchStatus
  reasons?: string[]
  searchLinks?: { label: string, url: string }[]
}

function norm(s?: string) { return (s || '').trim().toLowerCase() }
function normalizeFinish(s?: string) {
  const v = norm(s)
  if (['rev','reverse','reverseholo','reverse-holo','reverse_holo'].includes(v)) return 'reverse'
  if (['holo','holofoil','foil'].includes(v)) return 'holo'
  if (['normal','non-holo','nonholo','base'].includes(v) || !v) return 'normal'
  return v
}
function validateRow(row: WantRow): { ok: boolean, reasons: string[] } {
  const reasons: string[] = []
  if (!row.card_number && !row.card_name) reasons.push('card_number oder card_name erforderlich')
  if (!row.set_name && !row.set_code) reasons.push('set_name oder set_code erforderlich')
  if (row.quantity !== undefined && row.quantity! <= 0) reasons.push('quantity muss > 0 sein')
  const finish = normalizeFinish(row.finish)
  if (finish && !['normal','reverse','holo','any'].includes(finish)) reasons.push(`unbekanntes finish: ${row.finish}`)
  return { ok: reasons.length === 0, reasons }
}
function buildSearchLinks(card: CatalogCard, row: WantRow) {
  const q = `${card.name} ${card.set_name} ${row.language || ''}`.trim()
  return [
    { label: 'Cardmarket', url: `https://www.cardmarket.com/en/Pokemon/Products/Singles?searchString=${encodeURIComponent(q)}` },
    { label: 'eBay', url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}` },
    { label: 'TCGplayer', url: `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(q)}` },
  ]
}

export default function Home() {
  const [tab, setTab] = useState<'browse'|'match'>('match')
  const [catalog, setCatalog] = useState<CatalogCard[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [paste, setPaste] = useState<string>('')
  const [results, setResults] = useState<MatchResult[]|null>(null)
  const fileRef = useRef<HTMLInputElement|null>(null)
  const [orderCard, setOrderCard] = useState<{ res: MatchResult }|null>(null)
  const [orderEmail, setOrderEmail] = useState('')
  const [orderBudget, setOrderBudget] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  useEffect(() => {
    const load = async () => {
      const [c, i] = await Promise.all([
        fetch('/api/catalog').then(r=>r.json()).catch(()=>[]),
        fetch('/api/inventory').then(r=>r.json()).catch(()=>[])
      ])
      setCatalog(c || [])
      setInventory(i || [])
    }
    load()
  }, [])

  const inStock = useMemo(() => inventory.filter(i => i.qty > 0), [inventory])

  function parseCSV(file: File): Promise<WantRow[]> {
    return new Promise((resolve, reject) => {
      Papa.parse<WantRow>(file, { header: true, skipEmptyLines: true,
        complete: (res) => resolve(res.data), error: (err) => reject(err) })
    })
  }
  function parsePaste(text: string): WantRow[] {
    const rows: WantRow[] = []
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 1) {
        const row: WantRow = {}
        if (/^\d+/.test(parts[0])) row.card_number = parts[0]
        if (parts[1]) row.card_name = parts[1]
        if (parts[2]) row.finish = parts[2]
        if (parts[3]) row.quantity = Number(parts[3]) || 1
        if (parts[4]) row.max_price = Number(parts[4]) || undefined
        rows.push(row)
      }
    }
    return rows
  }
  function findCatalogMatch(row: WantRow): CatalogCard|undefined {
    const setName = norm(row.set_name)
    const setCode = norm(row.set_code)
    const cardNum = (row.card_number || '').trim()
    const bySet = (c: CatalogCard) => (setName ? norm(c.set_name) === setName : true) && (setCode ? norm(c.set_code) === setCode : true)
    let found = catalog.find(c => bySet(c) && c.card_number === cardNum)
    if (!found && row.card_name) {
      const n = norm(row.card_name)
      found = catalog.find(c => bySet(c) && norm(c.name) === n)
    }
    return found
  }
  function findInventoryMatch(card: CatalogCard, row: WantRow): InventoryItem|undefined {
    const finish = normalizeFinish(row.finish)
    const lang = (row.language || 'EN').toUpperCase()
    const inv = inventory.filter(i => i.set_code === card.set_code && i.card_number === card.card_number)
    const exact = inv.find(i => i.finish === (finish === 'any' ? i.finish : finish) && i.language.toUpperCase() === lang && i.qty > 0)
    if (exact) return exact
    const any = inv.find(i => i.qty > 0)
    return any
  }
  function matchRows(input: WantRow[]) {
    const normalized = input.map(r => ({
      ...r,
      set_name: r.set_name || undefined,
      set_code: r.set_code || undefined,
      card_name: r.card_name || undefined,
      finish: normalizeFinish(r.finish),
      language: (r.language || 'EN').toUpperCase(),
      quantity: r.quantity || 1,
      min_condition: r.min_condition || 'NM/M'
    }))
    const out: MatchResult[] = []
    for (const row of normalized) {
      const val = validateRow(row)
      const key = `${row.set_code || row.set_name || ''}-${row.card_number || row.card_name || ''}-${row.language}-${row.finish}`
      if (!val.ok) { out.push({ row, key, status: 'format_error', reasons: val.reasons }); continue }
      const cat = findCatalogMatch(row)
      if (!cat) { out.push({ row, key, status: 'not_found', reasons: ['nicht im Katalog gefunden (Set/Nummer/Name prüfen)'] }); continue }
      const inv = findInventoryMatch(cat, row)
      if (inv && inv.qty > 0) {
        if (row.max_price && inv.price > row.max_price) {
          out.push({ row, key, catalog: cat, inventory: inv, status: 'over_budget', reasons: [`Preis ${inv.price} > max_price ${row.max_price}`] })
        } else {
          out.push({ row, key, catalog: cat, inventory: inv, status: 'available' })
        }
      } else {
        out.push({ row, key, catalog: cat, status: 'unavailable', searchLinks: buildSearchLinks(cat, row) })
      }
    }
    return out
  }
  function handleMatch() {
    setResults(null)
    setTimeout(() => {
      const pastedRows = parsePaste(paste)
      setResults(matchRows(pastedRows))
    }, 10)
  }
  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const rows = await parseCSV(file); setResults(matchRows(rows))
  }
  function proposedCart(results: MatchResult[]) {
    const avail = results.filter(r => r.status === 'available' && r.inventory)
    const items = avail.map(r => ({
      id: r.inventory!.id,
      name: r.inventory!.name,
      set: r.inventory!.set_name,
      number: r.inventory!.card_number,
      finish: r.inventory!.finish,
      lang: r.inventory!.language,
      price: r.inventory!.price,
      qty: r.row.quantity || 1
    }))
    const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0)
    return { items, subtotal }
  }
  async function submitOrder() {
    if (!orderCard || !orderEmail) return alert('Email fehlt')
    const r = orderCard.res
    const payload = {
      email: orderEmail,
      max_price: Number(orderBudget)||undefined,
      notes: orderNotes,
      requested_qty: r.row.quantity || 1,
      language: r.row.language || 'EN',
      finish: r.row.finish || 'any',
      condition: r.row.min_condition || 'NM/M',
      set_name: r.catalog?.set_name || r.row.set_name || '',
      set_code: r.catalog?.set_code || r.row.set_code || '',
      card_number: r.catalog?.card_number || r.row.card_number || '',
      card_name: r.catalog?.name || r.row.card_name || '',
      source: 'matcher_mvp'
    }
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)})
    if (res.ok) {
      setOrderCard(null); setOrderEmail(''); setOrderBudget(''); setOrderNotes('')
      alert('Anfrage gesendet! Wir melden uns mit einem Quote.')
    } else {
      const t = await res.json().catch(()=>({}))
      alert('Fehler: '+(t.error||res.status))
    }
  }

  const cart = results ? proposedCart(results) : null

  return (
    <div>
      <Head>
        <title>PokéSet — Want-List Matcher MVP (Airtable)</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="PokéSet" className="h-8" />
            <span className="font-bold">PokéSet</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a onClick={()=>setTab('browse')} className="hover:text-slate-900 cursor-pointer">Browse</a>
            <a onClick={()=>setTab('match')} className="hover:text-slate-900 cursor-pointer">Want-List</a>
          </nav>
          <a href="/pokeset_wantlist_template.csv" className="inline-flex items-center rounded-full px-4 py-2 border border-slate-300 hover:border-slate-400 text-sm">CSV template</a>
        </div>
      </header>

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex gap-2 mb-4">
            <button onClick={()=>setTab('match')} className={`px-4 py-2 rounded-xl border text-sm ${tab==='match'?'bg-ink text-white border-ink':'border-slate-300'}`}>Want-List</button>
            <button onClick={()=>setTab('browse')} className={`px-4 py-2 rounded-xl border text-sm ${tab==='browse'?'bg-ink text-white border-ink':'border-slate-300'}`}>Browse Inventory</button>
          </div>

          {tab==='browse' && (
            <div>
              <h2 className="text-2xl font-bold">Inventory</h2>
              <p className="text-sm text-slate-600 mb-4">Live aus Airtable geladen. Qty=0 = nicht verfügbar (z. B. Chase-Karten).</p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {inventory.map((it, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-sm text-slate-500">{it.set_name} • #{it.card_number}</div>
                    <div className="font-semibold mt-1">{it.name}</div>
                    <div className="text-sm mt-1">Finish: {it.finish.toUpperCase()} • Lang: {it.language} • Cond: {it.condition}</div>
                    <div className="text-sm mt-1">Preis: {it.price?.toFixed(2)} • Qty: {it.qty}</div>
                    {it.fictitious && <div className="inline-block text-xs mt-2 rounded bg-yellow-100 border border-yellow-300 px-2 py-0.5">fiktiv</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='match' && (
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold">Want-List hochladen</h2>
                <p className="text-sm text-slate-600 mt-1">Paste-Format: <code>number | name | finish | qty | max_price</code>. CSV: siehe Template.</p>
                <textarea value={paste} onChange={e=>setPaste(e.target.value)} rows={10} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="003 | Venusaur ex | holo | 1 | 30&#10;066 | Machop | reverse | 2 | 2" />
                <div className="mt-3 flex items-center gap-3">
                  <button onClick={handleMatch} className="rounded-xl px-5 py-3 border border-ink bg-ink text-white hover:opacity-90 text-sm">Match erstellen</button>
                  <input ref={fileRef} onChange={handleCSV} type="file" accept=".csv" className="text-sm" />
                </div>
                <div className="mt-3 text-xs text-slate-500">Set-Name optional in CSV. In Paste bitte vorab im Text nennen (z.B. „Set: SV 151 (EN)“), oder Spalte <code>set_name</code> nutzen.</div>
              </div>

              <div>
                <h2 className="text-2xl font-bold">Resultate</h2>
                {!results && <div className="text-sm text-slate-600 mt-2">Noch keine Resultate.</div>}
                {results && (
                  <div className="space-y-3">
                    {results.map((r, idx) => (
                      <div key={idx} className={`rounded-2xl border p-4 ${r.status==='available'?'border-green-300 bg-green-50': r.status==='unavailable'?'border-amber-300 bg-amber-50': r.status==='over_budget'?'border-amber-300 bg-amber-50': r.status==='format_error'?'border-rose-300 bg-rose-50':'border-slate-200 bg-white'}`}>
                        <div className="text-sm text-slate-500">{r.catalog?.set_name || r.row.set_name || '—'} • #{r.catalog?.card_number || r.row.card_number || '—'}</div>
                        <div className="font-semibold">{r.catalog?.name || r.row.card_name || 'Unbekannt'}</div>
                        <div className="text-sm mt-1">Finish: {(r.row.finish || 'any').toUpperCase()} • Lang: {r.row.language || 'EN'} • Qty: {r.row.quantity || 1}</div>
                        <div className="text-sm mt-1">Status: <strong>{r.status}</strong></div>
                        {r.inventory && <div className="text-sm mt-1">Angebot: {r.inventory.price?.toFixed(2)} • Lager: {r.inventory.qty}</div>}
                        {r.reasons && r.reasons.length>0 && <div className="text-sm mt-1">Hinweis: {r.reasons.join('; ')}</div>}
                        {r.status!=='available' && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {r.searchLinks?.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noreferrer" className="text-sm underline">{l.label}</a>)}
                            <button onClick={()=>setOrderCard({ res: r })} className="text-sm underline">Order for me</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {results && (
            <section className="mt-10">
              <h2 className="text-2xl font-bold">Proposed Cart</h2>
              {cart && cart.items.length>0 ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                  {cart.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="text-sm">
                        <div className="font-semibold">{it.name} <span className="text-slate-500">• {it.set} #{it.number}</span></div>
                        <div className="text-slate-600">Finish: {it.finish.toUpperCase()} • Lang: {it.lang}</div>
                      </div>
                      <div className="text-sm">{it.qty} × {it.price.toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="text-right font-bold mt-3">Subtotal: {cart.subtotal.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Hinweis: Kein Checkout im MVP. Dies dient zur Nachfragevalidierung.</div>
                </div>
              ) : (
                <div className="text-sm text-slate-600">Keine verfügbaren Artikel im vorgeschlagenen Warenkorb.</div>
              )}
            </section>
          )}
        </section>
      </main>

      {/* Order Modal */}
      {orderCard && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-lg">
            <div className="text-lg font-bold">Order for me</div>
            <div className="text-sm text-slate-600 mt-1">Wir sourcen die Karte(n) und melden uns mit einem Quote.</div>
            <div className="mt-3 text-sm">
              <div><strong>Karte:</strong> {(orderCard.res.catalog?.name || orderCard.res.row.card_name) || '—'}</div>
              <div><strong>Set:</strong> {(orderCard.res.catalog?.set_name || orderCard.res.row.set_name) || '—'} #{(orderCard.res.catalog?.card_number || orderCard.res.row.card_number) || '—'}</div>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mt-3">
              <label className="grid gap-1 text-sm"><span>Email</span><input value={orderEmail} onChange={e=>setOrderEmail(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="you@example.com" /></label>
              <label className="grid gap-1 text-sm"><span>Max Budget (optional)</span><input value={orderBudget} onChange={e=>setOrderBudget(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="z.B. 50" /></label>
            </div>
            <label className="grid gap-1 text-sm mt-3"><span>Notizen</span><textarea value={orderNotes} onChange={e=>setOrderNotes(e.target.value)} rows={3} className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Condition, Reverse/Holo ok, Händlerpräferenzen, ..."></textarea></label>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button onClick={()=>setOrderCard(null)} className="px-4 py-2 rounded-xl border border-slate-300">Abbrechen</button>
              <button onClick={submitOrder} className="px-4 py-2 rounded-xl border border-ink bg-ink text-white">Anfrage senden</button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PokéSet — Matcher MVP (Airtable).</div>
          <div className="flex items-center gap-4">
            <a href="/pokeset_wantlist_template.csv" className="underline">CSV template</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
