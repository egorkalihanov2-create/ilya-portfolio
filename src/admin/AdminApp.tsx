import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CaseProjectContent,
  VideoPlayer,
  resolveCaseAsset,
  resolveProjectAssets,
} from "@/components/perspective-carousel";
import type {
  CaseBlock,
  CaseCatalog,
  CaseMedia,
  PerspectiveProject,
} from "@/components/perspective-carousel";
import { CaseDetailView } from "@/cases/CaseDetailView";

interface AdminSession {
  authenticated: boolean;
  csrf?: string;
  mode: "local" | "password";
  loginAvailable: boolean;
  maxUploadBytes: number;
  githubPublishing: {
    enabled: boolean;
    repository?: string;
    baseBranch?: string;
    contentBranch?: string;
  };
}

interface PublishResult {
  published: boolean;
  changedFiles: number;
  branch: string;
  pullRequestUrl: string | null;
  message: string;
}

interface PickerRequest {
  multiple: boolean;
  accept: "images" | "videos" | "all";
  onFiles: (files: File[]) => Promise<void>;
}

type EditorMode = "preview" | "detail";

const acceptedMedia = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm";
const acceptedImages = "image/png,image/jpeg,image/webp,image/gif";
const acceptedVideos = "video/mp4,video/webm";

async function readJson<T>(response: Response): Promise<T> {
  const value = (await response.json().catch(() => null)) as { error?: string } | T | null;
  if (!response.ok) {
    throw new Error((value as { error?: string } | null)?.error ?? `Ошибка ${response.status}`);
  }
  return value as T;
}

