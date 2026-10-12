import { createHash } from "node:crypto";

const API_VERSION = "2022-11-28";

function githubError(status, message) {
  return Object.assign(new Error(message), { status });
}

function validateConfigValue(value, name, pattern) {
  if (!pattern.test(value)) throw new Error(`Некорректная настройка ${name}`);
  return value;
}

function validateBranch(value, name) {
  if (
    !/^[a-zA-Z0-9._/-]+$/.test(value)
    || value.startsWith("/")
    || value.endsWith("/")
    || value.includes("..")
    || value.includes("//")
  ) {
    throw new Error(`Некорректная настройка ${name}`);
  }
  return value;
}

function blobSha(content) {
  const header = Buffer.from(`blob ${content.length}\0`);
  return createHash("sha1").update(header).update(content).digest("hex");
}

function normalizeFiles(files) {
  const seen = new Set();
  return files.map(({ path, content }) => {
    const normalized = path.replaceAll("\\", "/").replace(/^\/+/, "");
    if (!normalized || normalized.includes("..") || seen.has(normalized)) {
      throw new Error(`Некорректный путь публикации: ${path}`);
    }
    seen.add(normalized);
    return {
      path: normalized,
      content: Buffer.isBuffer(content) ? content : Buffer.from(content),
    };
  }).sort((left, right) => left.path.localeCompare(right.path));
}

export function createGithubPublisher({
  token,
  owner,
  repo,
  baseBranch = "main",
  contentBranch = "admin/customer-content",
  fetchImpl = fetch,
}) {
  if (!token) throw new Error("Не задан GITHUB_TOKEN");
  const safeOwner = validateConfigValue(owner, "GITHUB_OWNER", /^[a-zA-Z0-9_.-]+$/);
  const safeRepo = validateConfigValue(repo, "GITHUB_REPO", /^[a-zA-Z0-9_.-]+$/);
  const safeBase = validateBranch(baseBranch, "GITHUB_BASE_BRANCH");
  const safeContent = validateBranch(contentBranch, "GITHUB_CONTENT_BRANCH");
  if (safeBase === safeContent) throw new Error("Ветка контента должна отличаться от основной ветки");

  const apiBase = `https://api.github.com/repos/${safeOwner}/${safeRepo}`;

  async function request(endpoint, { method = "GET", body } = {}) {
    const response = await fetchImpl(`${apiBase}${endpoint}`, {
      method,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": API_VERSION,
        "User-Agent": "ilya-portfolio-admin",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const value = response.status === 204
      ? null
      : await response.json().catch(() => null);
    if (!response.ok) {
      const detail = value?.message ? `: ${value.message}` : "";
      throw githubError(response.status, `GitHub API ${response.status}${detail}`);
    }
    return value;
  }

  async function getRef(branch) {
    try {
      return await request(`/git/ref/heads/${encodeURIComponent(branch)}`);
    } catch (cause) {
      if (cause.status === 404) return null;
      throw cause;
    }
  }

  async function findPullRequest() {
    const query = new URLSearchParams({
      state: "open",
      head: `${safeOwner}:${safeContent}`,
      base: safeBase,
      per_page: "1",
    });
    const pulls = await request(`/pulls?${query}`);
    return pulls[0] ?? null;
  }

  async function ensurePullRequest(knownPullRequest = null) {
    const existing = knownPullRequest ?? await findPullRequest();
    if (existing) return existing;
    return request("/pulls", {
      method: "POST",
      body: {
        title: "Обновление кейсов из админки",
        head: safeContent,
        base: safeBase,
        body: [
          "Правки опубликованы заказчиком через редактор кейсов.",
          "",
          "Проверьте каталог и новые медиафайлы перед слиянием.",
        ].join("\n"),
      },
    });
  }

  async function publish({ files, message }) {
    const normalizedFiles = normalizeFiles(files);
    if (!normalizedFiles.length) throw new Error("Нет файлов для публикации");

    const baseRef = await getRef(safeBase);
    if (!baseRef) throw githubError(404, `Основная ветка ${safeBase} не найдена`);
    const contentRef = await getRef(safeContent);
    const existingPullRequest = contentRef ? await findPullRequest() : null;
    const continueOpenPullRequest = Boolean(contentRef && existingPullRequest);
    const parentSha = continueOpenPullRequest ? contentRef.object.sha : baseRef.object.sha;
    const parentCommit = await request(`/git/commits/${parentSha}`);
    const currentTree = await request(`/git/trees/${parentCommit.tree.sha}?recursive=1`);
    if (currentTree.truncated) {
      throw githubError(409, "GitHub вернул неполное дерево репозитория");
    }
    const existing = new Map(
      currentTree.tree
        .filter((item) => item.type === "blob")
        .map((item) => [item.path, item.sha]),
    );
    const changedFiles = normalizedFiles.filter((file) => existing.get(file.path) !== blobSha(file.content));

    if (!changedFiles.length) {
      return {
        published: false,
        changedFiles: 0,
        branch: safeContent,
        pullRequestUrl: existingPullRequest?.html_url ?? null,
        message: existingPullRequest
          ? "Все сохранённые изменения уже находятся в Pull Request."
          : "GitHub уже содержит эту версию каталога и медиафайлов.",
      };
    }

    if (!contentRef) {
      await request("/git/refs", {
        method: "POST",
        body: { ref: `refs/heads/${safeContent}`, sha: parentSha },
      });
    }

    const entries = [];
    for (const file of changedFiles) {
      const blob = await request("/git/blobs", {
        method: "POST",
        body: { content: file.content.toString("base64"), encoding: "base64" },
      });
      entries.push({ path: file.path, mode: "100644", type: "blob", sha: blob.sha });
    }

    const tree = await request("/git/trees", {
      method: "POST",
      body: { base_tree: parentCommit.tree.sha, tree: entries },
    });
    const commit = await request("/git/commits", {
      method: "POST",
      body: {
        message: message || "Обновление контента из админки",
        tree: tree.sha,
        parents: [parentSha],
      },
    });
    await request(`/git/refs/heads/${encodeURIComponent(safeContent)}`, {
      method: "PATCH",
      body: { sha: commit.sha, force: Boolean(contentRef && !continueOpenPullRequest) },
    });
    const pullRequest = await ensurePullRequest(existingPullRequest);
    return {
      published: true,
      changedFiles: changedFiles.length,
      branch: safeContent,
      commitSha: commit.sha,
      pullRequestUrl: pullRequest.html_url,
      message: `Передано файлов: ${changedFiles.length}. Pull Request готов к проверке.`,
    };
  }

  return {
    publish,
    info: {
      repository: `${safeOwner}/${safeRepo}`,
      baseBranch: safeBase,
      contentBranch: safeContent,
    },
  };
}
