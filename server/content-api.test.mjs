import assert from "node:assert/strict";
import http from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createContentApi } from "./content-api.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("local editor loads, uploads and saves a versioned catalog", async (context) => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "ilya-admin-test-"));
  context.after(() => rm(dataDir, { recursive: true, force: true }));
  const api = await createContentApi({ root, dataDir, development: true });
  const server = http.createServer((request, response) => {
    api.handler(request, response, () => {
      response.writeHead(404);
      response.end();
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const session = await fetch(`${origin}/api/admin/session`).then((response) => response.json());
  assert.equal(session.authenticated, true);
  assert.equal(session.mode, "local");
  assert.ok(session.csrf);

  const catalog = await fetch(`${origin}/api/catalog`).then((response) => response.json());
  assert.equal(catalog.version, 1);
  assert.equal(catalog.projects.length, 6);

  const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z1xkAAAAASUVORK5CYII=", "base64");
  const uploadResponse = await fetch(`${origin}/api/admin/upload`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "image/png",
      "X-CSRF-Token": session.csrf,
    },
    body: png,
  });
  assert.equal(uploadResponse.status, 201);
  const uploaded = await uploadResponse.json();
  assert.match(uploaded.src, /^uploads\/[a-f0-9-]+\.png$/);

  const mp4 = Buffer.concat([Buffer.alloc(4), Buffer.from("ftypisom"), Buffer.alloc(16)]);
  const videoUploadResponse = await fetch(`${origin}/api/admin/upload`, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "video/mp4",
      "X-CSRF-Token": session.csrf,
    },
    body: mp4,
  });
  assert.equal(videoUploadResponse.status, 201);
  const uploadedVideo = await videoUploadResponse.json();
  assert.equal(uploadedVideo.type, "video");
  assert.match(uploadedVideo.src, /^uploads\/[a-f0-9-]+\.mp4$/);

  catalog.projects[0].title = "QA title";
  catalog.projects[0].previewVideo = {
    id: "qa-preview-video",
    type: "video",
    src: uploadedVideo.src,
    autoplay: false,
    muted: false,
    controls: true,
  };
  const gallery = catalog.projects[2].blocks.find((block) => block.type === "carousel");
  assert.ok(gallery);
  gallery.layout = "grid";
  gallery.columns = 2;
  const saveResponse = await fetch(`${origin}/api/admin/catalog`, {
    method: "PUT",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "X-CSRF-Token": session.csrf,
    },
    body: JSON.stringify(catalog),
  });
  assert.equal(saveResponse.status, 200);
  const saved = await saveResponse.json();
  assert.equal(saved.revision, catalog.revision + 1);
  assert.equal(saved.projects[0].title, "QA title");
  assert.equal(saved.projects[0].previewVideo.src, uploadedVideo.src);
  assert.equal(saved.projects[2].blocks.find((block) => block.type === "carousel").layout, "grid");
  assert.equal(saved.projects[2].blocks.find((block) => block.type === "carousel").columns, 2);

  const stored = JSON.parse(await readFile(path.join(dataDir, "content", "cases.json"), "utf8"));
  assert.equal(stored.revision, catalog.revision + 1);
  assert.equal(stored.projects[0].title, "QA title");
  assert.equal(stored.projects[0].previewVideo.src, uploadedVideo.src);
  assert.equal(stored.projects[2].blocks.find((block) => block.type === "carousel").layout, "grid");
});
