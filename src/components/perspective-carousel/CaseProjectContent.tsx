import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { CaseCarouselBlock, CaseMedia, PerspectiveProject } from "./types";

function CaseMediaView({ item }: { item: CaseMedia }) {
  return (
    <figure className="pc-case-media">
      {item.type === "video" ? (
        <video
          src={item.src}
          poster={item.poster}
          autoPlay={item.autoplay}
          muted={item.muted}
          controls={item.controls !== false}
          loop={item.autoplay}
          playsInline
          preload="metadata"
        />
      ) : (
        <img src={item.src} alt={item.alt ?? ""} loading="lazy" decoding="async" />
      )}
      {item.caption ? <figcaption>{item.caption}</figcaption> : null}
    </figure>
  );
}

function CaseMediaCarousel({ block }: { block: CaseCarouselBlock }) {
  const [active, setActive] = useState(0);
  const count = block.items.length;

  useEffect(() => setActive(0), [block.id]);

  if (!count) return null;
  const current = block.items[Math.min(active, count - 1)];
  const move = (direction: -1 | 1) => {
    setActive((value) => (value + direction + count) % count);
  };

  return (
    <div className="pc-case-carousel" aria-label="Project photo carousel">
      <CaseMediaView item={current} />
      {count > 1 ? (
        <>
          <button
            className="pc-case-carousel__arrow pc-case-carousel__arrow--previous"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            className="pc-case-carousel__arrow pc-case-carousel__arrow--next"
            type="button"
            onClick={() => move(1)}
            aria-label="Next photo"
          >
            →
          </button>
          <div className="pc-case-carousel__dots" aria-label="Choose photo">
            {block.items.map((item, index) => (
              <button
                key={item.id}
                className={index === active ? "is-active" : ""}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CaseMediaGrid({ block }: { block: CaseCarouselBlock }) {
  const columns = Math.min(4, Math.max(2, block.columns ?? 2));
  const style = { "--pc-case-grid-columns": columns } as CSSProperties;

  return (
    <div className="pc-case-grid" style={style} aria-label="Project photo grid">
      {block.items.map((item) => <CaseMediaView item={item} key={item.id} />)}
    </div>
  );
}

export function CaseProjectContent({ project }: { project: PerspectiveProject }) {
  const legacyBlocks = [project.description, project.role].filter(Boolean);

  if (!project.blocks?.length) {
    return legacyBlocks.map((text, index) => <p key={index}>{text}</p>);
  }

  return (
    <div className="pc-case-content">
      {project.blocks.map((block) => {
        if (block.type === "text") {
          return (
            <section className="pc-case-text" key={block.id}>
              {block.heading ? <h3>{block.heading}</h3> : null}
              {block.text ? <p>{block.text}</p> : null}
            </section>
          );
        }
        if (block.type === "media") {
          return <CaseMediaView item={block.item} key={block.id} />;
        }
        return block.layout === "grid"
          ? <CaseMediaGrid block={block} key={block.id} />
          : <CaseMediaCarousel block={block} key={block.id} />;
      })}
    </div>
  );
}
