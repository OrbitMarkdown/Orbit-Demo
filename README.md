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
- **`specials`** — frontmatter-only entries (no body) for the menu page.
- **`snippets/`** — reusable blocks (`opening-hours`, `address`), expanded at build
  by `remark-snippets.mjs` (the `snippets.compileOnSave: false` "site has a loader"
  setup — the source keeps its `[[name]]` placeholders for Orbit to show).

Governed by `orbit.config.yaml` (title *Fernway Coffee*, `defaultRole: editor`, a
`preview` review branch, per-collection add rules, `Callout` + `Figure` MDX
components, and `snippets.compileOnSave: false`).

## Feature map — how each Orbit feature is set up here
Every Orbit feature this site uses, and the file(s) to read to copy it into your own site.

| Feature | What editors see | Where to look |
|---|---|---|
| **Typed form** | One control per field: text, date picker, dropdowns, list, image, tick box, collapsible group | `posts` schema in `src/content.config.ts` |
| **Sub-folders** | `posts` as a folder tree (`guides/`, `archive/`) | `**/*.{md,mdx}` glob in `src/content.config.ts`; `src/content/posts/guides/`, `…/archive/` |
| **Folder-safe routes** | Pages in folders get folder URLs (`/journal/guides/dialling-in-espresso`) | the rest route `src/pages/journal/[...slug].astro`, and links built from `p.id` in `src/pages/journal/index.astro` |
| **Editors creating folders** | A *new folder* field in the + box for `posts` | `newFolders: true` in `orbit.config.yaml` — only safe because of the rest route above |
| **Per-folder add rules** | `archive` isn't offered for new posts | `noAddTo: ["archive/**"]` in `orbit.config.yaml` |
| **Markdown or MDX** | A *type* choice for new posts | `{md,mdx}` in the glob + `@astrojs/mdx` in `package.json` / `astro.config.mjs` |
| **MDX components** | Insert ▸ Component, with a props form | `components:` in `orbit.config.yaml`; `src/components/Callout.astro`, `Figure.astro`; used in the `.mdx` posts |
| **Snippets** | `[[opening-hours]]`, `[[address]]` from the Insert menu | `src/content/snippets/`; expanded at build by `remark-snippets.mjs` (`snippets.compileOnSave: false`) |
| **Frontmatter-only** | `specials` shows the form, no text editor | `bodyless: true` in `orbit.config.yaml`; `specials` in `src/content.config.ts`; rendered on `src/pages/menu.astro` |
| **Fixed pages** | `pages` (home, about) editable, but no **+** | `pages: canAdd: false` in `orbit.config.yaml` (`readOnly: true` would lock them) |
| **Images & image folders** | Images tab and picker, browsing `heroes/`, `posts/`, `team/` | `assetsDir: src/assets`; `image()` fields in the schemas; relative paths in frontmatter and bodies |
| **Data files** | *Main navigation* / *Footer navigation* under Data | `data:` in `orbit.config.yaml`; `src/data/nav.json`, `footer.json`, read by `src/layouts/Base.astro` |
| **Branches & review** | Editors publish to `preview` | `branches:` in `orbit.config.yaml`; the `preview` branch (see *Deploy & reset*) |
| **Site identity** | Name and icon in Orbit | `site:` in `orbit.config.yaml`; `public/favicon.svg` |

Full developer docs: [orbitmarkdown.com/docs](https://orbitmarkdown.com/docs/astro/overview).

## Pages
`/` home · `/menu` (with this week's specials) · `/journal` + `/journal/<post>` (and `/journal/<folder>/<post>`) · `/about` (with the team)

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
