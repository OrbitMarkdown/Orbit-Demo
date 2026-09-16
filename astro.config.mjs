import { defineConfig, passthroughImageService } from "astro/config";
import mdx from "@astrojs/mdx";
import remarkSnippets from "./remark-snippets.mjs";

export default defineConfig({
  // SVG heroes need no optimization — passthrough avoids the sharp dependency.
  image: { service: passthroughImageService() },
  markdown: { remarkPlugins: [remarkSnippets] },
  integrations: [mdx()],
});
