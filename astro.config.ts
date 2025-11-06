import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import sitemap from "@astrojs/sitemap";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import { loadEnv } from "vite";
import { transformerFileName } from "./src/utils/transformers/fileName";

// https://github.com/withastro/astro/issues/12667
// https://docs.astro.build/en/guides/environment-variables/#in-the-astro-config-file
const env = loadEnv(process.env.NODE_ENV || "", process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: env.PUBLIC_SITE_URL,
  integrations: [sitemap(), mdx()],
  devToolbar: {
    enabled: false,
  },
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
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
  vite: {
    plugins: [
      // https://github.com/withastro/astro/issues/14030
      tailwindcss(),
    ],
  },
  adapter: netlify(),
});
