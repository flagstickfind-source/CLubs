# Flagstick Finder — Pro Shop

Your golf club shop website. All club photos are stored in this repository and the site is ready to go live on Netlify.

---

## ✅ What has already been done

- `index.html` — modern, responsive shop website with all 20 clubs listed
- All 69 photos already committed to this repository
- Every photo is wired to the correct club card with a swipeable gallery
- `netlify.toml` — Netlify deployment config (no extra setup required)

---

## 🚀 What you need to do next

### Step 1 — Merge the Pull Request on GitHub

1. Go to **https://github.com/flagstickfind-source/CLubs/pulls**
2. Click on the open pull request titled **"Rebuild index.html with modern design and wire all repository images for Netlify"**
3. Click **"Ready for review"** (removes draft status)
4. Click **"Merge pull request"** → **"Confirm merge"**

> This puts all the website files into your `main` branch.

---

### Step 2 — Deploy to Netlify

#### First time (new site):

1. Go to **https://app.netlify.com** and sign in (or create a free account)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify and select the **`flagstickfind-source/CLubs`** repository
5. Leave all build settings blank — the `netlify.toml` file handles everything automatically
6. Click **"Deploy site"**

Netlify will give you a free URL like `https://flagstick-finder-abc123.netlify.app` within about 60 seconds.

#### Optional — use a custom domain:

1. In Netlify, go to **Site configuration → Domain management**
2. Click **"Add a domain"** and enter your custom domain (e.g. `flagstickfinder.com`)
3. Follow Netlify's DNS instructions to point your domain at the site

---

### Step 3 — Future updates

Any time you want to update the site (add new clubs, change prices, add photos):

1. Add new photos to the repository via GitHub's web interface — drag and drop on the repository home page
2. Edit `index.html` to add the new club entry in the `clubs` array
3. Commit the changes
4. Netlify automatically re-deploys within ~60 seconds — no manual steps needed

---

## 📸 Adding a new club (quick guide)

In `index.html`, find the `clubs` array in the `<script>` section and add an entry like this:

```js
{
  id: 'your-club-id',           // unique slug, no spaces
  name: 'Brand Model Name',     // shown on the card
  type: 'Putter',               // Putter | Iron | Hybrid | Driver
  ideal: 250,                   // asking price in $
  low: 175,                     // lowest you'd accept
  obo: true,                    // show "OBO" badge?
  photos: ['Your%20Photo.jpg'], // filenames URL-encoded (spaces → %20)
  desc: 'Short description of the club condition and specs.'
},
```

---

## 📬 Contact info on the site

- **Facebook Marketplace:** https://www.facebook.com/marketplace
- **Email:** adamsjerram11@gmail.com
- **Location:** Dallas–Fort Worth, TX · Ships Nationwide
