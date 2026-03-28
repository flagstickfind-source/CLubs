# Google Sheet Setup Guide

---

## Section 0 — Quickstart (recommended)

1. Download `sheet-template.csv` from this repo.
2. Go to <a href="https://sheets.google.com">sheets.google.com</a> and open the sheet with ID `1rGwZ17F-JVZs4AsGoBIggQI4UFk9TFwpPJWhWOQ6Ors`.
3. **File → Import → Upload** → select `sheet-template.csv`.
4. Choose **"Replace current sheet"** and **"No"** for convert text to numbers/dates → **Import**.
5. You now have the correct headers and 3 example rows — replace the examples with your real clubs.
6. In the `photos` column, separate multiple filenames with a semicolon `;` (not a comma).
7. Publish the sheet (see **Section 2** below).

---

## Section 1 — Column reference

Your sheet must have **Row 1** as the header row with these exact column names (order matters):

| Column | Description |
|--------|-------------|
| `id` | Unique slug, e.g. `scotty-newport` (lowercase, hyphens only) |
| `name` | Club name as it should appear on the site |
| `type` | One of: `Putter`, `Iron`, `Hybrid`, `Wood`, `Driver` |
| `ideal` | Asking price — plain number, no `$` sign |
| `low` | Lowest price you'd accept — plain number, no `$` sign |
| `obo` | `TRUE` or `FALSE` (all caps) |
| `photos` | Photo filenames separated by `;` — see Section 6 |
| `desc` | Short description of the club |

---

## Section 2 — Publishing the sheet

The sync script fetches your sheet as a public CSV. You must publish it:

1. In Google Sheets, go to **File → Share → Publish to web**.
2. Select **Sheet 1** (or the tab name your data is on).
3. Select **Comma-separated values (.csv)** as the format.
4. Click **Publish** and confirm.
5. Also make sure sharing is set to **"Anyone with the link → Viewer"**.

You do **not** need to share the publish URL anywhere — the sync script already knows your Sheet ID.

---

## Section 3 — How the sync works

The script `scripts/sync-from-sheet.js` runs automatically via GitHub Actions every 15 minutes. It:

1. Fetches your published sheet as CSV.
2. Parses each row into a club object.
3. Overwrites `_data/clubs.json` with the result.
4. Commits and pushes the change if anything changed.
5. Netlify detects the new commit and redeploys the site.

**Your live site updates within ~15 minutes of editing the sheet — no code required.**

---

## Section 4 — Triggering a manual sync

1. Go to your GitHub repo → **Actions** tab.
2. Select **"Sync clubs from Google Sheet"**.
3. Click **"Run workflow"** → **"Run workflow"**.

---

## Section 5 — Adding, editing, and removing clubs

| Action | What to do in the sheet |
|--------|------------------------|
| Add a club | Add a new row with all columns filled in |
| Edit a club | Edit any cell in that club's row |
| Remove a club | Delete that row entirely |
| Temporarily hide | Clear the `id` cell — rows without an `id` are skipped |

---

## Section 6 — Photo filenames

- Photo filenames must match **exactly** the filenames in the repo (case-sensitive).
- Spaces in filenames should be URL-encoded as `%20`.
- To list **multiple photos** for one club, separate them with a **semicolon `;`**:

```
Phantom%20X%207.jpg;phantom%20x%20face.jpg;Phatnom%20grip.jpg
```

- Do **not** use commas to separate photo filenames inside the cell — commas are the CSV column separator and will break the import.

---

## Section 7 — ADMIN tab (optional)

You can add a second tab named `ADMIN` in the same spreadsheet for your own notes, archived clubs, or a legend. The sync script only reads **the first tab (Sheet 1)** and ignores all other tabs.
