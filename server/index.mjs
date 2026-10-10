import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createContentApi } from "./content-api.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.CONTENT_DIR || path.join(root, "public"));
const api = await createContentApi({
  root,
  dataDir,
  allowLocal: process.env.LOCAL_ADMIN === "1",
  password: process.env.ADMIN_PASSWORD || "",
  siteOrigin: process.env.SITE_ORIGIN || "",
});

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
};

async function serve(req, res) {
  try {
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      return res.end();
    }
    let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/admin/") {
      res.writeHead(308, { Location: "/admin" });
      return res.end();
    }
    if (pathname === "/admin") pathname = "/admin.html";
    if (pathname === "/") pathname = "/index.html";
    if (pathname.includes("\\") || pathname.includes("\0") || pathname.split("/").some((part) => part.startsWith("."))) {
      throw new Error("invalid path");
    }
    const base = await realpath(path.join(root, "dist"));
    const file = await realpath(path.join(base, pathname.slice(1)));
    const relative = path.relative(base, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("invalid path");
    const info = await stat(file);
    if (!info.isFile()) throw new Error("not a file");
    res.setHeader("Content-Type", mime[path.extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Content-Length", String(info.size));
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
    if (req.method === "HEAD") res.end();
    else createReadStream(file).on("error", () => res.destroy()).pipe(res);
  } catch {
    if (!res.headersSent) res.writeHead(404);
    res.end("Not found");
  }
}

const server = http.createServer((req, res) => api.handler(req, res, () => serve(req, res)));
server.requestTimeout = 180000;
server.headersTimeout = 20000;
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 3000);
server.listen(port, host, () => console.log(`Ilya portfolio: http://${host}:${port}`));
