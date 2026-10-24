import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { PerspectiveProject } from "./types";
import "./mobile-stacked-carousel.css";

interface MobileStackedCarouselBlockProps {
  projects: PerspectiveProject[];
  onOpen: (project: PerspectiveProject) => void;
}

export function MobileStackedCarouselBlock({
  projects,
  onOpen,
}: MobileStackedCarouselBlockProps) {
  const [order, setOrder] = useState(projects);
  const [concealedIds, setConcealedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const activeX = useMotionValue(0);
  const activeOpacity = useMotionValue(1);
  const reduceMotion = useReducedMotion();
  const isTransitioning = useRef(false);
  const didDrag = useRef(false);

  useEffect(() => {
    setOrder(projects);
    setConcealedIds(new Set());
  }, [projects]);

  const exitTo = useCallback(
    async (nextOrder: PerspectiveProject[], direction: -1 | 1) => {
      if (
        isTransitioning.current ||
        !order[0] ||
        nextOrder[0]?.id === order[0]?.id
      ) {
        return;
      }

      isTransitioning.current = true;
      const duration = reduceMotion ? 0.01 : 0.28;
      const exitDistance = direction * Math.max(window.innerWidth * 0.72, 420);
      const outgoingId = order[0].id;

      await Promise.all([
        animate(activeOpacity, 0, { duration, ease: "easeOut" }),
        animate(activeX, exitDistance, {
          duration,
          ease: [0.4, 0, 0.2, 1],
        }),
      ]);

      flushSync(() => {
        setConcealedIds((current) => new Set(current).add(outgoingId));
        setOrder(nextOrder);
      });
      activeX.set(0);
      activeOpacity.set(1);
      isTransitioning.current = false;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setConcealedIds((current) => {
            const next = new Set(current);
            next.delete(outgoingId);
            return next;
          });
        });
      });
    },
    [activeOpacity, activeX, order, reduceMotion],
  );

  const moveCurrentToEnd = useCallback(
    (direction: -1 | 1) => {
      if (order.length < 2) return;
      void exitTo([...order.slice(1), order[0]], direction);
    },
    [exitTo, order],
  );

  const movePreviousToFront = useCallback(() => {
    if (order.length < 2) return;
    const previous = order.at(-1)!;
    const middle = order.slice(1, -1);
    void exitTo([previous, ...middle, order[0]], 1);
  }, [exitTo, order]);

  return (
    <section className="msc-block" id="cases">
      <div
        className="msc-stack"
        role="region"
        aria-label="Stacked project carousel"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveCurrentToEnd(-1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            movePreviousToFront();
          }
        }}
      >
        <div className="msc-stack__stage">
          {order.map((project, index) => {
            const isActive = index === 0;
            const hidden = index >= 4;
            const scale = Math.max(0.7, 1 - index * 0.065);
            const y = -index * 42;

            return (
              <motion.div
                className="msc-stack__card-position"
                data-project-id={project.id}
                data-stack-index={index}
                data-visible={hidden ? "false" : "true"}
                key={project.id}
                initial={false}
                animate={{
                  y,
                  scale,
                  opacity: hidden ? 0 : 1,
                  filter: "blur(0px)",
                }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        default: {
                          type: "spring",
                          stiffness: 270,
                          damping: 27,
                          mass: 0.8,
                        },
                        opacity: { duration: 0 },
                      }
                }
                style={{
                  zIndex: order.length - index,
                  pointerEvents: isActive ? "auto" : "none",
                }}
                aria-hidden={!isActive}
              >
                <motion.div
                  className="msc-stack__swipe-card"
                  key={`${project.id}-${isActive ? "active" : "inactive"}-${
                    concealedIds.has(project.id) ? "concealed" : "visible"
                  }`}
                  drag={isActive ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.72}
                  dragMomentum={false}
                  style={
                    isActive
                      ? { x: activeX, opacity: activeOpacity }
                      : {
                          x: 0,
                          opacity: concealedIds.has(project.id) ? 0 : 1,
                        }
                  }
                  onDragStart={() => {
                    didDrag.current = false;
                  }}
                  onDrag={(_, info) => {
                    if (Math.abs(info.offset.x) > 6) didDrag.current = true;
                    activeOpacity.set(
                      Math.max(0.18, 1 - Math.abs(info.offset.x) / 230),
                    );
                  }}
                  onDragEnd={(_, info) => {
                    const shouldDismiss =
                      Math.abs(info.offset.x) > 72 ||
                      Math.abs(info.velocity.x) > 480;

                    if (shouldDismiss) {
                      moveCurrentToEnd(info.offset.x >= 0 ? 1 : -1);
                    } else {
                      const duration = reduceMotion ? 0.01 : 0.22;
                      void animate(activeX, 0, { duration, ease: "easeOut" });
                      void animate(activeOpacity, 1, {
                        duration,
                        ease: "easeOut",
                      });
                    }

                    window.setTimeout(() => {
                      didDrag.current = false;
                    }, 60);
                  }}
                >
                  <button
                    className="msc-card"
                    onClick={() => {
                      if (!didDrag.current) onOpen(project);
                    }}
                    type="button"
                    tabIndex={isActive ? 0 : -1}
                    aria-label={`Open project: ${project.title}`}
                  >
                    <span className="msc-card__media">
                      <img src={project.image} alt="" draggable={false} />
                    </span>
                    <span className="msc-card__footer">
                      <span className="msc-card__title">{project.title}</span>
                      <span className="msc-card__tag">{project.tag}</span>
                    </span>
                  </button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
