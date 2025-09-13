import { useState } from 'react'
import Head from 'next/head'

export default function Home() {
  const AIRTABLE_EMBED_URL = "https://airtable.com/embed/appZqZ2f6K4bI65GJ/shrL5GFhFj91koIQB";

  const [useAirtable, setUseAirtable] = useState(true)
  const [copied, setCopied] = useState(false)

  const example = `
Set: Scarlet & Violet 151 (English)
Budget: 120 CHF
Condition: NM/M only
Notes: Prefer centered cards; reverse holos welcome

Want-list (number | name | finish | qty | max_price)
003 | Venusaur ex | holo | 1 | 30
006 | Charizard ex | holo | 1 | 55
009 | Blastoise | holo | 1 | 25
066 | Machop | reverse | 2 | 2
094 | Gengar | holo | 1 | 28
  `.trim()

  const copy = async () => {
    try { await navigator.clipboard.writeText(example); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  return (
    <div>
      <Head>
        <title>PokéSet — Set completion made easy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Paste your want-list. We source the best options and send you one simple checkout." />
      </Head>

      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="PokéSet" className="h-8" />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#how" className="hover:text-slate-900">How it works</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#form" className="hover:text-slate-900">Start now</a>
          </nav>
          <a href="#form" className="inline-flex items-center rounded-full px-4 py-2 border border-slate-300 hover:border-slate-400 text-sm">Get a quote</a>
        </div>
      </header>

      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-800">
        <section className="mx-auto max-w-6xl px-4 pt-14 pb-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                Complete your Pokémon sets <span className="bg-brand-200 rounded px-2">without the hassle</span>
              </h1>
              <p className="mt-4 text-slate-600 text-lg">
                Paste your want-list. We source the best options across trusted marketplaces and send you a single, easy checkout.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#form" className="rounded-xl px-5 py-3 border border-ink bg-ink text-white hover:opacity-90 text-sm">Get a free quote</a>
                <a href="#how" className="rounded-xl px-5 py-3 border border-slate-300 text-slate-800 hover:border-slate-400 text-sm">See how it works</a>
              </div>
              <div className="mt-4 text-xs text-slate-500">No account needed • Typical quotes in under 24h • EU/CH friendly</div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 shadow-sm p-5 bg-white">
                <div className="text-sm text-slate-500">Example want-list</div>
                <pre className="mt-2 text-xs md:text-sm bg-slate-50 rounded p-3 overflow-auto border border-slate-200">{example}</pre>
                <button onClick={copy} className="mt-3 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm hover:border-slate-400">{copied ? 'Copied ✓' : 'Copy example'}</button>
                <div className="mt-3 text-xs text-slate-500">Or download CSV template below.</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-4">
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {title: 'Manual QA', desc: 'We hand-check condition & centering.'},
              {title: 'Best-price match', desc: 'We search Cardmarket, eBay, TCGPlayer.'},
              {title: 'Easy checkout', desc: 'One cart, optional booster add-on.'},
            ].map((f, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 p-4 bg-white">
                <div className="font-semibold">{f.title}</div>
                <div className="text-sm text-slate-600 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-4 grid md:grid-cols-3 gap-4 list-decimal list-inside">
            <li className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">Send your want-list</div>
              <p className="text-sm text-slate-600 mt-1">Paste text or upload CSV. Tell us budget, language, and condition.</p>
            </li>
            <li className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">We source & QA</div>
              <p className="text-sm text-slate-600 mt-1">We find the best options and check images/condition where available.</p>
            </li>
            <li className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">One-click checkout</div>
              <p className="text-sm text-slate-600 mt-1">Approve the quote and pay in one go. Optional booster pack add-on.</p>
            </li>
          </ol>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-2xl font-bold">Pricing (MVP)</h2>
          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="font-semibold">Finder fee</div>
              <div className="text-3xl font-extrabold mt-2">8–12%</div>
              <div className="text-sm text-slate-600 mt-1">of sourced card value (min 5 CHF)</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="font-semibold">Shipping at cost</div>
              <div className="text-3xl font-extrabold mt-2">Pass-through</div>
              <div className="text-sm text-slate-600 mt-1">Tracked options available for CH/EU</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6 bg-white">
              <div className="font-semibold">Optional add-on</div>
              <div className="text-3xl font-extrabold mt-2">Booster</div>
              <div className="text-sm text-slate-600 mt-1">Add a fun pack to your order</div>
            </div>
          </div>
        </section>

        <section id="form" className="mx-auto max-w-3xl px-4 py-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">Start now — get a free quote</h2>
            <p className="text-sm text-slate-600 mt-1">We’ll email you within 24 hours with a sourcing plan. No commitment.</p>

            <div className="mt-4 flex items-center gap-3 text-sm">
            {useAirtable && !AIRTABLE_EMBED_URL && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                Airtable is embedded below.
              </div>
            )}

              <input id="toggle" type="checkbox" className="h-4 w-4" checked={useAirtable} onChange={() => setUseAirtable(!useAirtable)} />
              <label htmlFor="toggle">Use Airtable form (auto-database)</label>
            </div>

            {useAirtable ? (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                <iframe
                  src={AIRTABLE_EMBED_URL}
                  className="w-full h-[900px]"
                  title="PokéSet Airtable Form"
                ></iframe>
                <div className="p-3 text-xs text-slate-500">Tip: In Airtable, create fields matching the CSV columns to keep data clean.</div>
              </div>
            ) : (
              <form className="mt-6 grid gap-4" method="POST" action="https://formsubmit.co/YOUR_EMAIL_HERE" encType="multipart/form-data">
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_subject" value="New PokéSet quote request" />
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Your name</span>
                    <input required name="name" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="Ash K." />
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Email</span>
                    <input required type="email" name="email" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="you@example.com" />
                  </label>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Region</span>
                    <select name="region" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                      <option>Switzerland</option><option>EU</option><option>UK</option><option>US/Canada</option><option>Other</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Language</span>
                    <select name="language" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                      <option>English</option><option>German</option><option>French</option><option>Italian</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Budget (CHF/EUR/USD)</span>
                    <input name="budget" type="number" min="0" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="e.g., 150" />
                  </label>
                </div>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Set(s)</span>
                  <input name="sets" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="e.g., SV 151 (EN), Obsidian Flames (EN)" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Condition preference</span>
                  <select name="condition" className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300">
                    <option>Near Mint / Mint</option><option>Lightly Played or better</option><option>Any playable</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Paste your want-list</span>
                  <textarea name="wantlist" rows={6} className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="number | name | finish | qty | max_price&#10;003 | Venusaur ex | holo | 1 | 30&#10;006 | Charizard ex | holo | 1 | 55"></textarea>
                </label>
                <div className="grid md:grid-cols-2 gap-4 items-start">
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Or upload CSV</span>
                    <input name="file" type="file" accept=".csv" className="rounded-lg border border-slate-300 px-3 py-2" />
                    <span className="text-xs text-slate-500">Use our template: <a href="/pokeset_wantlist_template.csv" className="underline">pokeset_wantlist_template.csv</a></span>
                  </label>
                  <label className="grid gap-1 text-sm">
                    <span className="font-medium">Extras</span>
                    <div className="flex items-center gap-2">
                      <input id="reverseOk" name="reverse_ok" type="checkbox" className="h-4 w-4" />
                      <label htmlFor="reverseOk" className="text-sm">Include reverse holos if cheaper</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input id="booster" name="booster_optin" type="checkbox" className="h-4 w-4" />
                      <label htmlFor="booster" className="text-sm">Offer a booster add-on</label>
                    </div>
                  </label>
                </div>
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Notes</span>
                  <textarea name="notes" rows={3} className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300" placeholder="Centering preferences, sellers you like, exclusions, etc."></textarea>
                </label>
                <button type="submit" className="mt-2 rounded-xl px-5 py-3 border border-ink bg-ink text-white hover:opacity-90 text-sm">Request my quote</button>
                <div className="text-xs text-slate-500">By submitting, you agree to our simple T&Cs (we email a quote; you decide).</div>
              </form>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-2xl font-bold">FAQ</h2>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">Which marketplaces do you use?</div>
              <div className="text-sm text-slate-600 mt-1">Primarily Cardmarket (EU), eBay, and TCGPlayer (US). Trusted Discord/FB sellers on request.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">Do you handle graded cards?</div>
              <div className="text-sm text-slate-600 mt-1">Yes — specify PSA/BGS/CGC and target grade. For raw cards, we screen for NM/M by default.</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">Payment options?</div>
              <div className="text-sm text-slate-600 mt-1">Bank/credit card. Crypto on request (USDT/USDC/BTC/ETH).</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 bg-white">
              <div className="font-semibold">Where do you ship?</div>
              <div className="text-sm text-slate-600 mt-1">Switzerland and EU to start. Tracked shipping recommended for higher-value orders.</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} PokéSet — Set completion made easy.</div>
          <div className="flex items-center gap-4">
            <a href="#form" className="underline">Get a quote</a>
            <a href="/pokeset_wantlist_template.csv" className="underline">CSV template</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
