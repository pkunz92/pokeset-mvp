
# PokéSet Matcher MVP — Airtable Edition

Live-Daten über Airtable, Admin-Editor, Order-for-me Flow.

## 1) Airtable Setup
- Erstelle eine Base, z.B. **PokéSet**.
- Tabellentypen & Felder (genaue Schreibweise wichtig):

### Table: `catalog`
- **set_name** (Single line text)
- **set_code** (Single line text)
- **card_number** (Single line text)
- **name** (Single line text)
- **finishes** (Multiple select: normal, reverse, holo)
- **languages** (Multiple select: EN, DE, FR, IT ...)

### Table: `inventory`
- **id** (Single line text) — optional (wird vom Server hergeleitet)
- **set_name** (Single line text)
- **set_code** (Single line text)
- **card_number** (Single line text)
- **name** (Single line text)
- **finish** (Single select: normal, reverse, holo)
- **language** (Single select: EN, DE, FR, IT ...)
- **condition** (Single select: NM/M, LP+, any ...)
- **price** (Number)
- **qty** (Number)
- **fictitious** (Checkbox)

### Table: `orders`
- **email** (Email)
- **requested_qty** (Number)
- **max_price** (Number)
- **notes** (Long text)
- **language** (Single select)
- **finish** (Single select)
- **condition** (Single select)
- **set_name** (Single line text)
- **set_code** (Single line text)
- **card_number** (Single line text)
- **card_name** (Single line text)
- **source** (Single line text)
- **status** (Single select: requested, quoted, purchased)
- **created_at** (Created time) — oder Date

## 2) Vercel ENV Variablen
- `AIRTABLE_API_TOKEN` = Personal Access Token
- `AIRTABLE_BASE_ID` = deine Base-ID (z.B. appXXXXXXXXXXXXXX)
- `AIRTABLE_CATALOG_TABLE` = `catalog`
- `AIRTABLE_INVENTORY_TABLE` = `inventory`
- `AIRTABLE_ORDERS_TABLE` = `orders`
- (Optional) `AIRTABLE_*_VIEW` für vordefinierte Views
- (Optional) `NEXT_PUBLIC_ADMIN_KEY` für /admin Passwort

## 3) Starten
```bash
npm i
npm run dev
# http://localhost:3000  (Frontend)
# http://localhost:3000/admin  (Admin Editor)
```
Auf Vercel: Projekt importieren, ENV setzen, deployen.

