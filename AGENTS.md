# AGENTS.md

## Cursor Cloud specific instructions

### Architecture
This is a **static single-page website** (`index.html`) — no build step, no package manager, no framework. Vanilla HTML/CSS/JS served directly from the repo root.

### Running locally
Serve the repo root with any HTTP server:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000` in Chrome. No dependencies to install.

### External services
- **Supabase** (database + image storage): Credentials are hardcoded in `index.html`. The site loads club inventory from the `listings` table and sold items from the `sold` table at runtime.
- **Formspree**: Four form endpoints handle offers, sell submissions, trade submissions, and caddie/wishlist requests. Endpoints are hardcoded.
- **Netlify**: Deployment is configured via `netlify.toml` — publishes `.` (root directory) with no build command.

### Key files
| File | Purpose |
|---|---|
| `index.html` | The entire site — HTML, CSS, and JS |
| `netlify.toml` | Netlify deploy config |
| `admin/` | Netlify CMS / Decap CMS admin panel |
| `scripts/sync-from-sheet.js` | Node.js script to sync Google Sheet → `_data/clubs.json` (uses only built-in modules) |

### Testing notes
- The site pulls live data from Supabase. If the `listings` table is empty, it falls back to a hardcoded `FALLBACK` array in the `<script>` section.
- Images are stored in Supabase Storage bucket "Flagstick Finds - Images".
- No linter or automated test suite exists — manual browser testing is the primary verification method.
- When testing form submissions, Formspree endpoints are live and will deliver real emails.

### Color palette (A4 Deep Masters)
Defined in `:root` CSS variables. Do not deviate: `--cream: #f0ebe0`, `--green: #1a4731`, `--dark: #122d20`, `--gold: #c9a84c`, etc.

### Fonts
Loaded via Google Fonts: DM Serif Display (headings), Barlow + Barlow Condensed (body/UI). See the `<link>` tag in `<head>`.
