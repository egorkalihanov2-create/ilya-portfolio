import { useEffect, useMemo, useState } from "react";
import type { PerspectiveProject, CaseMedia } from "@/components/perspective-carousel";
import { VideoPlayer } from "@/components/perspective-carousel";

const citydriveGallery = [
  { src: "./assets/figma/case-detail/gallery-1.png", alt: "Citydrive campaign visual" },
  { src: "./assets/figma/case-detail/gallery-2.png", alt: "Citydrive campaign portrait" },
  { src: "./assets/figma/case-detail/gallery-3.png", alt: "Citydrive campaign portrait" },
  { src: "./assets/figma/case-detail/gallery-4.png", alt: "Citydrive campaign visual" },
];

function textContent(project: PerspectiveProject) {
  const textBlocks = project.blocks?.filter((block) => block.type === "text") ?? [];
  const description = project.description ?? textBlocks[0]?.text ?? "";
  const role = (project.role ?? textBlocks[1]?.text ?? "").replace(/^My role:\s*/i, "");
  return { description, role };
}

function projectMedia(project: PerspectiveProject) {
  if (project.id === "citydrive") return citydriveGallery;

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
    images.push(
      { src: project.image, alt: project.title },
      { src: project.coverImage, alt: project.title },
    );
  }
  return images.slice(0, 4);
}

function detailVideo(project: PerspectiveProject): CaseMedia | undefined {
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

        <section className="case-detail-role">
          <h2>My Role</h2>
          <p>{role}</p>
        </section>

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
