import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config. VITE_API_URL is read at build time (see .env.production).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
});
