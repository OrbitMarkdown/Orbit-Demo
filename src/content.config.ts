import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// Editable single pages (home + about heroes).
const pages = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/pages" }),
  schema: z.object({
    heading: z.string(),
    subheading: z.string(),
    ctaLabel: z.string().optional(),
    ctaHref: z.string().optional(),
  }),
});

// Journal posts — a deliberately rich schema so the editor form shows every
// control: text, long text, date, enums, an array, an image, a boolean, and a
// nested (collapsible) group.
//
// Sub-folders: "**/" lets entries sit at any depth (posts/guides/…,
// posts/archive/…); an entry's id keeps its folder ("guides/dialling-in-espresso"),
// which the [...slug] route turns into /journal/guides/dialling-in-espresso.
// "{md,mdx}" + @astrojs/mdx in package.json = editors choose Markdown or MDX.
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      date: z.date(),
      author: z.enum(["Ada Brooks", "Sam Ortega", "The Fernway team"]),
      category: z.enum(["Brewing", "Journal", "Beans"]),
      tags: z.array(z.string()).default([]),
      heroImage: image().optional(),
      featured: z.boolean().default(false),
      seo: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
        })
        .optional(),
    }),
});

// Menu items — numbers, enums and a boolean (exercises those form controls).
const drinks = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/drinks" }),
  schema: z.object({
    name: z.string(),
    category: z.enum(["Espresso", "Filter", "Not coffee"]),
    price: z.number(),
    size: z.enum(["Small", "Regular", "Large"]),
    available: z.boolean().default(true),
    description: z.string(),
  }),
});

// The team — shown on the About page. Exercises an image field (avatar) in a
// second collection, with a short bio in the body.
const team = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/team" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string(),
      avatar: image(),
      order: z.number().default(0),
    }),
});

// This week's specials — frontmatter only (no body). orbit.config.yaml marks it
// `bodyless: true`, so Orbit shows just the form, no text editor.
const specials = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/specials" }),
  schema: z.object({
    name: z.string(),
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    price: z.number(),
    available: z.boolean().default(true),
  }),
});

export const collections = { pages, posts, drinks, team, specials };
