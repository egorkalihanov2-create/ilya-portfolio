import { useEffect, useMemo, useState } from "react";
import type { PerspectiveProject, CaseBlock, CaseMedia } from "@/components/perspective-carousel";
import { VideoPlayer } from "@/components/perspective-carousel";

function textContent(project: PerspectiveProject) {
  const textBlocks = project.blocks?.filter((block) => block.type === "text") ?? [];
  const description = project.description ?? textBlocks[0]?.text ?? "";
  const role = (project.role ?? textBlocks[1]?.text ?? "").replace(/^My role:\s*/i, "");
  return { description, role };
}

function projectMedia(project: PerspectiveProject) {
  const images: { src: string; alt: string }[] = [];
  for (const block of project.blocks ?? []) {
    if (block.type === "media" && block.item.type === "image") {
      images.push({ src: block.item.src, alt: block.item.alt ?? project.title });
    }
    if (block.type === "carousel") {
      for (const item of block.items) {
        if (item.type === "image") images.push({ src: item.src, alt: item.alt ?? project.title });
      }
    }
  }

  if (!images.length) {
    images.push({ src: project.coverImage, alt: project.title });
  }
  return images.slice(0, 4);
}

function detailVideo(project: PerspectiveProject): CaseMedia | undefined {
  if (Object.hasOwn(project, "detailVideo")) return project.detailVideo ?? undefined;
  if (project.previewVideo) return project.previewVideo;
  for (const block of project.blocks ?? []) {
    if (block.type === "media" && block.item.type === "video") return block.item;
    if (block.type === "carousel") {
      const video = block.items.find((item) => item.type === "video");
      if (video) return video;
    }
  }
  return undefined;
}

function CaseTitle({ title }: { title: string }) {
  const separator = title.indexOf(":");
  if (separator < 0) return <>{title}</>;
  return <>{title.slice(0, separator + 1)}<br />{title.slice(separator + 1).trim()}</>;
}

function storyBlocks(project: PerspectiveProject) {
  const introTextIds = new Set(
    (project.blocks ?? [])
      .filter((block) => block.type === "text")
      .slice(0, 2)
      .map((block) => block.id),
  );
  return (project.blocks ?? []).filter((block) => !introTextIds.has(block.id));
}

function isStructuredStory(blocks: CaseBlock[]) {
  return blocks.some((block) =>
    (block.type === "text" && Boolean(block.heading?.trim()))
    || (block.type === "media" && block.layout === "award-overlay"),
  );
}

function StoryVideo({ media, fallback, title }: { media: CaseMedia; fallback: string; title: string }) {
  const [started, setStarted] = useState(false);
  return (
    <section className="case-detail-video case-detail-story-video" aria-label={`${title} video`}>
      {started ? (
        <VideoPlayer
          src={media.src}
          poster={media.poster ?? fallback}
          autoPlay
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <>
          <img className="case-detail-video-poster" src={media.poster ?? fallback} alt="" />
          <span className="case-detail-video-shade" aria-hidden />
          <button
            type="button"
            className="case-detail-play"
            onClick={() => setStarted(true)}
            aria-label={`Play ${title}`}
          >
            <img src="./assets/figma/case-detail/play.svg" alt="" />
          </button>
        </>
      )}
    </section>
  );
}

function StoryBlock({ block, project }: { block: CaseBlock; project: PerspectiveProject }) {
  if (block.type === "text") {
    return (
      <section className="case-detail-story-copy">
        {block.heading ? <h2>{block.heading}</h2> : null}
        {block.text ? <p>{block.text}</p> : null}
      </section>
    );
  }

  if (block.type === "media") {
    if (block.item.type === "video") {
      return <StoryVideo media={block.item} fallback={project.coverImage} title={block.item.caption || project.title} />;
    }
    return (
      <figure className={`case-detail-story-image${block.layout === "award-overlay" ? " is-award-overlay" : ""}`}>
        <img src={block.item.src} alt={block.item.alt ?? project.title} decoding="async" />
        {block.item.caption ? <figcaption>{block.item.caption}</figcaption> : null}
      </figure>
    );
  }

  return (
    <div
      className="case-detail-story-grid"
      data-columns={block.columns ?? 2}
      aria-label={`${project.title} gallery`}
    >
      {block.items.map((item) => (
        <figure key={item.id}>
          <img src={item.src} alt={item.alt ?? project.title} decoding="async" />
          {item.caption ? <figcaption>{item.caption}</figcaption> : null}
        </figure>
      ))}
    </div>
  );
}

