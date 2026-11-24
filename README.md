# SmartSchool – website

Public landing page and installation guide for **SmartSchool**, the free, open-source school management system
(app source: https://github.com/Charles494-prog/SmartSchoolWebsite).

Plain HTML + CSS + vanilla JavaScript. No build step, no external fonts, CDNs or trackers.

## Folder structure
```
index.html                 page layout (text comes from i18n files)
css/styles.css             all styles (colors are CSS variables at the top; dark mode via prefers-color-scheme)
js/app.js                  translations, data-driven sections, OS detection, copy buttons
i18n/en.json, i18n/tl.json every visible string, English and Tagalog
data/stats.json            figures for "The problem" (all [TODO] until you add sources)
data/evidence.json         news articles / official documents for "Evidence"
data/photos.json           "Our schools" photo gallery (credit + license required)
data/install-steps.json    the install guide, per device, plus checklist and troubleshooting
data/release.json          version, download links, file sizes, SHA-256 checksums
assets/                    logo and images (SVG/WebP only)
scripts/optimize-images.sh resize + convert images to WebP
TRANSLATION_REVIEW.md      Tagalog strings a native speaker should check
PHOTO_GUIDELINES.md        rules for photos, especially of children
```

## Preview locally
The page loads its text and data with `fetch`, so open it through a small local server (double-clicking `index.html` won't load the text):
```sh
python3 -m http.server 8080      # then open http://localhost:8080
```

## Edit text
Change the value in **both** `i18n/en.json` and `i18n/tl.json` (same key in each). Keys are used in `index.html` as `data-i18n="key"`.
To add a new text: add the key to both files and use `data-i18n="your.key"` on the element. Missing keys are reported in the browser console.

## Edit the install guide
Everything is in `data/install-steps.json`: `before` (checklist + time), `steps[]` (the 5 main steps: `title`, `text`, optional `command`, `screenshot`, and `choose_help: true` for the "Not sure? Read this" box), `choose_help` (LAN vs Online good-for / keep-in-mind lists), `advanced` (the one-command Linux install and the web-hosting steps) and `troubleshooting[]`. Each text has `en` and `tl`.

**One source of truth for the mode:** the LAN / Online choice is made only inside the installer (it writes `SMARTSCHOOL_MODE` in the app's `.env`). The website never asks it before the download – keep it that way.

## Add an evidence entry
Edit `data/evidence.json` and replace a `[TODO]` entry (or add a new one):
```json
{ "type": "article", "headline": "…", "outlet": "…", "date": "2026-01-31", "url": "https://…",
  "summary_en": "In your own words…", "summary_tl": "Sa sariling salita…",
  "image": "assets/evidence/coa-2025-excerpt.webp", "image_alt_en": "…", "image_alt_tl": "…" }
```
- `type` is `article` or `official-document`. Write the summary **in your own words**; never copy the article.
- The card only shows when `url` is set and the headline has no `[TODO]`.
- `image` is optional and must be **your own** file in `assets/evidence/` (a crop/screenshot you made). Never link images from other sites.

## Add a photo
1. Read `PHOTO_GUIDELINES.md` (consent rules for minors!).
2. Put the file in `assets/photos/` and run `./scripts/optimize-images.sh`.
3. Add an entry in `data/photos.json` with `file`, `width`, `height`, `alt_en`, `alt_tl`, `caption_en`, `caption_tl`, **`credit`**, **`license`** and `source_url`.
   Entries without `credit` or `license` are not shown (a warning appears in the browser console).

## Optimize images
```sh
./scripts/optimize-images.sh          # needs ImageMagick or cwebp
```
Converts everything in `assets/evidence` and `assets/photos` to WebP, max 1200 px wide. Update file names and width/height in the JSON afterwards.

## Release a new version
Edit `data/release.json`: `version`, `date`, and for each platform `url`, `size_mb` and `sha256` (`Get-FileHash -Algorithm SHA256` on Windows, `shasum -a 256` on Mac/Linux). An empty `url` shows "Coming soon".

## Deploy
- **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
- **Netlify:** drag the folder onto app.netlify.com, or connect the repo (no build command, publish directory `/`).

## TODO list
Find them all with `grep -rn TODO .`

| Where | What |
|---|---|
| `data/stats.json` | 4 figures for "The problem" + source links (e.g. COA reports, PhilGEPS, DepEd budget documents) |
| `data/evidence.json` | 3 placeholder entries → verified articles/official documents |
| `data/photos.json` | Replace 2 illustration placeholders with real, properly licensed photos |
| `data/release.json` | Version, date, download URLs, file sizes, SHA-256 checksums |
| `data/install-steps.json` | Screenshots for every step; confirm steps when the installer format is final |
| `index.html` (Open source + footer) | `[TODO: license]` – choose the license (e.g. MIT, GPL-3.0, AGPL-3.0) |
| `TRANSLATION_REVIEW.md` | Native-speaker review of the Tagalog text |

## Facts policy
Do not add statistics, peso amounts, contract values or company names without a source link. Criticize spending patterns and unused features, not individuals.
SmartSchool is an independent community project, not affiliated with DepEd or any government agency.
