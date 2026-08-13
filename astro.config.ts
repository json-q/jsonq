import { unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, svgoOptimizer } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { loadEnv } from "vite";
import config from "./astro-paper.config";
import { transformerFileName } from "./src/utils/transformers/fileName";

// Only optimize image in netlify
const isNetlify = process.env.IN_NETLIFY !== "false";

// .env vars are not auto-loaded into `import.meta.env` while evaluating
// astro-paper.config.ts from the config loader, so load them explicitly.
// https://github.com/withastro/astro/issues/12667
const env = loadEnv(process.env.NODE_ENV || "", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL || config.site.url,
  integrations: [mdx(), sitemap()],
  devToolbar: {
    enabled: false,
  },
  markdown: {
    processor: unified({
      remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    }),
    shikiConfig: {
      // For more themes, visit https://shiki.style/themes
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  image: {
    responsiveStyles: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
  adapter: process.env.NODE_ENV !== "development" && isNetlify ? netlify() : undefined,
});
