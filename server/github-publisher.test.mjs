import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { createGithubPublisher } from "./github-publisher.mjs";

const jsonResponse = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "Content-Type": "application/json" },
});

const blobSha = (content) => createHash("sha1")
  .update(Buffer.from(`blob ${content.length}\0`))
  .update(content)
  .digest("hex");

test("publishes changed catalog and media to a GitHub pull request", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const value = new URL(url);
    const route = `${options.method} ${value.pathname}${value.search}`;
    const body = options.body ? JSON.parse(options.body) : null;
    calls.push({ route, body, authorization: options.headers.Authorization });

    if (route === "GET /repos/example/portfolio/git/ref/heads/main") {
      return jsonResponse({ object: { sha: "base-commit" } });
    }
    if (route === "GET /repos/example/portfolio/git/ref/heads/admin%2Fcustomer-content") {
      return jsonResponse({ message: "Not Found" }, 404);
    }
    if (route === "GET /repos/example/portfolio/git/commits/base-commit") {
      return jsonResponse({ tree: { sha: "base-tree" } });
    }
    if (route === "GET /repos/example/portfolio/git/trees/base-tree?recursive=1") {
      const oldCatalog = Buffer.from('{"version":1}');
      return jsonResponse({
        truncated: false,
        tree: [{ path: "public/content/cases.json", type: "blob", sha: blobSha(oldCatalog) }],
      });
    }
    if (route === "POST /repos/example/portfolio/git/refs") return jsonResponse({ ref: body.ref }, 201);
    if (route === "POST /repos/example/portfolio/git/blobs") {
      return jsonResponse({ sha: `blob-${calls.filter((call) => call.route.endsWith("/git/blobs")).length}` }, 201);
    }
    if (route === "POST /repos/example/portfolio/git/trees") return jsonResponse({ sha: "new-tree" }, 201);
    if (route === "POST /repos/example/portfolio/git/commits") return jsonResponse({ sha: "new-commit" }, 201);
    if (route === "PATCH /repos/example/portfolio/git/refs/heads/admin%2Fcustomer-content") {
      return jsonResponse({ object: { sha: body.sha } });
    }
    if (route.startsWith("GET /repos/example/portfolio/pulls?")) return jsonResponse([]);
    if (route === "POST /repos/example/portfolio/pulls") {
      return jsonResponse({ html_url: "https://github.com/example/portfolio/pull/7" }, 201);
    }
    return jsonResponse({ message: `Unexpected route: ${route}` }, 500);
  };

  const publisher = createGithubPublisher({
    token: "secret-token",
    owner: "example",
    repo: "portfolio",
    fetchImpl,
  });
  const result = await publisher.publish({
    message: "Customer edits",
    files: [
      { path: "public/content/cases.json", content: Buffer.from('{"version":1,"revision":2}') },
      { path: "public/uploads/new.png", content: Buffer.from("png") },
    ],
  });

  assert.equal(result.published, true);
  assert.equal(result.changedFiles, 2);
  assert.equal(result.pullRequestUrl, "https://github.com/example/portfolio/pull/7");
  assert.ok(calls.every((call) => call.authorization === "Bearer secret-token"));
  assert.equal(calls.filter((call) => call.route.endsWith("/git/blobs")).length, 2);
  assert.deepEqual(
    calls.find((call) => call.route.endsWith("/git/refs") && call.route.startsWith("POST"))?.body,
    { ref: "refs/heads/admin/customer-content", sha: "base-commit" },
  );
});

test("does not create a commit when GitHub already has the same files", async () => {
  const catalog = Buffer.from('{"version":1,"revision":2}');
  const calls = [];
  const fetchImpl = async (url, options) => {
    const value = new URL(url);
    const route = `${options.method} ${value.pathname}${value.search}`;
    calls.push(route);
    if (route.endsWith("/git/ref/heads/main")) return jsonResponse({ object: { sha: "base-commit" } });
    if (route.endsWith("/git/ref/heads/admin%2Fcustomer-content")) return jsonResponse({ message: "Not Found" }, 404);
    if (route.endsWith("/git/commits/base-commit")) return jsonResponse({ tree: { sha: "base-tree" } });
    if (route.endsWith("/git/trees/base-tree?recursive=1")) {
      return jsonResponse({
        truncated: false,
        tree: [{ path: "public/content/cases.json", type: "blob", sha: blobSha(catalog) }],
      });
    }
    return jsonResponse({ message: `Unexpected route: ${route}` }, 500);
  };
  const publisher = createGithubPublisher({
    token: "secret-token",
    owner: "example",
    repo: "portfolio",
    fetchImpl,
  });
  const result = await publisher.publish({
    files: [{ path: "public/content/cases.json", content: catalog }],
  });
  assert.equal(result.published, false);
  assert.equal(result.changedFiles, 0);
  assert.equal(calls.some((call) => call.startsWith("POST")), false);
});
