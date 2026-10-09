import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import fs from "node:fs";
import remarkSnippets from "./remark-snippets.mjs";

// Addresses of pages whose SEO group ticks "hidden", so the sitemap leaves them
// out (the page itself also says noindex). pages/home.md is "/", pages/x.md is
// "/x/", posts/a/b.md(x) is "/journal/a/b/".
// ponytail: a line match on "hidden: true", not a YAML parse — fine for what
// Orbit writes; parse the frontmatter if hand-edited files ever trip it.
function hiddenPages() {
  const found = [];
  for (const [dir, base] of [
    ["src/content/pages", ""],
    ["src/content/posts", "journal/"],
  ]) {
    for (const file of fs.readdirSync(dir, { recursive: true })) {
      if (!/\.mdx?$/.test(file)) continue;
      if (!/^\s+hidden:\s*true\s*$/m.test(fs.readFileSync(`${dir}/${file}`, "utf8"))) continue;
      const id = file.replace(/\.mdx?$/, "");
      found.push("/" + (base === "" && id === "home" ? "" : `${base}${id}/`));
    }
  }
  return found;
}
const hidden = hiddenPages();

export default defineConfig({
  site: "https://demo.orbitmarkdown.com",
  // SVG heroes need no optimization — passthrough avoids the sharp dependency.
  image: { service: passthroughImageService() },
  // Prism colours code with CSS classes; Astro's default (Shiki) uses inline
  // style attributes, which the CSP below doesn't allow.
  markdown: { remarkPlugins: [remarkSnippets], syntaxHighlight: "prism" },
  integrations: [
    mdx(),
    sitemap({ filter: (page) => !hidden.some((p) => new URL(page).pathname === p) }),
  ],
  // Content-Security-Policy as a <meta> tag on every page: Astro hashes the
  // site's own inline scripts and styles, so nothing else can run — and nothing
  // inline is allowed (no style="…" attributes; use a class). frame-ancestors
  // can't go in a <meta> tag — it's a header in public/_headers.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
      ],
    },
  },
});