export function CaseDetailView({
  project,
  projects,
  onClose,
  onSelect,
}: {
  project: PerspectiveProject;
  projects: PerspectiveProject[];
  onClose: () => void;
  onSelect: (project: PerspectiveProject) => void;
}) {
  const [videoStarted, setVideoStarted] = useState(false);
  const [stripOffset, setStripOffset] = useState(0);
  const { description, role } = textContent(project);
  const gallery = useMemo(() => projectMedia(project), [project]);
  const video = detailVideo(project);
  const narrativeBlocks = useMemo(() => storyBlocks(project), [project]);
  const structuredStory = useMemo(() => isStructuredStory(narrativeBlocks), [narrativeBlocks]);
  const currentIndex = Math.max(0, projects.findIndex((item) => item.id === project.id));
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const stripProjects = useMemo(() => {
    const withoutCurrent = projects.filter((item) => item.id !== project.id);
    if (!withoutCurrent.length) return [];
    const offset = ((stripOffset % withoutCurrent.length) + withoutCurrent.length) % withoutCurrent.length;
    return [...withoutCurrent.slice(offset), ...withoutCurrent.slice(0, offset)];
  }, [project.id, projects, stripOffset]);

  useEffect(() => {
    setVideoStarted(false);
    setStripOffset(0);
  }, [project.id]);

  return (
    <main className="case-detail">
      <article className="case-detail-content">
        <img className="case-detail-hero" src={project.coverImage} alt={project.title} />

        <div className="case-detail-tag">{project.tag}</div>

        <div className="case-detail-summary">
          <h1><CaseTitle title={project.title} /></h1>
          <p>{description}</p>
        </div>

        {!structuredStory ? (
          <div
            className={`case-detail-gallery${project.id === "citydrive" ? " is-citydrive" : ""}`}
            data-count={Math.min(gallery.length, 4)}
            aria-label={`${project.title} gallery`}
          >
            {gallery.map((item, index) => (
              <figure className="case-detail-gallery-item" key={`${item.src}-${index}`}>
                <img src={item.src} alt={item.alt} decoding="async" />
              </figure>
            ))}
          </div>
        ) : null}

        <section className="case-detail-role">
          <h2>My Role</h2>
          <p>{role}</p>
        </section>

        {structuredStory ? (
          <div className="case-detail-story">
            {narrativeBlocks.map((block) => <StoryBlock key={block.id} block={block} project={project} />)}
          </div>
        ) : (
          <section className="case-detail-video" aria-label={`${project.title} video`}>
            {videoStarted && video ? (
              <VideoPlayer
                src={video.src}
                poster={video.poster ?? project.coverImage}
                autoPlay
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <>
                <img className="case-detail-video-poster" src={video?.poster ?? project.coverImage} alt="" />
                <span className="case-detail-video-shade" aria-hidden />
                {video ? (
                  <button
                    type="button"
                    className="case-detail-play"
                    onClick={() => setVideoStarted(true)}
                    aria-label={`Play ${project.title} video`}
                  >
                    <img src="./assets/figma/case-detail/play.svg" alt="" />
                  </button>
                ) : null}
              </>
            )}
          </section>
        )}
      </article>

      <nav className="case-detail-actions" aria-label="Case navigation">
        <button type="button" className="case-detail-action case-detail-action--dark" onClick={onClose}>
          To all cases
        </button>
        <button type="button" className="case-detail-action case-detail-action--yellow" onClick={() => onSelect(nextProject)}>
          Next case
        </button>
      </nav>

      <section className="case-detail-strip" aria-label="More cases">
        <div className="case-detail-strip-track">
          {stripProjects.map((item) => (
            <button type="button" key={item.id} onClick={() => onSelect(item)} aria-label={`Open ${item.title}`}>
              <img src={item.coverImage} alt={item.title} />
            </button>
          ))}
        </div>
        {stripProjects.length > 1 ? (
          <>
            <button
              type="button"
              className="case-detail-strip-arrow case-detail-strip-arrow--back"
              onClick={() => setStripOffset((value) => value - 1)}
              aria-label="Previous cases"
            >
              <img src="./assets/figma/case-detail/arrow-back.svg" alt="" />
            </button>
            <button
              type="button"
              className="case-detail-strip-arrow case-detail-strip-arrow--next"
              onClick={() => setStripOffset((value) => value + 1)}
              aria-label="Next cases"
            >
              <img src="./assets/figma/case-detail/arrow-next.svg" alt="" />
            </button>
          </>
        ) : null}
        <footer className="case-detail-footer">
          <a href="mailto:novik.brand@gmail.com">novik.brand@gmail.com</a>
          <a href="https://t.me/wilyam_the_originator" target="_blank" rel="noreferrer">tg: @wilyam_the_originator</a>
        </footer>
      </section>
    </main>
  );
}
