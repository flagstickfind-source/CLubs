#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');

const SUPA_URL = 'https://skauwlggqcdbrzzxvxxh.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNrYXV3bGdncWNkYnJ6enh2eHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTE0ODMsImV4cCI6MjA4OTk4NzQ4M30.mZQNmxfFjMJFgqN4LloRFnTImHoy6MdysqVxxUT3vKs';
const BUCKET = 'Flagstick Finds - Images';

const sb = createClient(SUPA_URL, SUPA_KEY);

const PHOTOS_DIR = path.resolve(__dirname, '..', '..', 'Flagstick');
const REPO_DIR = path.resolve(__dirname, '..');
const MAP_FILE = path.join(__dirname, '..', '_data', 'photo-map.json');

const MAX_WIDTH = 1600;
const QUALITY = 82;

async function listExistingFiles() {
  const existing = new Set();
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list('', { limit, offset });
    if (error) { console.error('List error:', error.message); break; }
    if (!data || data.length === 0) break;
    data.forEach(f => existing.add(f.name));
    offset += data.length;
    if (data.length < limit) break;
  }

  const { data: adminData } = await sb.storage.from(BUCKET).list('admin-uploads', { limit: 1000 });
  if (adminData) adminData.forEach(f => existing.add('admin-uploads/' + f.name));

  return existing;
}

function getLocalPhotos() {
  const photos = [];
  const dirs = [PHOTOS_DIR, REPO_DIR];
  const seen = new Set();

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.heic') continue;
      if (seen.has(file.toLowerCase())) continue;
      seen.add(file.toLowerCase());
      photos.push({ name: file, fullPath: path.join(dir, file) });
    }
  }
  return photos;
}

async function optimizeAndUpload(photo, existing) {
  const storageName = photo.name;

  if (existing.has(storageName)) {
    const { data } = sb.storage.from(BUCKET).getPublicUrl(storageName);
    return { original: photo.name, url: data.publicUrl, status: 'already_exists' };
  }

  try {
    const buffer = await sharp(photo.fullPath)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();

    const originalSize = fs.statSync(photo.fullPath).size;
    const ratio = ((1 - buffer.length / originalSize) * 100).toFixed(1);
    console.log(`  Optimized: ${(originalSize / 1024 / 1024).toFixed(1)}MB -> ${(buffer.length / 1024 / 1024).toFixed(1)}MB (${ratio}% smaller)`);

    const { error } = await sb.storage.from(BUCKET).upload(storageName, buffer, {
      contentType: 'image/jpeg',
      cacheControl: '31536000',
      upsert: true,
    });

    if (error) {
      console.error(`  Upload failed for ${photo.name}: ${error.message}`);
      return { original: photo.name, url: null, status: 'upload_error', error: error.message };
    }

    const { data } = sb.storage.from(BUCKET).getPublicUrl(storageName);
    return { original: photo.name, url: data.publicUrl, status: 'uploaded' };
  } catch (err) {
    console.error(`  Processing failed for ${photo.name}: ${err.message}`);
    return { original: photo.name, url: null, status: 'process_error', error: err.message };
  }
}

async function main() {
  console.log('Listing existing files in Supabase Storage...');
  const existing = await listExistingFiles();
  console.log(`Found ${existing.size} existing files in bucket.`);

  console.log('\nScanning local photos...');
  const photos = getLocalPhotos();
  console.log(`Found ${photos.length} local photos.`);

  const results = [];
  let uploaded = 0, skipped = 0, failed = 0;

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    console.log(`[${i + 1}/${photos.length}] ${photo.name}`);
    const result = await optimizeAndUpload(photo, existing);
    results.push(result);

    if (result.status === 'uploaded') uploaded++;
    else if (result.status === 'already_exists') skipped++;
    else failed++;
  }

  fs.mkdirSync(path.dirname(MAP_FILE), { recursive: true });
  fs.writeFileSync(MAP_FILE, JSON.stringify(results, null, 2));

  console.log('\n--- Summary ---');
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Already existed: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Map written to: ${MAP_FILE}`);

  const urlMap = {};
  results.forEach(r => {
    if (r.url) urlMap[r.original] = r.url;
  });

  const clubsPath = path.join(__dirname, '..', '_data', 'clubs.json');
  if (fs.existsSync(clubsPath)) {
    const clubs = JSON.parse(fs.readFileSync(clubsPath, 'utf8'));
    let updated = 0;
    clubs.forEach(club => {
      club.photos = club.photos.map(photoRef => {
        const decoded = decodeURIComponent(photoRef);
        if (urlMap[decoded]) {
          updated++;
          return urlMap[decoded];
        }
        return photoRef;
      });
    });
    fs.writeFileSync(clubsPath, JSON.stringify(clubs, null, 2) + '\n');
    console.log(`Updated ${updated} photo references in clubs.json`);
  }
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
