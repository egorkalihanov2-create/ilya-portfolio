export const PROJECT_IDS = [
  "citydrive",
  "alfa-smooth-over",
  "demix",
  "winx",
  "beeline",
  "alfa-only",
];

const fail = (message) => {
  throw Object.assign(new Error(message), { status: 400 });
};

function text(value, name, max = 300, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) {
    fail(`Некорректное поле: ${name}`);
  }
  return value;
}

function list(value, max, name) {
  if (!Array.isArray(value) || value.length > max) fail(`Слишком много элементов: ${name}`);
  return value;
}

function mediaPath(value, name, imageOnly = false) {
  const src = text(value, name, 320, true);
  if (src.includes("..") || src.startsWith("/") || !/^(?:assets|uploads)\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|gif|mp4|webm)$/i.test(src)) {
    fail(`Некорректный путь: ${name}`);
  }
  if (imageOnly && !/\.(?:png|jpe?g|webp|gif)$/i.test(src)) {
    fail(`${name}: требуется изображение`);
  }
  return src;
}

function media(value, imageOnly = false) {
  if (!value || typeof value !== "object") fail("Некорректный медиафайл");
  if (!["image", "video"].includes(value.type)) fail("Неизвестный тип медиа");
  if (imageOnly && value.type !== "image") fail("В фотокарусели допустимы только изображения");
  const src = mediaPath(value.src, "медиа", imageOnly);
  const isVideo = /\.(?:mp4|webm)$/i.test(src);
  if ((value.type === "video") !== isVideo) fail("Тип медиа не соответствует файлу");
  return {
    id: text(value.id, "ID медиа", 100, true),
    type: value.type,
    src,
    alt: text(value.alt ?? "", "alt", 500),
    caption: text(value.caption ?? "", "подпись", 500),
    ...(value.poster ? { poster: mediaPath(value.poster, "обложка видео", true) } : {}),
    ...(value.type === "video"
      ? {
          autoplay: value.autoplay === true,
          muted: value.muted === true,
          controls: value.controls !== false,
        }
      : {}),
  };
}

function block(value) {
  if (!value || typeof value !== "object") fail("Некорректный блок");
  const id = text(value.id, "ID блока", 100, true);
  if (value.type === "text") {
    return {
      id,
      type: "text",
      heading: text(value.heading ?? "", "заголовок блока", 300),
      text: text(value.text ?? "", "текст блока", 30000),
    };
  }
  if (value.type === "media") return { id, type: "media", item: media(value.item) };
  if (value.type === "carousel") {
    const items = list(value.items, 40, "фото в карусели").map((item) => media(item, true));
    if (!items.length) fail("Фотокарусель не может быть пустой");
    const layout = value.layout ?? "carousel";
    if (!["carousel", "grid"].includes(layout)) fail("Неизвестный вид фотогалереи");
    const columns = value.columns ?? 2;
    if (![2, 3, 4].includes(columns)) fail("Сетка поддерживает от 2 до 4 колонок");
    return { id, type: "carousel", layout, columns, items };
  }
  fail("Неизвестный тип блока");
}

export function validateCatalog(value) {
  if (!value || value.version !== 1 || !Number.isSafeInteger(value.revision) || value.revision < 0) {
    fail("Неверная версия каталога");
  }
  const projects = list(value.projects, PROJECT_IDS.length, "кейсы").map((project) => {
    const previewVideo = project.previewVideo == null ? undefined : media(project.previewVideo);
    if (previewVideo && previewVideo.type !== "video") {
      fail("В видео-превью допустим только видеофайл");
    }
    return {
      id: text(project.id, "ID кейса", 100, true),
      title: text(project.title, "название кейса", 300, true),
      tag: text(project.tag, "тег", 100, true),
      coverImage: mediaPath(project.coverImage, "обложка карточки", true),
      image: mediaPath(project.image, "обложка кейса", true),
      ...(previewVideo ? { previewVideo } : {}),
      blocks: list(project.blocks ?? [], 100, "блоки кейса").map(block),
    };
  });
  const ids = projects.map((project) => project.id);
  if (projects.length !== PROJECT_IDS.length || new Set(ids).size !== PROJECT_IDS.length || ids.some((id) => !PROJECT_IDS.includes(id))) {
    fail("Нельзя удалять кейсы или менять их ID");
  }
  for (const project of projects) {
    if (new Set(project.blocks.map((item) => item.id)).size !== project.blocks.length) {
      fail(`В кейсе ${project.title} повторяются ID блоков`);
    }
  }
  return { version: 1, revision: value.revision, projects };
}
