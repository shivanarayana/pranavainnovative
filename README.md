# Pranava Innovative Technologies — website

Static marketing site for **Pranava Innovative Technologies** (Pranava Technologies UK Ltd /
Pranava Innovative Technologies Pvt. Ltd.), migrated from the BigRock website builder at
www.pranavainnovative.com to **Firebase Hosting**.

No framework or dependencies — plain HTML, CSS and a small vanilla JS file. Nothing is loaded
from third-party servers (fonts and images are self-hosted).

## Structure

```
public/
  index.html                        Home
  about-us.html                     About Us (approach + five steps)
  sectors-clients.html              Sectors & Clients
  services.html                     Services catalogue
  consulting-cloud-migration.html   Consulting & Cloud Migration
  careers.html                      Careers (openings + application form)
  contact-us.html                   Contact Us (offices + enquiry form)
  404.html                          Not-found page
  robots.txt, sitemap.xml
  assets/
    css/styles.css                  All styles (fonts and colour tokens at the top)
    js/main.js                      Mobile menu, scroll reveal, forms
    fonts/                          Lato + Montserrat (woff2, SIL Open Font License)
    img/logo.png                    Logo on a transparent background (used on the site)
    img/logo-original.png           Original logo, untouched (black background)
    img/favicon.ico, favicon-32.png, apple-touch-icon.png
    img/og-image.png                Preview image for links shared on LinkedIn, WhatsApp, etc.
    img/photos/*.webp               Photos (Unsplash licence, as on the original site)
scripts/stamp-assets.mjs            Cache-busting; runs automatically before each deploy
firebase.json                       Hosting config (clean URLs, caching, security headers)
```

Page URLs match the old site (`/about-us`, `/services`, `/careers`, …), so existing links and
search rankings carry over. `cleanUrls` serves `about-us.html` at `/about-us`.

The header and footer are repeated in every page. If you change navigation, contact details or
the footer, update all eight HTML files.

## Run locally

```bash
firebase emulators:start --only hosting
```

Then open http://localhost:5000.

## Deploy

```bash
firebase deploy --only hosting
```

This deploys to the `pranavainnovative` Hosting site (https://pranavainnovative.web.app) in the
`pursuits-firebase` project — set by `"site"` in `firebase.json` and the project in `.firebaserc`.
The project's default site (PursuitMate) is not affected.

To try changes on a temporary private URL first (the live site is untouched):

```bash
firebase hosting:channel:deploy preview --expires 1d
```

### Caching

Files under `/assets/` are cached by browsers for a year. Before every deploy,
`scripts/stamp-assets.mjs` adds a fingerprint (`?v=…`) of each file's contents to the links in the
HTML, so a changed CSS file or photo is picked up immediately. Commit the updated HTML afterwards.
Pages themselves are always re-checked, so text changes show up straight away.

Fonts are not fingerprinted (the stylesheet links to them directly). If you ever replace a font
file, give it a new file name.

### Pointing www.pranavainnovative.com at Firebase

1. Firebase console → Hosting → **Add custom domain** → `www.pranavainnovative.com`
   (and `pranavainnovative.com`, set to redirect to `www`).
2. Add the TXT / A records Firebase shows at the domain's DNS provider (currently BigRock).
3. Wait for the SSL certificate to be issued (usually under an hour, up to 24 hours).

Until the domain is switched, the site is only on its `*.web.app` address. The canonical tags,
sitemap and social-share tags already point at `https://www.pranavainnovative.com`.

## Forms

The Careers and Contact forms have no backend. On submit they open the visitor's email app with
a pre-filled message to `info@pranavainnovative.com`; applicants attach their resume there.
For visitors without an email app (e.g. Gmail in the browser), the confirmation box offers
**Open in Gmail**, **Open in Outlook** and **Copy details**.

To collect submissions server-side instead (Firestore + Cloud Functions, or a form service),
replace the `data-mailto` handler in `assets/js/main.js`.

## Editing content

- Text: edit the relevant HTML file in `public/`.
- Job openings: copy a `<article class="job-card">` block in `careers.html`. Also add the Job ID
  to the `<datalist id="job-list">` there.
- Photos: each photo exists in up to three widths — `name-480.webp`, `name-800.webp` and
  `name.webp` (900 or 1200px) — and pages list them in `srcset` so phones download the small
  ones. When replacing a photo, replace all of its sizes.
- Colours and fonts: CSS variables at the top of `assets/css/styles.css`. The orange
  (`--orange`) and blue (`--blue`) come from the logo.
- The logo source is only 123×111 px (the largest available from the old site), so it is shown
  at small sizes. A high-resolution or vector (SVG) version would let it be used larger.
