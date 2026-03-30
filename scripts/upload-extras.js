const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const sb = createClient(
  'https://skauwlggqcdbrzzxvxxh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXV3bGdncWNkYnJ6enh2eHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTE0ODMsImV4cCI6MjA4OTk4NzQ4M30.mZQNmxfFjMJFgqN4LloRFnTImHoy6MdysqVxxUT3vKs'
);
const BUCKET = 'club-photos';
const ROOT = path.resolve(__dirname, '..');

const EXTRA_MAP = {
  'scotty-california': ['California alt.jpg'],
  'scotty-golo': ['GoLo alt.jpg', 'GoLoo.jpg'],
  'miura-tc201': [
    'Muira TC - 201.jpg', 'Muira TC - 201 2 .jpg', 'Muira TC 1- 201.jpg', 'Muira TC 3 201.jpg',
    'muiraTC201.jpg', "newMuiraTC201's good an.jpg", "newMuiraTC201's topp.JPG",
    "newMuiraTC201'sgripnshaft.JPG", "newMuiraTC201'smadeinjapan.JPG",
    'Muira japan.jpg', 'good angle.jpg', 'Muira .jpg'
  ],
  'miura-cb57': ['Muira cb57 4.jpg', 'Muira Grips.jpg'],
  'miura-tourney': [
    'Muira tourney (cover).jpg', 'Muira TOURNEY .jpg', 'Muira TOURNEY 1.jpg',
    'Muira TOURNEY 3.jpg', 'Muira Tourney 6.jpg', 'MUIRA TOURNEY.jpg',
    'Muira cb57 tourney.jpg', 'Muira P wedg, (TOURNEY).jpg'
  ],
  'ping-i59': ['Pingi59 .jpg', 'Pingi59 extra.jpg'],
  'scotty-futura': ['futura face.jpg', 'Futura fullpic.jpg', 'Futura side (main pic).jpg', 'Futura, top.jpg']
};

async function upload(localFile, storagePath) {
  const fullPath = path.join(ROOT, localFile);
  if (!fs.existsSync(fullPath)) { console.log(`  SKIP: ${localFile}`); return null; }
  const buf = fs.readFileSync(fullPath);
  const ct = localFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: ct, cacheControl: '31536000', upsert: true
  });
  if (error) { console.log(`  FAIL: ${localFile} => ${error.message}`); return null; }
  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`  OK: ${localFile}`);
  return publicUrl;
}

async function main() {
  console.log('=== Uploading extra images ===\n');
  let total = 0, ok = 0;

  for (const [clubId, files] of Object.entries(EXTRA_MAP)) {
    console.log(`[${clubId}]`);
    for (const fname of files) {
      total++;
      const safeName = fname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
      const url = await upload(fname, `${clubId}/${safeName}`);
      if (url) ok++;
    }
  }

  console.log(`\n=== Done: ${ok}/${total} uploaded ===`);
}

main().catch(console.error);
