// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://yourname.pages.dev", // ← cseréld le a saját Cloudflare Pages URL-re
  integrations: [
    tailwind(),
    sitemap(),
  ],
  // Pure SSG – zero client JS by default
  output: "static",
});
