const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPA_URL = 'https://skauwlggqcdbrzzxvxxh.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXV3bGdncWNkYnJ6enh2eHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTE0ODMsImV4cCI6MjA4OTk4NzQ4M30.mZQNmxfFjMJFgqN4LloRFnTImHoy6MdysqVxxUT3vKs';
const BUCKET = 'club-photos';
const sb = createClient(SUPA_URL, SUPA_KEY);

const CLUB_IMAGE_MAP = {
  'scotty-phantom-x7': ['Phantom X 7.jpg', 'phantom x face.jpg', 'Phatnom grip.jpg'],
  'scotty-newport':    ['Newport face.jpg', 'newport back.jpg'],
  'scotty-golo':       ['GoLo Face.jpg', 'GoLo back.jpg', 'GoLo grip.jpg', 'GoLo 1.5.jpg'],
  'scotty-california': ['calfornia.jpg', 'california ,...jpg', 'California face.jpg', 'California Grip.jpg'],
  'scotty-select':     ['Select Face.JPG', 'Select top.JPG', 'Select grip.JPG', 'select flashback.jpg'],
  'spider-gtx':        ['Spider face.jpg', 'Spider top.jpg', 'SPider grip.jpg', 'spider faceee.jpg'],
  'odyssey-ai':        ['Oddesey Ai .jpg', 'Oddessey ai.jpg', 'Oddeseey Ai top.jpg'],
  'miura-tc201':       ["newMuiraTC201's face.JPG", "newMuiraTC201's full.jpg", "newMuiraTC201's top.JPG", "newMuiraTC201's good angle.jpg"],
  'miura-cb57':        ['Muira CB57 Irons.jpg', 'Muira CB 57 FACE.jpg', 'Muira cb 57 face 2.jpg', 'Muira cb57 grips.jpg', 'Muira cb 57 shaft.jpg'],
  'miura-tourney':     ['Miuita tourney COVER PHOTO.jpg', 'miura tourney.jpg', 'Muira 56 degree (TOURNEY).jpg', 'dd Muira tourney.jpg'],
  'mizuno-mp20':       ['Mizuno face.jpg', 'Mizuno Cover 4-pw.jpg', 'Mizuno Grips.jpg', 'Mixuno MP-20 Sun.jpg'],
  'ping-i59':          ['Pingi59.jpg', 'Pingi59 2.jpg', 'Pingi59 grips.jpg', 'Ping i59 Sun.jpg'],
  'p7mb-driving-iron': ['Driving Iron - MB7 3 & 4 iron.jpg', 'M7 face.jpg', 'M7 Grips.jpg', 'M7.jpg'],
  'callaway-rogue-hybrid': ['Rogue 3&4 hybrid face.jpg', 'Rogue 3&4 hybrid full.jpg', 'Rogue 3&4 hybrid top.jpg', 'Rogue 3&4 hybrid jumbo grip.jpg'],
  'ping-g425':         ['Ping425 face.jpg', 'Ping425 back.jpg', 'Ping425 gripshaft.jpg'],
  'qi10-5wood':        ['Qi10 5 wood.jpg', 'qi10 5wood face.jpg'],
  'simmax-5wood':      ['Sim Max 5 wood face.jpg', 'Sim Max 5 wood  full.jpg', 'Sim Max 5 wood topandface.jpg', 'Sim Max 5 wood shaft.jpg'],
  'titleist-918-d2':   ['Titlist 918 D2 Driver 10.5 degree full.jpg', 'Titlist 918 D2 Driver 10.5 degree topandface.jpg', 'Titlist 918 D2 Driver 10.5 degree  top.jpg', 'Titlist 918 D2 Driver 10.5 degree  shaft.jpg'],
};

const ROOT = path.resolve(__dirname, '..');

async function uploadFile(localFile, storagePath) {
  const fullPath = path.join(ROOT, localFile);
  if (!fs.existsSync(fullPath)) {
    console.log(`  SKIP (not found): ${localFile}`);
    return null;
  }
  const buf = fs.readFileSync(fullPath);
  const ct = localFile.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: ct, cacheControl: '31536000', upsert: true
  });
  if (error) {
    console.log(`  FAIL: ${localFile} => ${error.message}`);
    return null;
  }
  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`  OK: ${localFile} => ${storagePath}`);
  return publicUrl;
}

async function main() {
  console.log('=== Bulk Sync: Upload images to Supabase Storage ===\n');

  let totalUploaded = 0;
  let totalFailed = 0;

  for (const [clubId, files] of Object.entries(CLUB_IMAGE_MAP)) {
    console.log(`\n[${clubId}]`);
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const fname = files[i];
      const safeName = fname.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
      const storagePath = `${clubId}/${safeName}`;
      const url = await uploadFile(fname, storagePath);
      if (url) {
        urls.push(url);
        totalUploaded++;
      } else {
        totalFailed++;
      }
    }
    if (urls.length > 0) {
      console.log(`  Uploaded ${urls.length} photos for ${clubId}`);
    }
  }

  console.log(`\n=== Done: ${totalUploaded} uploaded, ${totalFailed} failed ===`);
  console.log('\nNote: Listings table update requires authenticated session (admin login).');
  console.log('The fallback array in index.html uses relative paths which work via GitHub Pages.');
}

main().catch(console.error);
