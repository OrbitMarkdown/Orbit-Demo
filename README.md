# Fernway Coffee — Orbit demo site

A small, **fictional** Astro site (a made-up neighbourhood coffee roaster) built to
**demo and screenshot Orbit MD**. Every name, logo, image and word here is original
and invented — no real brand or third-party content — so it's safe to feature in
Orbit's marketing.

> Its own repo — not app code, not the marketing site. Doubles as a clean public
> **example site** and a candidate for the live "try it" demo.

## Run it
```sh
npm install
npm run dev
```

## Why it's shaped this way
The content model is deliberately varied so Orbit's editor forms show every control:
- **`posts`** (journal) — string, long text, **date**, two **enums** (author, category),
  an **array** (tags), an **image** (`heroImage`), a **boolean** (featured), and a
  nested **object** (`seo`). Bodies use inline images, `[[snippet]]` placeholders,
  and `.mdx` posts use the `<Callout>` and `<Figure>` components.
- **`drinks`** (menu) — **number** (price), enums (category, size), boolean (available).
- **`team`** (About) — an **image** avatar per member, a role, and a bio body.
- **`pages`** — simple home/about heroes.
- **`snippets/`** — reusable blocks (`opening-hours`, `address`), expanded at build
  by `remark-snippets.mjs` (the `snippets.compileOnSave: false` "site has a loader"
  setup — the source keeps its `[[name]]` placeholders for Orbit to show).

Governed by `orbit.config.yaml` (title *Fernway Coffee*, `defaultRole: editor`, a
`preview` review branch, per-collection add rules, `Callout` + `Figure` MDX
components, and `snippets.compileOnSave: false`).

## Pages
`/` home · `/menu` · `/journal` + `/journal/<post>` · `/about` (with the team)

## Deploy & reset (live "try it" demo)
Two branches drive the hosted demo:

| Branch | Role | Deploys to |
|--------|------|------------|
| **`main`** | pristine, known-good default (source of truth; never force-pushed) | — |
| **`preview`** | what Orbit edits *and* what the host serves | **`demo.orbitmarkdown.com`** |

- **Host:** deploy the **`preview`** branch (production branch on Cloudflare Pages /
  Netlify) and attach the custom domain **`demo.orbitmarkdown.com`**. The marketing
  site lives separately at **`orbitmarkdown.com`** (what the demo's corner ribbon
  links to via `ORBIT_URL` in `src/layouts/Base.astro`).
- **Reset:** `.github/workflows/reset-demo.yml` runs on a cron (~15 min) and force-resets
  `preview` back to `main` **only when it has drifted** (i.e. after a real edit), so the
  host rebuilds only when needed. It must live on `main` (scheduled workflows run from
  the default branch), and has a manual "Run workflow" button too.
- **One-time setup:** create the branch with `git push origin main:preview`, then point
  the host at it.

## Marketing screenshots
`scripts/capture-screenshots.mjs` drives Orbit editing this demo (headless Chrome +
the DevTools Protocol) and saves crisp 2× PNGs of each screen. Re-run it whenever the
app UI changes. Needs only Node 22+ and Google Chrome — no npm install.

```sh
# in the Orbit app repo:  wails dev      (serves the bridge at :34115)
node scripts/capture-screenshots.mjs     # writes to ../orbit-marketing/public/screenshots
```
Override the target with `OUT=/some/dir`; the app bridge with `APP=`; Chrome with `CHROME=`.
