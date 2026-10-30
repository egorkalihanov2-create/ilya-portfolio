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
        about: fileURLToPath(new URL("./about.html", import.meta.url)),
        cases: fileURLToPath(new URL("./cases.html", import.meta.url)),
        contacts: fileURLToPath(new URL("./contacts.html", import.meta.url)),
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
          const requestUrl = new URL(req.url ?? "/", "http://localhost");
          const { pathname } = requestUrl;
          const legacyCaseId = pathname === "/cases.html"
            ? requestUrl.searchParams.get("case")
            : null;

          if (legacyCaseId) {
            res.writeHead(308, { Location: `/cases/${encodeURIComponent(legacyCaseId)}` });
            res.end();
            return;
          }

          const redirects = new Map([
            ["/", "/main"],
            ["/index.html", "/main"],
            ["/main/", "/main"],
            ["/about.html", "/about"],
            ["/about/", "/about"],
            ["/cases.html", "/cases"],
            ["/cases/", "/cases"],
            ["/contacts.html", "/contacts"],
            ["/contacts/", "/contacts"],
          ]);
          const redirectTarget = redirects.get(pathname);

          if (redirectTarget) {
            res.writeHead(308, { Location: `${redirectTarget}${requestUrl.search}` });
            res.end();
            return;
          }

          const trailingCasePath = pathname.match(/^\/cases\/([^/]+)\/$/);
          if (trailingCasePath) {
            res.writeHead(308, { Location: `/cases/${trailingCasePath[1]}${requestUrl.search}` });
            res.end();
            return;
          }

          if (pathname === "/admin" || pathname === "/admin/") req.url = "/admin.html";
          if (pathname === "/main") req.url = `/index.html${requestUrl.search}`;
          if (pathname === "/about") req.url = `/about.html${requestUrl.search}`;
          if (pathname === "/cases") req.url = `/cases.html${requestUrl.search}`;
          if (pathname === "/contacts") req.url = `/contacts.html${requestUrl.search}`;
          if (/^\/cases\/[^/]+$/.test(pathname)) req.url = `/cases.html${requestUrl.search}`;
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
