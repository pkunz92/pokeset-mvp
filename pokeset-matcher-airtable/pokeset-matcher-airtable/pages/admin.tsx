
import { useEffect, useMemo, useState } from 'react'
import Head from 'next/head'

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

type CatalogCard = {
  recordId?: string
  set_name: string
  set_code: string
  card_number: string
  name: string
  finishes: string[]
  languages: string[]
}

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  useEffect(() => { if (localStorage.getItem('pokeset_admin_ok')==='1') setAuthed(true) }, [])
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY || 'pokeset-admin'
  function tryLogin(){ if (pw===adminKey){ localStorage.setItem('pokeset_admin_ok','1'); setAuthed(true)} else alert('Passwort falsch') }

  const [tab, setTab] = useState<'inventory'|'catalog'>('inventory')
  const [inv, setInv] = useState<InventoryItem[]>([])
  const [cat, setCat] = useState<CatalogCard[]>([])
  const [filter, setFilter] = useState('')

  async function refreshAll(){
    const [i,c] = await Promise.all([ fetch('/api/inventory').then(r=>r.json()), fetch('/api/catalog').then(r=>r.json()) ])
    setInv(i||[]); setCat(c||[])
  }
  useEffect(()=>{ refreshAll() }, [])

  async function updateInv(row: InventoryItem){
    if (!row.recordId) return alert('Missing recordId')
    const res = await fetch('/api/inventory/'+row.recordId, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(row) })
    if(!res.ok) alert('Fehler beim Speichern')
  }
  async function addInv(){
    const base: Partial<InventoryItem> = { set_name:'', set_code:'', card_number:'', name:'', finish:'normal', language:'EN', condition:'NM/M', price:0, qty:0, fictitious:false }
    const res = await fetch('/api/inventory', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(base) })
    if (res.ok) refreshAll()
  }
  async function delInv(id?: string){
    if (!id) return
    await fetch('/api/inventory/'+id, { method:'DELETE' }); refreshAll()
  }

  async function updateCat(row: CatalogCard){
    if (!row.recordId) return alert('Missing recordId')
    const res = await fetch('/api/catalog/'+row.recordId, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify(row) })
    if(!res.ok) alert('Fehler beim Speichern')
  }
  async function addCat(){
    const base: Partial<CatalogCard> = { set_name:'', set_code:'', card_number:'', name:'', finishes:['normal','reverse','holo'], languages:['EN','DE'] }
    const res = await fetch('/api/catalog', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(base) })
    if (res.ok) refreshAll()
  }
  async function delCat(id?: string){ if (!id) return; await fetch('/api/catalog/'+id, { method:'DELETE' }); refreshAll() }

  const invFiltered = useMemo(()=>{
    const q = filter.trim().toLowerCase()
    if(!q) return inv
    return inv.filter(i => (i.name+' '+i.set_name+' '+i.card_number+' '+i.language).toLowerCase().includes(q))
  }, [filter, inv])

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 w-full max-w-sm">
          <h1 className="text-xl font-bold">Admin Login</h1>
          <p className="text-sm text-slate-600 mt-1">Passwort eingeben, um den Editor zu öffnen.</p>
          <input type="password" value={pw} onChange={e=>setPw(e.target.value)} className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2" placeholder="Admin Passwort" />
          <button onClick={tryLogin} className="mt-3 w-full rounded-lg border border-ink bg-ink text-white px-4 py-2">Login</button>
          <div className="text-xs text-slate-500 mt-2">Setze <code>NEXT_PUBLIC_ADMIN_KEY</code> in Vercel (Default: <code>pokeset-admin</code>).</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Head><title>PokéSet — Admin</title></Head>
      <header className="border-b border-slate-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="font-bold">PokéSet Admin</div>
          <nav className="flex items-center gap-2 text-sm">
            <button onClick={()=>setTab('inventory')} className={`px-3 py-1.5 rounded-xl border ${tab==='inventory'?'bg-ink text-white border-ink':'border-slate-300'}`}>Inventory</button>
            <button onClick={()=>setTab('catalog')} className={`px-3 py-1.5 rounded-xl border ${tab==='catalog'?'bg-ink text-white border-ink':'border-slate-300'}`}>Catalog</button>
            <button onClick={refreshAll} className="px-3 py-1.5 rounded-xl border border-slate-300">Refresh</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab==='inventory' && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Inventory Editor</h2>
              <div className="flex gap-2">
                <button onClick={addInv} className="px-3 py-1.5 rounded-xl border border-slate-300">+ Row</button>
              </div>
            </div>
            <div className="mt-3">
              <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter (Name/Set/Nummer)" className="rounded-lg border border-slate-300 px-3 py-2 w-full md:w-80" />
            </div>
            <div className="mt-4 overflow-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['recordId','set_code','card_number','language','finish','name','set_name','condition','price','qty','fictitious',''].map(h=> <th key={h} className="text-left px-3 py-2 border-b">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {invFiltered.map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-2">{row.recordId}</td>
                      {(['set_code','card_number','language','finish','name','set_name','condition'] as const).map((f)=>(
                        <td key={f} className="px-3 py-1.5"><input value={(row as any)[f]||''} onChange={e=>setInv(inv.map((r,idx)=> idx===i?({...r,[f]:e.target.value} as any):r))} onBlur={()=>updateInv(inv[i])} className="border rounded px-2 py-1 w-36" /></td>
                      ))}
                      <td className="px-3 py-1.5"><input type="number" value={row.price||0} onChange={e=>setInv(inv.map((r,idx)=> idx===i?({...r,price:Number(e.target.value)}):r))} onBlur={()=>updateInv(inv[i])} className="border rounded px-2 py-1 w-24" /></td>
                      <td className="px-3 py-1.5"><input type="number" value={row.qty||0} onChange={e=>setInv(inv.map((r,idx)=> idx===i?({...r,qty:Number(e.target.value)}):r))} onBlur={()=>updateInv(inv[i])} className="border rounded px-2 py-1 w-24" /></td>
                      <td className="px-3 py-1.5"><input type="checkbox" checked={!!row.fictitious} onChange={e=>{ const next = inv.map((r,idx)=> idx===i?({...r,fictitious:e.target.checked}):r); setInv(next); updateInv(next[i]) }} /></td>
                      <td className="px-3 py-1.5"><button onClick={()=>delInv(row.recordId)} className="text-rose-600 underline">delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab==='catalog' && (
          <section>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Catalog Editor</h2>
              <div className="flex gap-2"><button onClick={addCat} className="px-3 py-1.5 rounded-xl border border-slate-300">+ Row</button></div>
            </div>
            <div className="mt-4 overflow-auto border border-slate-200 rounded-2xl">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {['recordId','set_code','card_number','name','set_name','finishes','languages',''].map(h=> <th key={h} className="text-left px-3 py-2 border-b">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {cat.map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-slate-50">
                      <td className="px-3 py-2">{row.recordId}</td>
                      {(['set_code','card_number','name','set_name'] as const).map((f)=>(
                        <td key={f} className="px-3 py-1.5"><input value={(row as any)[f]||''} onChange={e=>setCat(cat.map((r,idx)=> idx===i?({...r,[f]:e.target.value} as any):r))} onBlur={()=>updateCat(cat[i])} className="border rounded px-2 py-1 w-40" /></td>
                      ))}
                      <td className="px-3 py-1.5"><input value={(row.finishes||[]).join(',')} onChange={e=>setCat(cat.map((r,idx)=> idx===i?({...r,finishes:e.target.value.split(',').map(s=>s.trim())}):r))} onBlur={()=>updateCat(cat[i])} className="border rounded px-2 py-1 w-44" /></td>
                      <td className="px-3 py-1.5"><input value={(row.languages||[]).join(',')} onChange={e=>setCat(cat.map((r,idx)=> idx===i?({...r,languages:e.target.value.split(',').map(s=>s.trim().toUpperCase())}):r))} onBlur={()=>updateCat(cat[i])} className="border rounded px-2 py-1 w-40" /></td>
                      <td className="px-3 py-1.5"><button onClick={()=>delCat(row.recordId)} className="text-rose-600 underline">delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
