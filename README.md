# NeuroDev Labs — Official Site

**Elevating the World, One Ecosystem at a Time.**

The official website for [neurodevlabs.cloud](https://neurodevlabs.cloud) — Lagos, Nigeria.

## Stack

Pure static HTML / CSS / vanilla JS. **No build step, no dependencies, no framework.**
Open `index.html` in a browser and it works. This is deliberate: the whole site can be
uploaded to any static host (including Hostinger shared hosting) as-is.

| File | Purpose |
|---|---|
| `index.html` | The entire single-page site (Hero, Story, Fab 4, Engine Room, Contact) |
| `styles.css` | All styling. Brand colours are CSS variables at the top of the file — swap them there when the official brand palette lands |
| `neuro-lab.js` | The animated hero: a lab-civilization of tiny builders working in neural sync, looping through Transverse → Longitudinal → Overhead → Synaptic views |
| `site.js` | Nav behaviour, mobile menu, scroll-reveal animations |
| `assets/favicon.svg` | Neuron favicon |

## Local preview

```bash
# any static server works; e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

## 🚀 Deploying to Hostinger (neurodevlabs.cloud)

Your domain and mail already live on Hostinger, so the site should be hosted there too.
Two ways to do it — pick one:

### Option A — File Manager upload (quickest, 5 minutes)

1. Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Go to **Websites → neurodevlabs.cloud → Dashboard → File Manager**.
3. Open the **`public_html`** folder.
4. Delete any placeholder files in there (`default.php`, "coming soon" pages, etc.).
5. Upload these files/folders **directly into `public_html`** (not into a subfolder):
   - `index.html`
   - `styles.css`
   - `neuro-lab.js`
   - `site.js`
   - `assets/` (the whole folder)
   > Tip: on your computer, select the files → right-click → compress to `site.zip`,
   > upload the single zip, then right-click it in File Manager → **Extract**. Make sure
   > `index.html` ends up at `public_html/index.html`, then delete the zip.
6. Visit `https://neurodevlabs.cloud` — the site is live.

### Option B — Git auto-deploy (updates on every push)

1. In hPanel go to **Websites → neurodevlabs.cloud → Advanced → GIT**.
2. Under **Create a New Repository**:
   - **Repository address:** `https://github.com/TreyKys/Creatorium-.git`
   - **Branch:** `main` (merge this branch into `main` first)
   - **Directory:** leave blank (deploys straight into `public_html`)
3. Click **Create**, then **Deploy**. For private repos, hPanel shows an SSH key to add
   under GitHub → repo → **Settings → Deploy keys**.
4. Optional: copy the **webhook URL** hPanel gives you into GitHub → repo →
   **Settings → Webhooks** so every push to `main` redeploys automatically.

### After deploying (both options)

- **Force HTTPS:** hPanel → your website → **Security → SSL** → make sure the certificate
  is active and **Force HTTPS** is on.
- **Mail is untouched:** uploading website files to `public_html` has zero effect on your
  MX/mail records — your `@neurodevlabs.cloud` mailboxes keep working exactly as before.
- **Netlify:** nothing to migrate. Since DNS is on Hostinger and the files are served from
  Hostinger, Netlify is simply not in the loop for this domain.

## Re-theming when brand assets arrive

All colours are defined once at the top of `styles.css` under `:root` (`--accent`,
`--accent-2`, `--bg-0`, …). Swap those values and the entire site — including the hero
animation scrim and cards — re-themes. The canvas animation colours are in the `C`
object at the top of `neuro-lab.js`.
