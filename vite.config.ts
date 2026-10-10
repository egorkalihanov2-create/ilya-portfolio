import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { createContentApi } from "./server/content-api.mjs";

export default defineConfig({
  base: "./",
  server: {
    watch: {
      ignored: ["**/public/content/**", "**/public/uploads/**", "**/.content-backups/**"],
    },
  },
  build: {
    rollupOptions: {
      input: {
        site: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
      },
    },
  },
  plugins: [
    react(),
    {
      name: "case-content-api",
      async configureServer(server) {
        const api = await createContentApi({ root: server.config.root, development: true });
        server.middlewares.use((req, res, next) => {
          if (req.url === "/admin" || req.url === "/admin/") req.url = "/admin.html";
          api.handler(req, res, next);
        });
      },
      handleHotUpdate({ file }) {
        if (file.includes("/public/content/") || file.includes("\\public\\content\\")) return [];
      },
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
