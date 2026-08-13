/**
 * Internal resolved configuration used throughout the codebase.
 *
 * Prefer editing `astro-paper.config.ts` instead of this file. This module exists to
 * apply defaults and expose a fully-resolved config shape (`ResolvedAstroPaperConfig`).
 */

import userConfig from "@/astro-paper.config";
import type { ResolvedAstroPaperConfig } from "./types/config";

const config: ResolvedAstroPaperConfig = {
  site: {
    ...userConfig.site,
    lang: userConfig.site.lang ?? "zh-CN",
    timezone: userConfig.site.timezone ?? "Asia/Shanghai",
    dir: userConfig.site.dir ?? "ltr",
  },
  posts: {
    perPage: userConfig.posts?.perPage ?? 10,
    perIndex: userConfig.posts?.perIndex ?? 5,
  },
  features: {
    lightAndDarkMode: userConfig.features?.lightAndDarkMode ?? true,
    showBackButton: userConfig.features?.showBackButton ?? true,
    search: userConfig.features?.search ?? "pagefind",
  },
  socials: userConfig.socials ?? [],
};

export default config;
