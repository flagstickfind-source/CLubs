#!/usr/bin/env node
// sync-from-sheet.js
// Fetches the published Google Sheet as CSV and writes _data/clubs.json.
// No npm dependencies — uses only Node.js built-in modules.

'use strict';

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const SHEET_ID  = '1rGwZ17F-JVZs4AsGoBIggQI4UFk9TFwpPJWhWOQ6Ors';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/pub?output=csv`;
const OUT_PATH  = path.join(__dirname, '..', '_data', 'clubs.json');

// ---------------------------------------------------------------------------
// Minimal RFC-4180 CSV parser (handles quoted fields with embedded commas/newlines)
// ---------------------------------------------------------------------------
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field);
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field);
        field = '';
        rows.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  // Flush last field/row
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Fetch helpers
// ---------------------------------------------------------------------------
function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow redirects (Google Sheets CSV export redirects once)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchURL(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} fetching ${url}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Row → club object
// ---------------------------------------------------------------------------
function rowToClub(headers, values) {
  const get = (col) => {
    const idx = headers.indexOf(col);
    return idx !== -1 ? (values[idx] || '').trim() : '';
  };

  const id      = get('id');
  const name    = get('name');
  const type    = get('type');
  const ideal   = Number(get('ideal'));
  const low     = Number(get('low'));
  const oboRaw  = get('obo').toUpperCase();
  const obo     = oboRaw === 'TRUE';
  const desc    = get('desc');

  // Photos: semicolon-separated filenames inside the cell
  const photos = get('photos')
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  // Skip rows missing required fields
  if (!id || !name || !type || isNaN(ideal) || isNaN(low)) return null;

  return { id, name, type, ideal, low, obo, photos, desc };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Fetching sheet: ${SHEET_URL}`);
  const csv = await fetchURL(SHEET_URL);

  const rows = parseCSV(csv);
  if (rows.length < 2) {
    throw new Error('Sheet appears to be empty (fewer than 2 rows).');
  }

  // First row is the header
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  console.log(`Headers found: ${headers.join(', ')}`);

  const clubs = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Skip blank rows
    if (row.every((cell) => cell.trim() === '')) continue;

    const club = rowToClub(headers, row);
    if (!club) {
      console.warn(`  Skipping row ${i + 1}: missing required fields`);
      continue;
    }
    clubs.push(club);
  }

  console.log(`Parsed ${clubs.length} club(s).`);

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(clubs, null, 2) + '\n', 'utf8');
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((err) => {
  console.error('sync-from-sheet failed:', err.message);
  process.exit(1);
});
