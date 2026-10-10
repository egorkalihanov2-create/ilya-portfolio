import { createReadStream } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { randomBytes, randomUUID, scrypt, scryptSync, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import path from "node:path";
import { validateCatalog } from "./catalog-schema.mjs";

const derive = promisify(scrypt);
const MAX_UPLOAD = 100 * 1024 * 1024;
const SESSION_MS = 8 * 60 * 60 * 1000;
const error = (status, message) => Object.assign(new Error(message), { status });
const loopback = (address) => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address);
const localHost = (host) => /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host || "");

function json(res, statusCode, value) {
  const payload = Buffer.from(JSON.stringify(value));
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": String(payload.length),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(payload);
}

async function body(req, max) {
  if (Number(req.headers["content-length"]) > max) {
    req.resume();
    throw error(413, `Файл превышает ${Math.round(max / 1024 / 1024)} МБ`);
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let exceeded = false;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > max) {
        if (!exceeded) reject(error(413, "Превышен размер запроса"));
        exceeded = true;
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => { if (!exceeded) resolve(Buffer.concat(chunks)); });
    req.on("error", reject);
    req.on("aborted", () => reject(error(400, "Загрузка прервана")));
  });
}

async function parse(req, max = 3 * 1024 * 1024) {
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    throw error(415, "Ожидается JSON");
  }
  try {
    return JSON.parse((await body(req, max)).toString("utf8"));
  } catch (cause) {
    throw cause.status ? cause : error(400, "Некорректный JSON");
  }
}

function fileType(buffer, declared) {
  const ascii = (start, end) => buffer.toString("ascii", start, end);
  if (declared === "image/png" && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (declared === "image/jpeg" && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) return "jpg";
  if (declared === "image/gif" && ["GIF87a", "GIF89a"].includes(ascii(0, 6))) return "gif";
  if (declared === "image/webp" && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  if (declared === "video/mp4" && ascii(4, 8) === "ftyp") return "mp4";
  if (declared === "video/webm" && buffer.subarray(0, 4).equals(Buffer.from([26, 69, 223, 163]))) return "webm";
  throw error(415, "Поддерживаются PNG, JPG, GIF, WebP, MP4 и WebM");
}

const mime = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  mp4: "video/mp4",
  webm: "video/webm",
};

async function sendFile(req, res, file) {
  const info = await stat(file);
  if (!info.isFile()) throw error(404, "Файл не найден");
  let start = 0;
  let end = info.size - 1;
  if (req.headers.range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (!match) throw error(416, "Некорректный диапазон");
    if (match[1]) start = Number(match[1]);
    if (match[2]) end = Math.min(end, Number(match[2]));
    if (!match[1] && match[2]) start = Math.max(0, info.size - Number(match[2]));
    if (start > end || start >= info.size) throw error(416, "Диапазон вне файла");
    res.statusCode = 206;
    res.setHeader("Content-Range", `bytes ${start}-${end}/${info.size}`);
  }
  const ext = path.extname(file).slice(1).toLowerCase();
  res.setHeader("Content-Type", mime[ext] || "application/octet-stream");
  res.setHeader("Content-Length", String(Math.max(0, end - start + 1)));
  res.setHeader("Accept-Ranges", "bytes");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method === "HEAD") res.end();
  else createReadStream(file, { start, end }).on("error", () => res.destroy()).pipe(res);
}

