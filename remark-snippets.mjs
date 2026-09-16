import fs from "node:fs";
import path from "node:path";

// Build-time snippet loader: expands [[name]] placeholders from
// src/content/snippets/<name>.md. This is the "site has a loader"
// (snippets.compileOnSave: false) setup — the source keeps its [[name]]
// placeholders (so Orbit shows them), and the built site renders the text.
const dir = path.resolve("./src/content/snippets");

function load() {
  const map = {};
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".md")) {
      map[f.replace(/\.md$/, "")] = fs.readFileSync(path.join(dir, f), "utf8").trim();
    }
  }
  return map;
}

function walk(node, fn) {
  if (node.type === "text" && typeof node.value === "string") fn(node);
  if (Array.isArray(node.children)) for (const c of node.children) walk(c, fn);
}

export default function remarkSnippets() {
  const snippets = load();
  return (tree) => {
    walk(tree, (n) => {
      if (n.value.includes("[[")) {
        n.value = n.value.replace(/\[\[([\w-]+)\]\]/g, (m, name) =>
          name in snippets ? snippets[name] : m,
        );
      }
    });
  };
}
