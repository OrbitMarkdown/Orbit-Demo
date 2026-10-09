// Share pictures (Open Graph), one per page, made at build time: the Fernway
// mark, the page's title and its part of the site. Served at /og/<page>.png;
// Base.astro uses it unless the page's SEO group sets its own picture.
import { getCollection } from "astro:content";
import { OGImageRoute } from "astro-og-canvas";

interface SharePage {
  title: string;
  section: string;
}

const pageEntries = await getCollection("pages");
const heading = (id: string) => pageEntries.find((p) => p.id === id)?.data.heading ?? "";
const posts = await getCollection("posts");

const pages: Record<string, SharePage> = {
  index: { title: heading("home"), section: "Fernway Coffee" },
  about: { title: heading("about"), section: "About" },
  menu: { title: heading("menu"), section: "Menu" },
  journal: { title: heading("journal"), section: "Journal" },
  ...Object.fromEntries(
    posts.map((post) => [
      `journal/${post.id}`,
      { title: post.data.title, section: `Journal · ${post.data.category}` },
    ]),
  ),
};

// The site's colours (src/styles/global.css) as RGB.
const cream: [number, number, number] = [250, 246, 240];
const espresso: [number, number, number] = [61, 36, 21];
const accent: [number, number, number] = [161, 92, 46];

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getSlug: (key) => `${key}.png`,
  getImageOptions: (_key, page: SharePage) => ({
    title: page.title,
    description: page.section,
    logo: { path: "./src/assets/og/logo.png", size: [96] },
    bgGradient: [cream, [244, 233, 220]],
    border: { color: accent, width: 12, side: "inline-start" },
    padding: 72,
    fonts: ["./src/assets/og/inter-400.ttf", "./src/assets/og/inter-700.ttf"],
    font: {
      title: { families: ["Inter"], weight: "Bold", size: 64, color: espresso, lineHeight: 1.15 },
      description: { families: ["Inter"], weight: "Normal", size: 32, color: accent },
    },
  }),
});
