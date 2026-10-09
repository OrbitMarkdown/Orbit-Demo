// Checks every built page (dist/**/index.html) for what search engines, social
// sites and browsers need: a unique title, a description, a canonical address,
// a social image that exists, valid structured data, the CSP, and safe
// new-tab links. Redirect pages are skipped. Run after a build: npm run check.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const pages = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.html") pages.push(full);
  }
})(dist);

const problems = [];
let checked = 0;
const titles = new Map();
const attr = (html, re) => html.match(re)?.[1];

for (const file of pages) {
  const html = fs.readFileSync(file, "utf8");
  if (/http-equiv="refresh"/i.test(html)) continue; // a redirect from an old address
  checked++;
  const page = "/" + path.relative(dist, path.dirname(file));
  const fail = (msg) => problems.push(`${page}: ${msg}`);

  const title = attr(html, /<title>([^<]*)<\/title>/);
  if (!title) fail("no <title>");
  else titles.set(title, [...(titles.get(title) ?? []), page]);

  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  const hidden = /<meta name="robots" content="noindex"/.test(html); // not in search results
  if (!description) fail("no description");
  else if ((!hidden && description.length < 50) || description.length > 170)
    fail(`description is ${description.length} characters (aim for 50–170)`);

  if (!/<link rel="canonical" href="https:\/\/demo\.orbitmarkdown\.com\//.test(html))
    fail("no canonical address");

  const image = attr(
    html,
    /<meta property="og:image" content="https:\/\/demo\.orbitmarkdown\.com(\/[^"]+)"/,
  );
  if (!image) fail("no og:image");
  else if (!fs.existsSync(path.join(dist, image)))
    fail(`social image missing: ${image} (add the page to src/pages/og/[...route].ts)`);

  for (const json of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json[1]);
    } catch {
      fail("structured data isn't valid JSON");
    }
  }

  if (!/http-equiv="content-security-policy"/i.test(html)) fail("no Content-Security-Policy");
  const inlineStyle = html.match(/<[a-z][^>]*\sstyle="[^"]*"/);
  if (inlineStyle)
    fail(`inline style (the CSP blocks it — use a class): ${inlineStyle[0].slice(0, 80)}`);

  for (const link of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener/.test(link[0]))
      fail(`new-tab link without rel="noopener": ${link[0].slice(0, 80)}`);
  }
}

for (const [title, where] of titles) {
  if (where.length > 1) problems.push(`title "${title}" is used by ${where.join(", ")}`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\n${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`SEO check: ${checked} pages OK (${pages.length - checked} redirects skipped)`);