export async function createContentApi({
  root,
  dataDir = path.join(root, "public"),
  development = false,
  allowLocal = false,
  password = "",
  siteOrigin = "",
}) {
  if (!development && !allowLocal && (password.length < 16 || password.length > 256)) {
    throw new Error("Задайте ADMIN_PASSWORD длиной от 16 до 256 символов");
  }
  if (siteOrigin && (!siteOrigin.startsWith("https://") || new URL(siteOrigin).origin !== siteOrigin)) {
    throw new Error("SITE_ORIGIN должен быть точным HTTPS origin");
  }
  const catalogPath = path.join(dataDir, "content", "cases.json");
  const bundledCatalog = path.join(root, "public", "content", "cases.json");
  const uploads = path.join(dataDir, "uploads");
  const bundledUploads = path.join(root, "public", "uploads");
  const uploadRoots = path.resolve(uploads) === path.resolve(bundledUploads)
    ? [uploads]
    : [uploads, bundledUploads];
  const backups = path.resolve(dataDir) === path.resolve(path.join(root, "public"))
    ? path.join(root, ".content-backups")
    : path.join(dataDir, ".private", "case-history");
  await mkdir(path.dirname(catalogPath), { recursive: true });
  await mkdir(uploads, { recursive: true });
  try {
    await stat(catalogPath);
  } catch (cause) {
    if (cause.code !== "ENOENT") throw cause;
    await writeFile(catalogPath, await readFile(bundledCatalog), { flag: "wx" });
  }

  const read = async () => validateCatalog(JSON.parse(await readFile(catalogPath, "utf8")));
  await read();

  const salt = randomBytes(16);
  const passwordHash = password ? scryptSync(password, salt, 64) : null;
  const sessions = new Map();
  const attempts = new Map();
  const localCsrf = randomBytes(32).toString("hex");
  let saveQueue = Promise.resolve();

  const isLocal = (req) => (development || allowLocal)
    && loopback(req.socket.remoteAddress)
    && localHost(req.headers.host);

  function session(req) {
    const token = /(?:^|;\s*)ilya_admin=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || "")?.[1];
    const value = sessions.get(token);
    if (value && value.expires <= Date.now()) {
      sessions.delete(token);
      return null;
    }
    return value ? { ...value, token } : null;
  }

  function checkOrigin(req) {
    const forwarded = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
    const protocol = ["http", "https"].includes(forwarded)
      ? forwarded
      : req.socket.encrypted ? "https" : "http";
    const expected = siteOrigin || `${protocol}://${req.headers.host}`;
    if (req.headers.origin !== expected || req.headers["sec-fetch-site"] === "cross-site") {
      throw error(403, "Запрос с другого сайта запрещён");
    }
  }

  function auth(req, mutation = false) {
    const value = isLocal(req) ? { csrf: localCsrf } : session(req);
    if (!value) throw error(401, "Войдите в админку");
    if (mutation) {
      checkOrigin(req);
      if (req.headers["x-csrf-token"] !== value.csrf) {
        throw error(403, "Обновите страницу админки и повторите действие");
      }
    }
    return value;
  }

  const secureCookie = siteOrigin.startsWith("https:") || (!development && !allowLocal);
  const cookie = (token, maxAge) => `ilya_admin=${token}; HttpOnly; SameSite=Strict; Path=/api/admin; Max-Age=${maxAge}${secureCookie ? "; Secure" : ""}`;

  async function uploadedFile(name) {
    for (const directory of uploadRoots) {
      const candidate = path.join(directory, name);
      try {
        if ((await stat(candidate)).isFile()) return candidate;
      } catch (cause) {
        if (cause.code !== "ENOENT") throw cause;
      }
    }
    return null;
  }

  const handler = async (req, res, next) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    } catch {
      return json(res, 400, { error: "Некорректный адрес" });
    }

    try {
      if (pathname.startsWith("/uploads/") && ["GET", "HEAD"].includes(req.method)) {
        const name = path.basename(pathname);
        const file = await uploadedFile(name);
        if (!file) throw error(404, "Файл не найден");
        return await sendFile(req, res, file);
      }
      if (pathname === "/content/cases.json" && req.method === "GET") {
        return json(res, 200, await read());
      }
      if (!pathname.startsWith("/api/")) return next();
      if (pathname === "/api/catalog" && req.method === "GET") return json(res, 200, await read());
      if (pathname === "/api/admin/session" && req.method === "GET") {
        const value = isLocal(req) ? { csrf: localCsrf } : session(req);
        return json(res, 200, {
          authenticated: Boolean(value),
          csrf: value?.csrf,
          mode: isLocal(req) ? "local" : "password",
          loginAvailable: Boolean(passwordHash),
          maxUploadBytes: MAX_UPLOAD,
        });
      }
      if (pathname === "/api/admin/login" && req.method === "POST") {
        checkOrigin(req);
        if (!passwordHash) throw error(403, "Удалённый вход не настроен");
        const ip = req.socket.remoteAddress;
        const attempt = attempts.get(ip) || { count: 0, until: Date.now() + 15 * 60 * 1000 };
        if (attempt.until < Date.now()) Object.assign(attempt, { count: 0, until: Date.now() + 15 * 60 * 1000 });
        if (attempt.count >= 8) throw error(429, "Слишком много попыток. Повторите через 15 минут.");
        attempt.count += 1;
        attempts.set(ip, attempt);
        const input = await parse(req, 4096);
        if (typeof input.password !== "string" || input.password.length > 256) throw error(401, "Неверный пароль");
        const candidate = await derive(input.password, salt, 64);
        if (!timingSafeEqual(candidate, passwordHash)) throw error(401, "Неверный пароль");
        attempts.delete(ip);
        const token = randomBytes(32).toString("hex");
        const csrf = randomBytes(32).toString("hex");
        sessions.set(token, { csrf, expires: Date.now() + SESSION_MS });
        res.setHeader("Set-Cookie", cookie(token, SESSION_MS / 1000));
        return json(res, 200, { authenticated: true, csrf });
      }
      if (pathname === "/api/admin/upload" && req.method === "POST") {
        auth(req, true);
        const buffer = await body(req, MAX_UPLOAD);
        const ext = fileType(buffer, req.headers["content-type"]);
        const name = `${randomUUID()}.${ext}`;
        await writeFile(path.join(uploads, name), buffer, { flag: "wx" });
        return json(res, 201, {
          src: `uploads/${name}`,
          type: ["mp4", "webm"].includes(ext) ? "video" : "image",
        });
      }
      if (pathname === "/api/admin/catalog" && req.method === "PUT") {
        auth(req, true);
        const submitted = await parse(req);
        const save = saveQueue.then(async () => {
          const previous = await read();
          const input = validateCatalog(submitted);
          if (input.revision !== previous.revision) {
            throw error(409, "Каталог изменён в другой вкладке. Обновите данные.");
          }
          const sources = input.projects.flatMap((project) => [
            project.coverImage,
            project.image,
            project.previewVideo?.src,
            project.previewVideo?.poster,
            ...project.blocks.flatMap((blockValue) => {
              if (blockValue.type === "media") return [blockValue.item.src, blockValue.item.poster].filter(Boolean);
              if (blockValue.type === "carousel") return blockValue.items.flatMap((item) => [item.src, item.poster].filter(Boolean));
              return [];
            }),
          ].filter(Boolean));
          for (const src of new Set(sources)) {
            const file = src.startsWith("uploads/")
              ? await uploadedFile(path.basename(src))
              : path.join(root, "public", src);
            if (!file) throw error(400, `Медиафайл отсутствует: ${src}`);
            try {
              if (!(await stat(file)).isFile()) throw error(400, `Медиафайл отсутствует: ${src}`);
            } catch (cause) {
              if (cause.status) throw cause;
              throw error(400, `Медиафайл отсутствует: ${src}`);
            }
          }
          input.revision = previous.revision + 1;
          await mkdir(backups, { recursive: true });
          await writeFile(
            path.join(backups, `${String(previous.revision).padStart(12, "0")}.json`),
            JSON.stringify(previous, null, 2),
          );
          const temp = `${catalogPath}.${randomUUID()}.tmp`;
          await writeFile(temp, `${JSON.stringify(input, null, 2)}\n`);
          await rename(temp, catalogPath);
          const history = (await readdir(backups)).filter((name) => /^\d+\.json$/.test(name)).sort();
          await Promise.all(history.slice(0, -10).map((name) => unlink(path.join(backups, name)).catch(() => {})));
          return input;
        });
        saveQueue = save.catch(() => {});
        return json(res, 200, await save);
      }
      throw error(404, "Маршрут не найден");
    } catch (cause) {
      if (res.headersSent || res.destroyed) return;
      if (!cause.status) console.error("Case content API:", cause);
      return json(res, cause.status || 500, {
        error: cause.status ? cause.message : "Ошибка сервера редактора",
      });
    }
  };

  return { handler, dataDir };
}
