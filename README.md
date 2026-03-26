# Flagstick Finds

Premium used golf club shop — Buy, Sell, Trade from DFW, ships nationwide.

**Live site:** [flagstickfinds.com](https://flagstickfinds.com)

---

## Architecture

- **Frontend:** Static HTML/CSS/JS (no build step) deployed on Netlify free tier
- **Database:** Supabase (tables: `listings`, `sold`, `wishlist`)
- **Image Storage:** Supabase Storage bucket "Flagstick Finds - Images"
- **Forms:** Formspree for customer submissions (offers, sell, trade, caddie requests)
- **Admin:** OTP-authenticated admin panel at `/admin.html`

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Public site — Pro Shop, Trade HQ, Caddie's Lane |
| `admin.html` | Admin panel — inventory CRUD, photo uploads, FB blurb generator, dashboard |
| `netlify.toml` | Netlify deploy configuration |
| `AGENTS.md` | AI agent instructions for working with this codebase |

## Admin Features

- **Dashboard** with inventory stats, revenue tracking, and recent activity
- **Listing management** — create, edit, delete clubs with drag-and-drop photo reordering
- **Client-side image optimization** — photos resized to 1600px max and compressed before upload
- **Facebook Marketplace integration** — generate formatted post text with one click
- **Deep link sharing** — copy `?club=<id>` links that scroll directly to a club on the public site
- **Mark as Sold** — moves items to sold history with price tracking

## Development

Serve the repo root locally:

```
python3 -m http.server 8000
```

No dependencies needed for the site itself. The `scripts/` directory contains optional Node.js migration tools.

## Deployment

Pushes to `main` auto-deploy via Netlify. Images are served from Supabase Storage, not from the repo. The `.gitignore` blocks image files from being committed.
