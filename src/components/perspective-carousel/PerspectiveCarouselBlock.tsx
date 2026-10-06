import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PerspectiveProject } from "./types";
import "./perspective-carousel.css";

export interface PerspectiveCarouselBlockProps {
  projects: PerspectiveProject[];
  onOpen: (project: PerspectiveProject) => void;
  className?: string;
  showNavigation?: boolean;
  id?: string;
}

function getPosition(index: number, length: number) {
  if (index <= Math.floor(length / 2)) return index;
  return index - length;
}

export function PerspectiveCarouselBlock({
  projects,
  onOpen,
  className = "",
  showNavigation = true,
  id = "cases",
}: PerspectiveCarouselBlockProps) {
  const [order, setOrder] = useState(projects);
  const [isMobile, setIsMobile] = useState(false);
  const dragX = useMotionValue(0);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const showAccent = useInView(sectionRef, { amount: 0.25, once: true });
  const isTransitioning = useRef(false);
  const didDrag = useRef(false);

  useEffect(() => {
    setOrder(projects);
  }, [projects]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const shift = useCallback(
    (direction: -1 | 1) => {
      if (isTransitioning.current || order.length < 2) return;
      isTransitioning.current = true;

      setOrder((current) =>
        direction === 1
          ? [...current.slice(1), current[0]]
          : [current.at(-1)!, ...current.slice(0, -1)],
      );

      window.setTimeout(
        () => {
          isTransitioning.current = false;
        },
        reduceMotion ? 10 : 420,
      );
    },
    [order.length, reduceMotion],
  );

  return (
    <section
      id={id}
      ref={sectionRef}
      className={`pc-block ${className}`.trim()}
    >
      <div className="pc-accent-word" aria-hidden="true">
        <motion.span
          className={`pc-accent-word__text${showAccent ? " is-active" : ""}`}
          data-text="Cases"
          initial={{ opacity: 0 }}
          animate={
            showAccent
              ? reduceMotion
                ? { opacity: [0, 1, 1, 0] }
                : {
                    opacity: [0, 1, 1, 1, 0.82, 0.28, 0.72, 0],
                    x: [0, 0, 0, 0, -7, 8, -3, 0],
                    skewX: [0, 0, 0, 0, -2, 3, -1, 0],
                  }
              : { opacity: 0 }
          }
          transition={
            showAccent
              ? reduceMotion
                ? { duration: 2, times: [0, 0.05, 0.8, 1] }
                : {
                    duration: 2.15,
                    ease: "linear",
                    times: [0, 0.05, 0.68, 0.73, 0.77, 0.82, 0.9, 1],
                  }
              : { duration: 0 }
          }
        >
          Cases
        </motion.span>
      </div>

      <div
        className="pc-carousel"
        tabIndex={0}
        role="region"
        aria-label="Infinite perspective project carousel"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            shift(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            shift(-1);
          }
        }}
      >
        <motion.div
          className="pc-carousel__stage"
          style={{ x: dragX }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.42}
          dragMomentum={false}
          onDragStart={() => {
            didDrag.current = false;
          }}
          onDrag={(_, info) => {
            if (Math.abs(info.offset.x) > 6) didDrag.current = true;
          }}
          onDragEnd={(_, info) => {
            const force = info.offset.x + info.velocity.x * 0.14;
            void animate(dragX, 0, {
              duration: reduceMotion ? 0.01 : 0.22,
              ease: "easeOut",
            });

            if (force < -64) shift(1);
            if (force > 64) shift(-1);

            window.setTimeout(() => {
              didDrag.current = false;
            }, 80);
          }}
        >
          {order.map((project, index) => {
            const position = getPosition(index, order.length);
            const distance = Math.abs(position);
            const isCenter = position === 0;
            const isVisible = distance <= 2;

            return (
              <motion.div
                className="pc-carousel__card-position"
                data-position={position}
                key={project.id}
                initial={false}
                animate={{
                  x: `${position * (isMobile ? 88 : 103)}%`,
                  z: isCenter ? 0 : -Math.min(distance, 2) * 150,
                  rotateY: isCenter
                    ? 0
                    : position < 0
                      ? isMobile
                        ? 25
                        : 32
                      : isMobile
                        ? -25
                        : -32,
                  scale: isCenter ? 1 : distance === 1 ? 0.94 : 0.84,
                  opacity: isVisible ? (distance === 2 ? 0.34 : 1) : 0,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
                }
                style={{
                  zIndex: order.length - distance,
                  pointerEvents: distance <= 1 ? "auto" : "none",
                }}
                aria-hidden={!isCenter}
              >
                <button
                  className="pc-card"
                  onClick={() => {
                    if (!didDrag.current) onOpen(project);
                  }}
                  type="button"
                  tabIndex={isCenter ? 0 : -1}
                  aria-label={`Open project: ${project.title}`}
                >
                  <span className="pc-card__media">
                    <img src={project.image} alt="" draggable={false} />
                  </span>
                  <span className="pc-card__footer">
                    <span className="pc-card__title">{project.title}</span>
                    <span className="pc-card__tag">{project.tag}</span>
                  </span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>

        {showNavigation ? (
          <>
            <button
              className="pc-carousel__arrow pc-carousel__arrow--previous"
              onClick={() => shift(-1)}
              type="button"
              aria-label="Previous project"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              className="pc-carousel__arrow pc-carousel__arrow--next"
              onClick={() => shift(1)}
              type="button"
              aria-label="Next project"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : null}

      </div>
    </section>
  );
}
