import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { partytownVite } from "@qwik.dev/partytown/utils";

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
  plugins: [react(), partytownVite()],
});
