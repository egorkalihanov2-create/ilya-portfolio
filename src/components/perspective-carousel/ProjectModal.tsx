import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { CaseProjectContent } from "./CaseProjectContent";
import type { PerspectiveProject } from "./types";

interface ProjectModalProps {
  project: PerspectiveProject | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const reduceMotion = useReducedMotion();
  const [videoStarted, setVideoStarted] = useState(false);

  useEffect(() => {
    setVideoStarted(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project ? (
        <motion.div
          className="pc-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) onClose();
          }}
          role="presentation"
        >
          <motion.article
            className="pc-modal"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 36 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 22 }}
            transition={{ type: "spring", stiffness: 290, damping: 28, mass: 0.84 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pc-modal-title"
          >
            <button
              className="pc-modal__close"
              onClick={onClose}
              type="button"
              autoFocus
              aria-label="Close project"
            >
              <span />
              <span />
            </button>
            <div
              className="pc-modal__media"
              style={{ backgroundImage: `url("${project.coverImage}")` }}
            >
              {videoStarted && project.previewVideo ? (
                <video
                  className="pc-modal__video"
                  src={project.previewVideo.src}
                  poster={project.previewVideo.poster ?? project.image}
                  autoPlay
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={project.image}
                  alt=""
                  draggable={false}
                  decoding="async"
                />
              )}
              {!videoStarted && project.previewVideo ? (
                <button
                  className="pc-modal__play"
                  type="button"
                  aria-label={`Включить видео кейса ${project.title}`}
                  onClick={() => setVideoStarted(true)}
                >
                  <span />
                </button>
              ) : null}
            </div>
            <div className="pc-modal__content">
              <div className="pc-modal__heading-row">
                <h2 id="pc-modal-title">{project.title}</h2>
                <span className="pc-modal__tag">{project.tag}</span>
              </div>
              <CaseProjectContent project={project} />
            </div>
          </motion.article>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
