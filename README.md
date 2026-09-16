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
  nested **object** (`seo`). One post is `.mdx` and uses a `<Callout>` component.
- **`drinks`** (menu) — **number** (price), enums (category, size), boolean (available).
- **`pages`** — simple home/about heroes.
- **`snippets/`** — reusable blocks (`opening-hours`, `address`).

Governed by `orbit.config.yaml` (title *Fernway Coffee*, `defaultRole: editor`, a
`preview` review branch, per-collection add rules, a `Callout` MDX component, and
`snippets.compileOnSave`).

## Pages
`/` home · `/menu` · `/journal` + `/journal/<post>` · `/about`
