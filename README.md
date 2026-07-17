# NeuroDev Labs — Official Site

**Elevating the World, One Ecosystem at a Time.**

The official website for [neurodevlabs.cloud](https://neurodevlabs.cloud) — Lagos, Nigeria.

## Stack

Pure static HTML / CSS / vanilla JS. **No build step, no dependencies, no framework.**
Open `index.html` in a browser and it works. This is deliberate: the whole site can be
uploaded to any static host as-is.

| File | Purpose |
|---|---|
| `index.html` | The entire single-page site (Hero, Story, Fab 4, Engine Room, Contact) |
| `styles.css` | All styling. Brand colours are CSS variables at the top of the file — swap them there when the official brand palette lands |
| `neuro-lab.js` | The animated hero: a lab-civilization of tiny builders working in neural sync, looping through Transverse → Longitudinal → Overhead → Synaptic views |
| `site.js` | Nav behaviour, mobile menu, scroll-reveal animations |
| `assets/favicon.svg` | Neuron favicon |
| `privacy/context.html`, `privacy/magnum-opus.html` | Public privacy policy pages required by app stores |
| `netlify.toml` | Netlify build/publish config (no build step; publishes the repo root) |

## Local preview

```bash
# any static server works; e.g.
python3 -m http.server 8080
# then open http://localhost:8080
```

## 🚀 Deploying to Netlify (neurodevlabs.cloud)

The site is hosted on Netlify; **Hostinger stays in charge of DNS and mail** — we only
repoint two DNS records so the domain resolves to Netlify instead. Mail (MX records) is
never touched.

### 1. Create the Netlify site

1. Log in to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project**.
2. Connect GitHub, pick `TreyKys/Creatorium-`, branch `main` (merge this branch into
   `main` first).
3. Build settings are already set by `netlify.toml` in this repo — publish directory `.`,
   no build command. Click **Deploy**.
4. You'll get a temporary `your-site-name.netlify.app` URL. **Test the whole site there
   first** before touching DNS.

### 2. Point the domain at Netlify — without moving mail

1. In the Netlify site → **Domain management → Add a domain** → enter
   `neurodevlabs.cloud`.
2. When Netlify asks how to configure DNS, choose the option to **keep your current DNS
   provider** (do *not* delegate nameservers to Netlify — that would hand Hostinger's
   whole DNS zone, MX records included, over to Netlify, which is exactly what we want to
   avoid). Netlify will instead show you the exact record values to add — usually:
   - An **A record** for `@` (root domain) → Netlify's load balancer IP
   - A **CNAME** for `www` → `your-site-name.netlify.app`
   Use the values Netlify's dashboard shows you, not the ones above from memory — they
   can change.
3. **Before editing anything**, go to Hostinger hPanel → **Domains → neurodevlabs.cloud →
   DNS / Nameservers → DNS Zone Editor** and screenshot the current records — especially
   the **MX** records and any **SPF/DKIM/DMARC TXT** records for mail. This is your backup.
4. In that same DNS Zone Editor, **edit only** the `A` record for `@` and the `CNAME` for
   `www` to the Netlify values from step 2. **Do not touch, delete, or replace any MX or
   mail-related TXT record**, and do not change the domain's nameservers.
5. Wait for DNS to propagate (usually under an hour, can take up to 24–48h). Check with:
   ```bash
   dig neurodevlabs.cloud A       # should show Netlify's IP
   dig neurodevlabs.cloud MX      # should be unchanged from your screenshot
   ```
6. Back in Netlify, once the domain verifies, enable **HTTPS** (free, automatic via
   Let's Encrypt).

### 3. Confirm nothing broke

- Visit `https://neurodevlabs.cloud` — the new site should load.
- Send yourself a test email to and from an `@neurodevlabs.cloud` address to confirm mail
  still works exactly as before.
- Every future `git push` to `main` auto-redeploys the site — no manual upload step.

### If you decide to self-host on Hostinger instead

Hostinger hosting plans include a **File Manager** for uploading files straight into
`public_html`, and a **Git** deploy option under **Advanced → GIT**. If your current
Hostinger plan doesn't show a File Manager, it likely only covers the domain + mail, not
web hosting — which is exactly why Netlify (free) is the simpler path here.

## Brand

The site follows the official ndevl. brand assets: cream (`#f4f1e7`) + ink (`#1c1b14`)
monochrome, with the "nl." circuit monogram recreated as an inline SVG (nav) and as
`assets/favicon.svg`. Square bullets and nodes throughout echo the monogram's circuit
dendrites; a warm gold (`#9c7a2e`) carries the "pulse/signal" moments in the hero
animation, and muted green/amber are used only as LIVE / IN-DEV status colours.

All tokens are defined once at the top of `styles.css` under `:root` — adjust there to
re-theme. The canvas animation colours are in the `C` object at the top of `neuro-lab.js`.
