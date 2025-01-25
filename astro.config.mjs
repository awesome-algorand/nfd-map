// @ts-check
import { defineConfig } from "astro/config";
// Adapters
import cloudflare from "@astrojs/cloudflare";
// Integrations
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://map.awesomealgo.com",
  integrations: [
    mdx(),
    sitemap(),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  adapter: cloudflare({
    imageService: "cloudflare",
    platformProxy: {
      enabled: true,
    },
  }),
  output: "server",
  vite: {
    resolve: {
      alias:
        (import.meta.env.PROD && {
          "react-dom/server": "react-dom/server.edge",
        }) ||
        undefined,
    },
    build: {
      minify: false,
    },
  },
});
