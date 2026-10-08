import fs from "node:fs";
import path from "node:path";

// Build-time snippet loader: expands [[name]] placeholders from
// src/content/snippets/<name>.md. This is the "site has a loader"
// (snippets.compileOnSave: false) setup — the source keeps its [[name]]
// placeholders (so Orbit shows them), and the built site renders the text.
const snippetsDir = path.resolve("./src/content/snippets");
const placeholder = /\[\[([\w-]+)\]\]/g; // [[opening-hours]] → "opening-hours"

// loadSnippets reads every snippet file into { name: text }.
function loadSnippets() {
  const snippets = {};
  if (!fs.existsSync(snippetsDir)) return snippets;
  for (const file of fs.readdirSync(snippetsDir)) {
    if (file.endsWith(".md")) {
      const name = file.replace(/\.md$/, "");
      snippets[name] = fs.readFileSync(path.join(snippetsDir, file), "utf8").trim();
    }
  }
  return snippets;
}

// forEachText calls visit for every text node in the Markdown tree.
function forEachText(node, visit) {
  if (node.type === "text" && typeof node.value === "string") visit(node);
  for (const child of node.children ?? []) forEachText(child, visit);
}

export default function remarkSnippets() {
  const snippets = loadSnippets();
  return (tree) => {
    forEachText(tree, (textNode) => {
      // Unknown names are left as written, so a typo shows on the page.
      textNode.value = textNode.value.replace(placeholder, (whole, name) =>
        name in snippets ? snippets[name] : whole,
      );
    });
  };
}
