# Google Sheet → Clubs Sync — Setup Guide

This guide explains how to connect your Google Sheet to the site so that club listings update automatically every 15 minutes.

---

## Section 1 — Column headers

Make sure your Google Sheet (`1rGwZ17F-JVZs4AsGoBIggQI4UFk9TFwpPJWhWOQ6Ors`) has **exactly these column headers in row 1**:

```
id | name | type | ideal | low | obo | photos | desc
```

| Column | What to put in it |
|--------|-------------------|
| `id` | Optional. Leave blank and the script will auto-generate one from `name` (e.g. `scotty-phantom-x7`). |
| `name` | Club name — shown on the card. |
| `type` | One of: `Putter`, `Iron`, `Hybrid`, `Wood`, `Driver` |
| `ideal` | Asking price (number, no $ sign). |
| `low` | Floor / lowest price you'd accept (number). |
| `obo` | `TRUE` or `FALSE` |
| `photos` | Comma-separated filenames (see Section 6). |
| `desc` | Short description of the club. |

---

## Section 2 — Publish the sheet

The script reads the sheet via a public CSV export URL. To enable this:

1. In your Google Sheet, click **File → Share → Publish to web**
2. In the first dropdown, select **Sheet 1**
3. In the second dropdown, select **Comma-separated values (.csv)**
4. Click **Publish**, then confirm
5. You do not need to copy the URL — the script uses your Sheet ID directly

---

## Section 3 — Make the sheet public (read access)

The export URL only works if the sheet is readable by anyone.

1. Click **Share** (top-right corner of the sheet)
2. Under "General access", change it to **Anyone with the link**
3. Make sure the role is set to **Viewer**
4. Click **Done**

If this step is skipped, the sync script will receive an error and `_data/clubs.json` will not be updated.

---

## Section 4 — Trigger a manual sync

To sync immediately without waiting 15 minutes:

1. Go to your GitHub repository
2. Click the **Actions** tab
3. In the left sidebar, click **Sync clubs from Google Sheet**
4. Click **Run workflow** → **Run workflow**

The sync will run within a few seconds.

---

## Section 5 — Adding, editing, or removing a club

Just edit the Google Sheet:

- **Add a club** — add a new row with all columns filled in
- **Edit a club** — change any cell in an existing row
- **Remove a club** — delete the row entirely

The site will reflect your changes automatically within 15 minutes. No code changes are needed.

---

## Section 6 — Photo filenames

Photos are stored in the root of the repository. In the `photos` column, use the **exact filename** as it appears in the repo.

- Spaces and special characters can be either plain or URL-encoded — the script handles both
- Separate multiple photos with commas (no spaces around the comma are required)

**Example:**
```
Phantom%20X%207.jpg,phantom%20x%20face.jpg,Phatnom%20grip.jpg
```

or equivalently:
```
Phantom X 7.jpg,phantom x face.jpg,Phatnom grip.jpg
```

Both formats work. The site renders them the same way.
