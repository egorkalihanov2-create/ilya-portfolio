import type {
  CaseBlock,
  CaseCatalog,
  CaseMedia,
  PerspectiveProject,
} from "./types";

const catalogUrl = `${import.meta.env.BASE_URL}content/cases.json`;

export function resolveCaseAsset(src: string) {
  if (!src || /^(?:[a-z]+:|\/\/|data:|blob:)/i.test(src)) return src;
  const base = import.meta.env.BASE_URL;
  if (src.startsWith(base)) return src;
  return `${base}${src.replace(/^\.\//, "").replace(/^\//, "")}`;
}

function resolveMedia(item: CaseMedia): CaseMedia {
  return {
    ...item,
    src: resolveCaseAsset(item.src),
    ...(item.poster ? { poster: resolveCaseAsset(item.poster) } : {}),
  };
}

function resolveBlock(block: CaseBlock): CaseBlock {
  if (block.type === "media") return { ...block, item: resolveMedia(block.item) };
  if (block.type === "carousel") {
    return { ...block, items: block.items.map(resolveMedia) };
  }
  return block;
}

export function resolveProjectAssets(project: PerspectiveProject): PerspectiveProject {
  return {
    ...project,
    coverImage: resolveCaseAsset(project.coverImage),
    image: resolveCaseAsset(project.image),
    previewVideo: project.previewVideo ? resolveMedia(project.previewVideo) : undefined,
    blocks: project.blocks?.map(resolveBlock),
  };
}

export async function loadCaseCatalog(signal?: AbortSignal) {
  const response = await fetch(catalogUrl, { cache: "no-store", signal });
  if (!response.ok) throw new Error(`Case catalog request failed: ${response.status}`);
  const catalog = (await response.json()) as CaseCatalog;
  if (catalog.version !== 1 || !Array.isArray(catalog.projects)) {
    throw new Error("Invalid case catalog");
  }
  return {
    ...catalog,
    projects: catalog.projects.map(resolveProjectAssets),
  } satisfies CaseCatalog;
}
