# Fernway Coffee — Orbit demo site

A small, **fictional** Astro site (a made-up neighbourhood coffee roaster) built to
**demo Orbit MD**. Every name, logo, image and word here is original
and invented — no real brand or third-party content — so it's safe to feature in
Orbit's marketing.

> Open it in Orbit from **Help ▸ Open the Demo Site** (or the link on Orbit's start
> screen) to try editing. It's also a clean **example site** to copy from.

## Run it

```sh
npm install
npm run dev      # the site at localhost:4321
npm run check    # types, formatting, build, then each page's SEO, share picture and CSP
npm run format   # fix formatting
```

Code is formatted with Prettier (100 columns, with the Astro plugin). Content and
data files (`src/content/`, `src/data/`) are left as Orbit writes them.

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

Governed by `orbit.config.yaml` (title _Fernway Coffee_, `defaultRole: editor`, a
single publishing branch (`main`), per-collection add rules, `Callout` + `Figure` MDX
components, and `snippets.compileOnSave: false`).

## Feature map — how each Orbit feature is set up here

Every Orbit feature this site uses, and the file(s) to read to copy it into your own site.

| Feature                      | What editors see                                                                                                                                                                         | Where to look                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Typed form**               | One control per field: text, date picker, dropdowns, list, image, tick box, collapsible group                                                                                            | `posts` schema in `src/content.config.ts`                                                                                          |
| **Sub-folders**              | `posts` as a folder tree (`guides/`, `archive/`)                                                                                                                                         | `**/*.{md,mdx}` glob in `src/content.config.ts`; `src/content/posts/guides/`, `…/archive/`                                         |
| **Folder-safe routes**       | Pages in folders get folder URLs (`/journal/guides/dialling-in-espresso`)                                                                                                                | the rest route `src/pages/journal/[...slug].astro`, and links built from `p.id` in `src/pages/journal/index.astro`                 |
| **Editors creating folders** | A _new folder_ field in the + box for `posts`                                                                                                                                            | `newFolders: true` in `orbit.config.yaml` — only safe because of the rest route above                                              |
| **Per-folder add rules**     | `archive` isn't offered for new posts                                                                                                                                                    | `noAddTo: ["archive"]` in `orbit.config.yaml` (a folder includes everything inside it)                                             |
| **Markdown or MDX**          | A _type_ choice for new posts                                                                                                                                                            | `{md,mdx}` in the glob + `@astrojs/mdx` in `package.json` / `astro.config.mjs`                                                     |
| **MDX components**           | Insert ▸ Component, with a props form                                                                                                                                                    | `components:` in `orbit.config.yaml`; `src/components/Callout.astro`, `Figure.astro`; used in the `.mdx` posts                     |
| **Snippets**                 | `[[opening-hours]]`, `[[address]]` from the Insert menu                                                                                                                                  | `src/content/snippets/`; expanded at build by `remark-snippets.mjs` (`snippets.compileOnSave: false`)                              |
| **Frontmatter-only**         | `specials` shows the form, no text editor                                                                                                                                                | `bodyless: true` in `orbit.config.yaml`; `specials` in `src/content.config.ts`; rendered on `src/pages/menu.astro`                 |
| **Fixed pages**              | `pages` (home, about) editable, but no **+**                                                                                                                                             | `pages: canAdd: false` in `orbit.config.yaml` (`readOnly: true` would lock them)                                                   |
| **Images & image folders**   | Images tab and picker, browsing `heroes/`, `posts/`, `team/`                                                                                                                             | `assetsDir: src/assets`; `image()` fields in the schemas; relative paths in frontmatter and bodies                                 |
| **Data files**               | _Main navigation_ / _Footer navigation_ under Data                                                                                                                                       | `data:` in `orbit.config.yaml`; `src/data/nav.json`, `footer.json`, read by `src/layouts/Base.astro`                               |
| **Publishing**               | Publish goes straight to `main` (one branch, no review step). Visitors can edit the demo in Orbit, but publishing is off: their edits stay on their computer, and _Start over_ resets it | `branches:` in `orbit.config.yaml`                                                                                                 |
| **Site identity**            | Name and icon in Orbit                                                                                                                                                                   | `site:` in `orbit.config.yaml`; `public/favicon.svg`                                                                               |
| **SEO & sharing**            | An _SEO_ group on every page and post: search title, description, share picture, and _hidden_ (out of search results and the sitemap)                                                    | the `seo` helper in `src/content.config.ts`; read by `src/layouts/Base.astro`; share pictures made in `src/pages/og/[...route].ts` |

Full developer docs: [orbitmarkdown.com/docs](https://orbitmarkdown.com/docs/astro/overview).

## Pages

`/` home · `/menu` (with this week's specials) · `/journal` + `/journal/<post>` (and `/journal/<folder>/<post>`) · `/about` (with the team)

## Search, sharing and security

- Every page has a description, canonical address, Open Graph tags and a share
  picture (made from its title at build time, unless its SEO group sets one).
  Posts carry article structured data. `@astrojs/sitemap` + `public/robots.txt`.
- Content-Security-Policy via Astro (`security.csp` in `astro.config.mjs`): the
  site's own scripts and styles only, nothing inline — so no `style="…"`
  attributes (code is highlighted with Prism, which uses classes). Other
  security headers are in `public/_headers` (Netlify).
- No structured data for the café as a local business: Fernway is fictional, and
  its made-up address shouldn't reach maps or local search.
