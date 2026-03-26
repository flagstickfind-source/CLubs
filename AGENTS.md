# AGENTS.md

## Architecture
Static single-page website (`index.html`) with a separate admin panel (`admin.html`). No build step, no package manager required for deployment. Vanilla HTML/CSS/JS served directly from the repo root via Netlify.

## Running Locally
Serve the repo root with any HTTP server:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

## External Services
- **Supabase** (database + image storage): Tables: `listings`, `sold`, `wishlist`. Images stored in bucket "Flagstick Finds - Images". Anon key is in both HTML files.
- **Formspree**: Form endpoints for offers, sell, trade, and caddie requests. Endpoints are in `index.html`.
- **Netlify**: Static deploy via `netlify.toml` — publishes `.` (root directory) with no build command.

## Key Files
| File | Purpose |
|---|---|
| `index.html` | Public-facing site (Pro Shop, Trade HQ, Caddie's Lane) |
| `admin.html` | Admin panel (listings CRUD, photo upload, FB blurb generator, dashboard) |
| `netlify.toml` | Netlify deploy config |
| `_data/clubs.json` | Legacy fallback data (Supabase is the primary data source) |
| `.gitignore` | Blocks images and node_modules from Git |

## Data Flow
- Public site loads inventory from Supabase `listings` table at runtime
- Admin panel authenticates via Supabase OTP (magic link to admin email)
- Photos are uploaded to Supabase Storage, resized client-side before upload (1600px max, JPEG 82%)
- Images are NOT stored in Git — they live in Supabase Storage bucket

## Testing Notes
- If Supabase `listings` table is empty, the public site falls back to a hardcoded `FALLBACK` array
- Images in Supabase Storage bucket "Flagstick Finds - Images"
- No linter or automated test suite — manual browser testing
- Formspree endpoints are live

## Color Palette
Defined in `:root` CSS variables: `--cream:#f0ebe0`, `--green:#1a4731`, `--dark:#122d20`, `--gold:#c9a84c`

## Fonts
DM Serif Display (headings), Barlow + Barlow Condensed (body/UI) via Google Fonts.

## URL Parameters
- `?club=<id>` — deep links to a specific club card on the public site (auto-scrolls and highlights)
