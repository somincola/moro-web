import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { partytownVite } from "@qwik.dev/partytown/utils";

// Exercise the same static markup + enhancements during local development.
// The renderer runs in Node, never in the browser's critical rendering path.
function prerenderDev() {
  return {
    name: "moro-prerender-dev",
    apply: "serve",
    transformIndexHtml: {
      order: "pre",
      async handler(html, context) {
        if (!context.server) return html;
        const { render } = await context.server.ssrLoadModule("/src/entry-server.jsx");
        const path = new URL(context.originalUrl || "/", "http://localhost").pathname;
        return html.replace('<div id="root"></div>', () => `<div id="root">${render(path)}</div>`);
      },
    },
  };
}

export default defineConfig({
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    manifest: true,
    // Vite's hashed bundles live under /_app so they can be cached forever,
    // separately from the un-hashed images in /assets.
    assetsDir: "_app",
  },
  plugins: [react(), prerenderDev(), partytownVite()],
});
