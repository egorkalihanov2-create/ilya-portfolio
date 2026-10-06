import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";

const galleryImages = [
  { src: "./assets/cases/case-scroll-1.png", alt: "Casting campaign artwork" },
  { src: "./assets/cases/case-scroll-2.png", alt: "Alfa Only campaign artwork" },
  { src: "./assets/cases/case-scroll-3.png", alt: "Winx Club campaign artwork" },
  { src: "./assets/cases/case-scroll-4.png", alt: "Demix campaign artwork" },
  { src: "./assets/cases/case-scroll-5.png", alt: "Beeline campaign artwork" },
  { src: "./assets/cases/case-scroll-6.png", alt: "Tales from the Crypt campaign artwork" },
];

type GalleryFrameProps = {
  image: (typeof galleryImages)[number];
  index: number;
  progress: MotionValue<number>;
  activeIndex: MotionValue<number>;
  reduceMotion: boolean;
  mobile: boolean;
};

function GalleryFrame({
  image,
  index,
  progress,
  activeIndex,
  reduceMotion,
  mobile,
}: GalleryFrameProps) {
  const parallaxX = useTransform(
    progress,
    [0, 1],
    [`${8 + index * 0.7}%`, `${-8 - index * 0.7}%`],
  );
  const expandedWidth = mobile ? 76 : 59;
  const collapsedWidth = mobile ? 2.8 : 6.5;
  const width = useTransform(activeIndex, (current) => {
    const reveal = Math.max(0, 1 - Math.abs(current - index));
    return `${collapsedWidth + (expandedWidth - collapsedWidth) * reveal}%`;
  });
  const shadeOpacity = useTransform(activeIndex, (current) => {
    const reveal = Math.max(0, 1 - Math.abs(current - index));
    return 0.58 * (1 - reveal);
  });

  return (
    <motion.article className="horizontal-gallery-card" style={{ width }}>
      <motion.img
        src={image.src}
        alt={image.alt}
        draggable={false}
        style={{ x: reduceMotion ? 0 : parallaxX }}
      />
      <motion.span
        className="horizontal-gallery-card-shade"
        aria-hidden="true"
        style={{ opacity: shadeOpacity }}
      />
      <span className="horizontal-gallery-index">{String(index + 1).padStart(2, "0")}</span>
    </motion.article>
  );
}

export function HorizontalParallaxGallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [sectionHeight, setSectionHeight] = useState<number>();
  const reduceMotion = useReducedMotion() ?? false;
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: reduceMotion ? 1000 : 110,
    damping: reduceMotion ? 100 : 28,
    mass: 0.34,
  });
  const activeProgress = reduceMotion ? scrollYProgress : smoothProgress;
  const activeIndex = useTransform(
    activeProgress,
    [0.06, 0.94],
    [0, galleryImages.length - 1],
  );
  const veilOpacity = useTransform(
    scrollYProgress,
    [0, 0.13, 0.8, 1],
    [0, 0.72, 0.72, 0],
  );
  const exitOpacity = useTransform(scrollYProgress, [0.92, 1], [0, 1]);

  useEffect(() => {
    const measure = () => {
      setSectionHeight(window.innerHeight * (galleryImages.length + 0.75));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cases"
      className="horizontal-gallery-section"
      aria-label="Selected cases"
      style={sectionHeight ? { height: sectionHeight } : undefined}
    >
      <motion.div ref={stageRef} className="horizontal-gallery-sticky">
        <motion.div
          className="horizontal-gallery-veil"
          aria-hidden="true"
          style={{ opacity: veilOpacity }}
        />
        <motion.div
          ref={trackRef}
          className="horizontal-gallery-track"
        >
          {galleryImages.map((image, index) => (
            <GalleryFrame
              key={image.src}
              image={image}
              index={index}
              progress={activeProgress}
              activeIndex={activeIndex}
              reduceMotion={reduceMotion}
              mobile={isMobile}
            />
          ))}
        </motion.div>
        <div className="horizontal-gallery-hint" aria-hidden="true">
          <span>Scroll</span>
          <i />
        </div>
        <motion.div
          className="horizontal-gallery-exit"
          aria-hidden="true"
          style={{ opacity: exitOpacity }}
        />
      </motion.div>
    </section>
  );
}