async function makeCover(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1280 / image.naturalWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d", { alpha: false })?.drawImage(image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => value ? resolve(value) : reject(new Error("Не удалось подготовить обложку")),
        "image/webp",
        0.88,
      );
    });
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-cover.webp`, {
      type: "image/webp",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function MediaEditor({
  item,
  onChange,
  onReplace,
  onDelete,
  compact = false,
}: {
  item: CaseMedia;
  onChange: (item: CaseMedia) => void;
  onReplace: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  return (
    <div className={`admin-media-editor${compact ? " is-compact" : ""}`}>
      <div className="admin-media-preview">
        {item.type === "video" ? (
          <video src={resolveCaseAsset(item.src)} muted controls preload="metadata" />
        ) : (
          <img src={resolveCaseAsset(item.src)} alt="" />
        )}
      </div>
      <div className="admin-media-fields">
        <label>
          Подпись
          <input
            value={item.caption ?? ""}
            onChange={(event) => onChange({ ...item, caption: event.target.value })}
          />
        </label>
        <label>
          Alt-описание
          <input
            value={item.alt ?? ""}
            onChange={(event) => onChange({ ...item, alt: event.target.value })}
          />
        </label>
        {item.type === "video" ? (
          <div className="admin-toggles">
            <label>
              <input
                type="checkbox"
                checked={item.autoplay === true}
                onChange={(event) => onChange({ ...item, autoplay: event.target.checked })}
              />
              Автоплей
            </label>
            <label>
              <input
                type="checkbox"
                checked={item.muted === true}
                onChange={(event) => onChange({ ...item, muted: event.target.checked })}
              />
              Без звука
            </label>
            <label>
              <input
                type="checkbox"
                checked={item.controls !== false}
                onChange={(event) => onChange({ ...item, controls: event.target.checked })}
              />
              Управление
            </label>
          </div>
        ) : null}
        <div className="admin-inline-actions">
          <button type="button" onClick={onReplace}>Заменить файл</button>
          {onDelete ? <button className="danger" type="button" onClick={onDelete}>Удалить фото</button> : null}
        </div>
      </div>
    </div>
  );
}

function VideoEditorCard({
  title,
  description,
  video,
  poster,
  onReplace,
  onDelete,
  openPicker,
  uploadMany,
}: {
  title: string;
  description: string;
  video?: CaseMedia;
  poster: string;
  onReplace: (item: CaseMedia) => void;
  onDelete: () => void;
  openPicker: (request: PickerRequest) => void;
  uploadMany: (files: File[]) => Promise<CaseMedia[]>;
}) {
  return (
    <section className="admin-card admin-preview-video-card">
      <div className="admin-preview-video-card__copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {video ? (
        <video
          src={resolveCaseAsset(video.src)}
          poster={resolveCaseAsset(poster)}
          controls
          muted
          preload="metadata"
        />
      ) : (
        <div className="admin-preview-video-card__empty">Видео пока не добавлено</div>
      )}
      <div className="admin-inline-actions admin-preview-video-card__actions">
        <button
          type="button"
          onClick={() => openPicker({
            multiple: false,
            accept: "videos",
            onFiles: async (files) => {
              const [item] = await uploadMany(files.slice(0, 1));
              if (!item) return;
              if (item.type !== "video") throw new Error("Выберите видео в формате MP4 или WebM");
              onReplace({
                ...item,
                autoplay: false,
                muted: false,
                controls: true,
              });
            },
          })}
        >
          {video ? "Заменить видео" : "Добавить видео"}
        </button>
        {video ? (
          <button className="danger" type="button" onClick={onDelete}>
            Удалить видео
          </button>
        ) : null}
      </div>
    </section>
  );
}

function detailTextBlock(project: PerspectiveProject, kind: "description" | "role") {
  const textBlocks = project.blocks?.filter((block) => block.type === "text") ?? [];
  return textBlocks.find((block) => block.id.toLowerCase().includes(kind))
    ?? textBlocks[kind === "description" ? 0 : 1];
}

function detailText(project: PerspectiveProject, kind: "description" | "role") {
  const fallback = kind === "description" ? project.description : project.role;
  const value = detailTextBlock(project, kind)?.text ?? fallback ?? "";
  return kind === "role" ? value.replace(/^My role:\s*/i, "") : value;
}

function setDetailText(project: PerspectiveProject, kind: "description" | "role", value: string) {
  project.blocks ??= [];
  const block = detailTextBlock(project, kind);
  if (block) {
    const hadRolePrefix = kind === "role" && /^My role:\s*/i.test(block.text);
    block.text = hadRolePrefix ? `My role: ${value}` : value;
    return;
  }

  const nextBlock: CaseBlock = {
    id: `${project.id}-${kind}`,
    type: "text",
    heading: kind === "role" ? "My Role" : "",
    text: value,
  };
  const firstMediaIndex = project.blocks.findIndex((item) => item.type !== "text");
  const insertAt = firstMediaIndex < 0 ? project.blocks.length : firstMediaIndex;
  project.blocks.splice(insertAt, 0, nextBlock);
}

function editableBlocks(project: PerspectiveProject, mode: EditorMode) {
  if (mode === "preview") {
    project.previewBlocks ??= structuredClone(project.blocks ?? []);
    return project.previewBlocks;
  }
  project.blocks ??= [];
  return project.blocks;
}

function MainProjectPreview({ project }: { project: PerspectiveProject }) {
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => setVideoStarted(false), [project.id, project.previewVideo?.src]);

  return (
    <article className="admin-main-preview">
      <div className="admin-main-preview__media">
        {videoStarted && project.previewVideo ? (
          <VideoPlayer
            src={project.previewVideo.src}
            poster={project.image}
            autoPlay
            controls
            playsInline
            preload="metadata"
          />
        ) : (
          <img src={project.image} alt="" />
        )}
        {!videoStarted && project.previewVideo ? (
          <button
            className="admin-main-preview__play"
            type="button"
            aria-label="Включить видео"
            onClick={() => setVideoStarted(true)}
          >
            <span />
          </button>
        ) : null}
      </div>
      <div className="admin-main-preview__content">
        <div className="admin-main-preview__heading">
          <h2>{project.title}</h2>
          <span>{project.tag}</span>
        </div>
        <CaseProjectContent project={project} />
      </div>
    </article>
  );
}

function ProjectPreview({
  project,
  projects,
  onSelect,
  mode,
}: {
  project: PerspectiveProject;
  projects: PerspectiveProject[];
  onSelect: (project: PerspectiveProject) => void;
  mode: EditorMode;
}) {
  const resolvedProjects = useMemo(() => projects.map(resolveProjectAssets), [projects]);
  const resolved = resolvedProjects.find((item) => item.id === project.id)
    ?? resolveProjectAssets(project);

  if (mode === "preview") return <MainProjectPreview project={resolved} />;

  return (
    <div className="admin-detail-preview">
      <CaseDetailView
        project={resolved}
        projects={resolvedProjects}
        onClose={() => undefined}
        onSelect={onSelect}
      />
    </div>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [draft, setDraft] = useState<CaseCatalog | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>("preview");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Подключение к редактору…");
  const [error, setError] = useState(false);
  const [password, setPassword] = useState("");
  const [publishUrl, setPublishUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const picker = useRef<PickerRequest | null>(null);

  const request = useCallback(async <T,>(url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.method && options.method !== "GET"
          ? { "X-CSRF-Token": session?.csrf ?? "" }
          : {}),
        ...options.headers,
      },
    });
    return readJson<T>(response);
  }, [session?.csrf]);

  const showStatus = useCallback((message: string, isError = false) => {
    setStatus(message);
    setError(isError);
  }, []);

  const loadCatalog = useCallback(async () => {
    const catalog = await request<CaseCatalog>("/api/catalog");
    setDraft(catalog);
    setSelectedId((current) => current || catalog.projects[0]?.id || "");
    setDirty(false);
    showStatus(`Каталог загружен · версия ${catalog.revision}`);
  }, [request, showStatus]);

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/session")
      .then((response) => readJson<AdminSession>(response))
      .then(async (value) => {
        if (!active) return;
        setSession(value);
        if (value.authenticated) {
          const response = await fetch("/api/catalog", { cache: "no-store" });
          const catalog = await readJson<CaseCatalog>(response);
          if (!active) return;
          setDraft(catalog);
          setSelectedId(catalog.projects[0]?.id ?? "");
          setStatus(`Каталог загружен · версия ${catalog.revision}`);
        } else {
          setStatus("Введите пароль администратора.");
        }
      })
      .catch((cause: Error) => {
        if (!active) return;
        showStatus(cause.message || "Сервер редактора недоступен.", true);
      });
    return () => { active = false; };
  }, [showStatus]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty && !busy) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy, dirty]);

  const selected = useMemo(
    () => draft?.projects.find((project) => project.id === selectedId) ?? null,
    [draft, selectedId],
  );
  const selectedBlocks = selected
    ? (editorMode === "preview" ? selected.previewBlocks ?? selected.blocks ?? [] : selected.blocks ?? [])
    : [];

  const updateProject = useCallback((mutate: (project: PerspectiveProject) => void) => {
    setDraft((current) => {
      if (!current) return current;
      const next = structuredClone(current);
      const project = next.projects.find((item) => item.id === selectedId);
      if (project) mutate(project);
      return next;
    });
    setDirty(true);
    showStatus("Есть несохранённые изменения. Предпросмотр обновлён.");
  }, [selectedId, showStatus]);

  const openPicker = useCallback((requestValue: PickerRequest) => {
    picker.current = requestValue;
    if (!fileInput.current) return;
    fileInput.current.multiple = requestValue.multiple;
    fileInput.current.accept = requestValue.accept === "images"
      ? acceptedImages
      : requestValue.accept === "videos"
        ? acceptedVideos
        : acceptedMedia;
    fileInput.current.value = "";
    fileInput.current.click();
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    if (!session) throw new Error("Нет активной сессии редактора");
    if (file.size > session.maxUploadBytes) {
      throw new Error(`${file.name}: превышен лимит ${Math.round(session.maxUploadBytes / 1024 / 1024)} МБ`);
    }
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type,
        "X-CSRF-Token": session.csrf ?? "",
      },
      body: file,
    });
    const uploaded = await readJson<{ src: string; type: "image" | "video" }>(response);
    return {
      id: crypto.randomUUID(),
      ...uploaded,
      alt: file.name,
      caption: "",
      ...(uploaded.type === "video"
        ? { autoplay: false, muted: true, controls: true }
        : {}),
    } satisfies CaseMedia;
  }, [session]);

  const uploadMany = useCallback(async (files: File[]) => {
    setBusy(true);
    const result: CaseMedia[] = [];
    try {
      for (let index = 0; index < files.length; index += 1) {
        showStatus(`Загрузка ${index + 1}/${files.length}: ${files[index].name}`);
        result.push(await uploadFile(files[index]));
      }
      return result;
    } finally {
      setBusy(false);
    }
  }, [showStatus, uploadFile]);

  const replaceBlock = (blockId: string, mutate: (block: CaseBlock) => void) => {
    updateProject((project) => {
      const block = editableBlocks(project, editorMode).find((item) => item.id === blockId);
      if (block) mutate(block);
    });
  };

  const addTextBlock = () => {
    updateProject((project) => {
      editableBlocks(project, editorMode).push({
        id: crypto.randomUUID(),
        type: "text",
        heading: "",
        text: "",
      });
    });
  };

  const addMediaBlock = () => {
    openPicker({
      multiple: false,
      accept: "all",
      onFiles: async (files) => {
        const [item] = await uploadMany(files.slice(0, 1));
        if (!item) return;
        updateProject((project) => {
          editableBlocks(project, editorMode).push({ id: crypto.randomUUID(), type: "media", item });
        });
      },
    });
  };

  const addCarouselBlock = () => {
    openPicker({
      multiple: true,
      accept: "images",
      onFiles: async (files) => {
        const items = await uploadMany(files.slice(0, 20));
        if (!items.length) return;
        updateProject((project) => {
          editableBlocks(project, editorMode).push({
            id: crypto.randomUUID(),
            type: "carousel",
            layout: "carousel",
            columns: 2,
            items,
          });
        });
      },
    });
  };

  const persistDraft = async () => {
    if (!draft) throw new Error("Каталог не загружен");
    const saved = await request<CaseCatalog>("/api/admin/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setDraft(saved);
    setDirty(false);
    const channel = new BroadcastChannel("ilya-case-catalog");
    channel.postMessage({ revision: saved.revision });
    channel.close();
    return saved;
  };

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
      const saved = await persistDraft();
      showStatus(`Сохранено на сайте · версия ${saved.revision}`);
    } catch (cause) {
      showStatus((cause as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const publish = async () => {
    if (!draft || !session?.githubPublishing.enabled) return;
    setBusy(true);
    setPublishUrl("");
    try {
      const saved = dirty ? await persistDraft() : draft;
      showStatus(`Версия ${saved.revision} отправляется в GitHub…`);
      const result = await request<PublishResult>("/api/admin/publish", { method: "POST" });
      setPublishUrl(result.pullRequestUrl ?? "");
      showStatus(result.message);
    } catch (cause) {
      showStatus((cause as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const value = await request<{ authenticated: true; csrf: string }>("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setSession((current) => current ? { ...current, ...value } : current);
      setPassword("");
      const response = await fetch("/api/catalog", { cache: "no-store" });
      const catalog = await readJson<CaseCatalog>(response);
      setDraft(catalog);
      setSelectedId(catalog.projects[0]?.id ?? "");
      showStatus(`Каталог загружен · версия ${catalog.revision}`);
    } catch (cause) {
      showStatus((cause as Error).message, true);
    } finally {
      setBusy(false);
    }
  };

  if (!session || (!session.authenticated && !draft)) {
    return (
      <main className="admin-login-shell">
        <form className="admin-login" onSubmit={login}>
          <span className="admin-kicker">ILYA PORTFOLIO</span>
          <h1>Case editor</h1>
          <p className={error ? "admin-message is-error" : "admin-message"}>{status}</p>
          {session?.loginAvailable ? (
            <>
              <label>Пароль<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <button className="primary" disabled={busy}>Войти</button>
            </>
          ) : null}
        </form>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-toolbar">
        <a href="./" target="_blank" rel="noreferrer">Ilya Portfolio</a>
        <span>{session.mode === "local" ? "Локальный редактор" : "Защищённый редактор"}</span>
        <div>
          <button type="button" disabled={busy} onClick={() => void loadCatalog()}>Обновить</button>
          <button className="primary" type="button" disabled={busy || !dirty} onClick={() => void save()}>
            {busy ? "Подождите…" : dirty ? "Сохранить на сайте" : "Сохранено на сайте"}
          </button>
          {session.githubPublishing.enabled ? (
            <button type="button" disabled={busy} onClick={() => void publish()}>
              Передать в GitHub
            </button>
          ) : null}
        </div>
      </header>
      <p className={error ? "admin-status is-error" : "admin-status"}>
        {status}
        {publishUrl ? <a href={publishUrl} target="_blank" rel="noreferrer">Открыть Pull Request</a> : null}
      </p>
      <main className="admin-layout">
        <nav className="admin-nav" aria-label="Кейсы">
          <span className="admin-kicker">CASES</span>
          {draft?.projects.map((project, index) => (
            <button
              className={project.id === selectedId ? "is-selected" : ""}
              type="button"
              key={project.id}
              onClick={() => setSelectedId(project.id)}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              {project.title}
            </button>
          ))}
        </nav>
        <section className="admin-form">
          {selected ? (
            <>
              <span className="admin-kicker">EDIT CASE</span>
              <h1>{selected.title}</h1>
              <label>
                Название кейса
                <input value={selected.title} onChange={(event) => updateProject((project) => { project.title = event.target.value; })} />
              </label>
              <label>
                Тег
                <input value={selected.tag} onChange={(event) => updateProject((project) => { project.tag = event.target.value; })} />
              </label>

              <div className="admin-editor-mode" role="tablist" aria-label="Редактируемая версия кейса">
                <button
                  type="button"
                  role="tab"
                  aria-selected={editorMode === "preview"}
                  className={editorMode === "preview" ? "is-active" : ""}
                  onClick={() => setEditorMode("preview")}
                >
                  <strong>Превью в Main</strong>
                  <span>Попап после нажатия на карточку</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={editorMode === "detail"}
                  className={editorMode === "detail" ? "is-active" : ""}
                  onClick={() => setEditorMode("detail")}
                >
                  <strong>Основной кейс</strong>
                  <span>Полная страница внутри Cases</span>
                </button>
              </div>

              {editorMode === "detail" ? (
                <>
                  <section className="admin-card admin-detail-copy-card">
                    <div>
                      <span className="admin-kicker">CASES PAGE</span>
                      <h2>Тексты основного кейса</h2>
                      <p>Описание и My Role относятся только к полной странице в Cases.</p>
                    </div>
                    <label>
                      Описание кейса
                      <textarea
                        rows={6}
                        value={detailText(selected, "description")}
                        onChange={(event) => updateProject((project) => {
                          setDetailText(project, "description", event.target.value);
                        })}
                      />
                    </label>
                    <label>
                      My Role
                      <textarea
                        rows={6}
                        value={detailText(selected, "role")}
                        onChange={(event) => updateProject((project) => {
                          setDetailText(project, "role", event.target.value);
                        })}
                      />
                    </label>
                  </section>

                  <section className="admin-card admin-cover-card">
                    <div>
                      <h2>Обложка основного кейса</h2>
                      <p>Используется в сетке Cases и как первый экран полной страницы.</p>
                    </div>
                    <img src={resolveCaseAsset(selected.coverImage)} alt="" />
                    <button
                      type="button"
                      onClick={() => openPicker({
                        multiple: false,
                        accept: "images",
                        onFiles: async ([file]) => {
                          if (!file) return;
                          setBusy(true);
                          try {
                            showStatus(`Загрузка обложки основного кейса: ${file.name}`);
                            const cover = await uploadFile(await makeCover(file));
                            updateProject((project) => { project.coverImage = cover.src; });
                          } finally {
                            setBusy(false);
                          }
                        },
                      })}
                    >
                      Заменить обложку Cases
                    </button>
                  </section>

                  <VideoEditorCard
                    title="Видео основного кейса"
                    description="Показывается только на полной странице внутри Cases."
                    video={selected.detailVideo ?? undefined}
                    poster={selected.coverImage}
                    onReplace={(item) => updateProject((project) => { project.detailVideo = item; })}
                    onDelete={() => updateProject((project) => { project.detailVideo = null; })}
                    openPicker={openPicker}
                    uploadMany={uploadMany}
                  />
                </>
              ) : (
                <>
                  <section className="admin-card admin-cover-card">
                    <div>
                      <h2>Изображение превью Main</h2>
                      <p>Показывается в попапе после нажатия на кейс на главной странице.</p>
                    </div>
                    <img src={resolveCaseAsset(selected.image)} alt="" />
                    <button
                      type="button"
                      onClick={() => openPicker({
                        multiple: false,
                        accept: "images",
                        onFiles: async ([file]) => {
                          if (!file) return;
                          showStatus(`Загрузка изображения превью: ${file.name}`);
                          const image = await uploadFile(file);
                          updateProject((project) => { project.image = image.src; });
                        },
                      })}
                    >
                      Заменить изображение Main
                    </button>
                  </section>

                  <VideoEditorCard
                    title="Видео превью Main"
                    description="Показывается только в попапе кейса на главной странице."
                    video={selected.previewVideo}
                    poster={selected.image}
                    onReplace={(item) => updateProject((project) => { project.previewVideo = item; })}
                    onDelete={() => updateProject((project) => { delete project.previewVideo; })}
                    openPicker={openPicker}
                    uploadMany={uploadMany}
                  />
                </>
              )}

              <div className="admin-section-heading">
                <div>
                  <span className="admin-kicker">{editorMode === "preview" ? "MAIN PREVIEW" : "CASES PAGE"}</span>
                  <h2>{editorMode === "preview" ? "Блоки превью" : "Блоки основного кейса"}</h2>
                </div>
                <span>{selectedBlocks.length} блоков</span>
              </div>

              <div className="admin-block-toolbar">
                <button type="button" onClick={addTextBlock}>+ Текст</button>
                <button type="button" onClick={addMediaBlock}>+ Фото / видео</button>
                <button type="button" onClick={addCarouselBlock}>+ Фотокарусель</button>
              </div>

              <div className="admin-block-list">
                {selectedBlocks.map((block, index) => (
                  <article className="admin-card admin-block" key={block.id}>
                    <header>
                      <strong>{index + 1}. {block.type === "text" ? "Текст" : block.type === "media" ? "Медиа" : "Фотокарусель"}</strong>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => updateProject((project) => {
                            const blocks = editableBlocks(project, editorMode);
                            [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
                          })}
                        >↑</button>
                        <button
                          type="button"
                          disabled={index === selectedBlocks.length - 1}
                          onClick={() => updateProject((project) => {
                            const blocks = editableBlocks(project, editorMode);
                            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
                          })}
                        >↓</button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => updateProject((project) => {
                            editableBlocks(project, editorMode).splice(index, 1);
                          })}
                        >Удалить</button>
                      </div>
                    </header>

                    {block.type === "text" ? (
                      <div className="admin-block-fields">
                        <label>
                          Заголовок блока (необязательно)
                          <input
                            value={block.heading ?? ""}
                            onChange={(event) => replaceBlock(block.id, (value) => {
                              if (value.type === "text") value.heading = event.target.value;
                            })}
                          />
                        </label>
                        <label>
                          Текст
                          <textarea
                            rows={6}
                            value={block.text}
                            onChange={(event) => replaceBlock(block.id, (value) => {
                              if (value.type === "text") value.text = event.target.value;
                            })}
                          />
                        </label>
                      </div>
                    ) : null}

                    {block.type === "media" ? (
                      <MediaEditor
                        item={block.item}
                        onChange={(item) => replaceBlock(block.id, (value) => {
                          if (value.type === "media") value.item = item;
                        })}
                        onReplace={() => openPicker({
                          multiple: false,
                          accept: "all",
                          onFiles: async (files) => {
                            const [item] = await uploadMany(files.slice(0, 1));
                            if (item) replaceBlock(block.id, (value) => {
                              if (value.type === "media") value.item = item;
                            });
                          },
                        })}
                      />
                    ) : null}

                    {block.type === "carousel" ? (
                      <div className="admin-carousel-editor">
                        <div className="admin-carousel-settings">
                          <label>
                            Вид галереи
                            <select
                              value={block.layout ?? "carousel"}
                              onChange={(event) => replaceBlock(block.id, (value) => {
                                if (value.type === "carousel") {
                                  value.layout = event.target.value as "carousel" | "grid";
                                }
                              })}
                            >
                              <option value="carousel">Карусель</option>
                              <option value="grid">Сетка</option>
                            </select>
                          </label>
                          <label>
                            Изображений в строке
                            <select
                              value={block.columns ?? 2}
                              disabled={(block.layout ?? "carousel") !== "grid"}
                              onChange={(event) => replaceBlock(block.id, (value) => {
                                if (value.type === "carousel") {
                                  value.columns = Number(event.target.value) as 2 | 3 | 4;
                                }
                              })}
                            >
                              <option value={2}>2</option>
                              <option value={3}>3</option>
                              <option value={4}>4</option>
                            </select>
                          </label>
                        </div>
                        {block.items.map((item, itemIndex) => (
                          <div className="admin-carousel-item" key={item.id}>
                            <div className="admin-carousel-item__order">
                              <span>{itemIndex + 1}</span>
                              <button
                                type="button"
                                disabled={itemIndex === 0}
                                onClick={() => replaceBlock(block.id, (value) => {
                                  if (value.type !== "carousel") return;
                                  [value.items[itemIndex - 1], value.items[itemIndex]] = [value.items[itemIndex], value.items[itemIndex - 1]];
                                })}
                              >←</button>
                              <button
                                type="button"
                                disabled={itemIndex === block.items.length - 1}
                                onClick={() => replaceBlock(block.id, (value) => {
                                  if (value.type !== "carousel") return;
                                  [value.items[itemIndex], value.items[itemIndex + 1]] = [value.items[itemIndex + 1], value.items[itemIndex]];
                                })}
                              >→</button>
                            </div>
                            <MediaEditor
                              compact
                              item={item}
                              onChange={(changed) => replaceBlock(block.id, (value) => {
                                if (value.type === "carousel") value.items[itemIndex] = changed;
                              })}
                              onReplace={() => openPicker({
                                multiple: false,
                                accept: "images",
                                onFiles: async (files) => {
                                  const [changed] = await uploadMany(files.slice(0, 1));
                                  if (changed) replaceBlock(block.id, (value) => {
                                    if (value.type === "carousel") value.items[itemIndex] = changed;
                                  });
                                },
                              })}
                              onDelete={() => replaceBlock(block.id, (value) => {
                                if (value.type === "carousel") value.items.splice(itemIndex, 1);
                              })}
                            />
                          </div>
                        ))}
                        <button
                          className="admin-add-row"
                          type="button"
                          onClick={() => openPicker({
                            multiple: true,
                            accept: "images",
                            onFiles: async (files) => {
                              const items = await uploadMany(files.slice(0, 20));
                              replaceBlock(block.id, (value) => {
                                if (value.type === "carousel") value.items.push(...items);
                              });
                            },
                          })}
                        >
                          + Добавить фотографии
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </>
          ) : null}
        </section>
        <aside className="admin-preview">
          <div className="admin-preview__label">
            <span>{editorMode === "preview" ? "MAIN POPUP PREVIEW" : "CASES PAGE PREVIEW"}</span>
            <strong>{selected?.title}</strong>
          </div>
          <div className="admin-preview__viewport">
            {selected && draft ? (
              <ProjectPreview
                project={selected}
                projects={draft.projects}
                mode={editorMode}
                onSelect={(project) => setSelectedId(project.id)}
              />
            ) : null}
          </div>
        </aside>
      </main>
      <input
        ref={fileInput}
        type="file"
        hidden
        onChange={(event) => {
          const files = [...(event.target.files ?? [])];
          const action = picker.current;
          picker.current = null;
          if (!action || !files.length) return;
          void action.onFiles(files).catch((cause: Error) => showStatus(cause.message, true));
        }}
      />
    </div>
  );
}
