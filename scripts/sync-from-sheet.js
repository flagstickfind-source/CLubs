'use strict';

const https = require('https');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1rGwZ17F-JVZs4AsGoBIggQI4UFk9TFwpPJWhWOQ6Ors';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;
const OUT_PATH = path.join(__dirname, '..', '_data', 'clubs.json');

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchUrl(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseCsv(text) {
  const lines = [];
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
        lines.push(row);
        row = [];
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field);
        field = '';
        lines.push(row);
        row = [];
      } else {
        field += ch;
      }
    }
  }

  if (field || row.length > 0) {
    row.push(field);
    lines.push(row);
  }

  return lines;
}

function parsePhotos(raw) {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
}

async function main() {
  let csv;
  try {
    csv = await fetchUrl(CSV_URL);
  } catch (err) {
    console.error('Failed to fetch Google Sheet:', err.message);
    process.exit(1);
  }

  const rows = parseCsv(csv);
  if (rows.length < 2) {
    console.error('Sheet has no data rows.');
    process.exit(1);
  }

  const [header, ...dataRows] = rows;
  const col = {};
  header.forEach((h, i) => { col[h.trim().toLowerCase()] = i; });

  const required = ['name', 'type', 'ideal', 'low', 'obo', 'photos', 'desc'];
  for (const field of required) {
    if (col[field] === undefined) {
      console.error(`Missing required column: "${field}"`);
      process.exit(1);
    }
  }

  const clubs = [];
  for (const row of dataRows) {
    const name = (row[col['name']] || '').trim();
    if (!name) continue;

    const idColIndex = col['id'];
    const rawId = idColIndex !== undefined ? (row[idColIndex] || '').trim() : '';
    const id = rawId || slugify(name);

    const type = (row[col['type']] || '').trim();
    const ideal = Number(row[col['ideal']]) || 0;
    const low = Number(row[col['low']]) || 0;
    const oboRaw = (row[col['obo']] || '').trim().toUpperCase();
    const obo = oboRaw === 'TRUE';
    const photos = parsePhotos(row[col['photos']] || '');
    const desc = (row[col['desc']] || '').trim();

    clubs.push({ id, name, type, ideal, low, obo, photos, desc });
  }

  try {
    fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
    fs.writeFileSync(OUT_PATH, JSON.stringify(clubs, null, 2) + '\n', 'utf8');
    console.log(`Success: wrote ${clubs.length} clubs to ${OUT_PATH}`);
  } catch (err) {
    console.error('Failed to write clubs.json:', err.message);
    process.exit(1);
  }
}

main();
