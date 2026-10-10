import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CaseProjectContent,
  resolveCaseAsset,
  resolveProjectAssets,
} from "@/components/perspective-carousel";
import type {
  CaseBlock,
  CaseCatalog,
  CaseMedia,
  PerspectiveProject,
} from "@/components/perspective-carousel";

interface AdminSession {
  authenticated: boolean;
  csrf?: string;
  mode: "local" | "password";
  loginAvailable: boolean;
  maxUploadBytes: number;
}

interface PickerRequest {
  multiple: boolean;
  accept: "images" | "videos" | "all";
  onFiles: (files: File[]) => Promise<void>;
}

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

function ProjectPreview({ project }: { project: PerspectiveProject }) {
  const resolved = resolveProjectAssets(project);
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    setVideoStarted(false);
  }, [resolved.id, resolved.previewVideo?.src]);

  return (
    <article className="admin-case-preview">
      <div className="admin-case-preview__media">
        {videoStarted && resolved.previewVideo ? (
          <video src={resolved.previewVideo.src} poster={resolved.image} autoPlay controls playsInline preload="metadata" />
        ) : (
          <img src={resolved.image} alt="" />
        )}
        {!videoStarted && resolved.previewVideo ? (
          <button type="button" aria-label="Включить видео" onClick={() => setVideoStarted(true)}>
            <span />
          </button>
        ) : null}
      </div>
      <div className="admin-case-preview__content">
        <div className="admin-case-preview__heading">
          <h2>{resolved.title}</h2>
          <span>{resolved.tag}</span>
        </div>
        <CaseProjectContent project={resolved} />
      </div>
    </article>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [draft, setDraft] = useState<CaseCatalog | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("Подключение к редактору…");
  const [error, setError] = useState(false);
  const [password, setPassword] = useState("");
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
      const block = project.blocks?.find((item) => item.id === blockId);
      if (block) mutate(block);
    });
  };

  const addTextBlock = () => {
    updateProject((project) => {
      project.blocks ??= [];
      project.blocks.push({ id: crypto.randomUUID(), type: "text", heading: "", text: "" });
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
          project.blocks ??= [];
          project.blocks.push({ id: crypto.randomUUID(), type: "media", item });
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
          project.blocks ??= [];
          project.blocks.push({
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

  const save = async () => {
    if (!draft) return;
    setBusy(true);
    try {
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
      showStatus(`Сохранено · версия ${saved.revision}`);
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
            {busy ? "Подождите…" : dirty ? "Сохранить изменения" : "Всё сохранено"}
          </button>
        </div>
      </header>
      <p className={error ? "admin-status is-error" : "admin-status"}>{status}</p>
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

              <section className="admin-card admin-cover-card">
                <div>
                  <h2>Обложка</h2>
                  <p>Оригинал используется внутри кейса. Для карточки автоматически создаётся WebP 1280 px.</p>
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
                        showStatus(`Загрузка обложки: ${file.name}`);
                        const original = await uploadFile(file);
                        const cover = await uploadFile(await makeCover(file));
                        updateProject((project) => {
                          project.image = original.src;
                          project.coverImage = cover.src;
                        });
                      } finally {
                        setBusy(false);
                      }
                    },
                  })}
                >
                  Заменить обложку
                </button>
              </section>

              <section className="admin-card admin-preview-video-card">
                <div className="admin-preview-video-card__copy">
                  <h2>Видео-превью</h2>
                  <p>
                    Показывается только внутри полного кейса. До нажатия на кнопку воспроизведения
                    посетитель видит обложку, а видео не загружается.
                  </p>
                </div>
                {selected.previewVideo ? (
                  <video
                    src={resolveCaseAsset(selected.previewVideo.src)}
                    poster={resolveCaseAsset(selected.image)}
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
                        updateProject((project) => {
                          project.previewVideo = {
                            ...item,
                            autoplay: false,
                            muted: false,
                            controls: true,
                          };
                        });
                      },
                    })}
                  >
                    {selected.previewVideo ? "Заменить видео" : "Добавить видео"}
                  </button>
                  {selected.previewVideo ? (
                    <button
                      className="danger"
                      type="button"
                      onClick={() => updateProject((project) => { delete project.previewVideo; })}
                    >
                      Удалить видео
                    </button>
                  ) : null}
                </div>
              </section>

              <div className="admin-section-heading">
                <div>
                  <span className="admin-kicker">CONTENT</span>
                  <h2>Блоки кейса</h2>
                </div>
                <span>{selected.blocks?.length ?? 0} блоков</span>
              </div>

              <div className="admin-block-toolbar">
                <button type="button" onClick={addTextBlock}>+ Текст</button>
                <button type="button" onClick={addMediaBlock}>+ Фото / видео</button>
                <button type="button" onClick={addCarouselBlock}>+ Фотокарусель</button>
              </div>

              <div className="admin-block-list">
                {(selected.blocks ?? []).map((block, index) => (
                  <article className="admin-card admin-block" key={block.id}>
                    <header>
                      <strong>{index + 1}. {block.type === "text" ? "Текст" : block.type === "media" ? "Медиа" : "Фотокарусель"}</strong>
                      <div className="admin-inline-actions">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => updateProject((project) => {
                            const blocks = project.blocks ?? [];
                            [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
                          })}
                        >↑</button>
                        <button
                          type="button"
                          disabled={index === (selected.blocks?.length ?? 0) - 1}
                          onClick={() => updateProject((project) => {
                            const blocks = project.blocks ?? [];
                            [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
                          })}
                        >↓</button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => updateProject((project) => { project.blocks?.splice(index, 1); })}
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
            <span>LIVE PREVIEW</span>
            <strong>{selected?.title}</strong>
          </div>
          <div className="admin-preview__viewport">
            {selected ? <ProjectPreview project={selected} /> : null}
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
