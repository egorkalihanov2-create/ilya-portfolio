import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";

const cases = [
  { image: "./assets/figma/case-1.png", label: "Name of case" },
  { image: "./assets/figma/case-2.png", label: "Name of case" },
  { image: "./assets/figma/case-3.png", label: "Name of case" },
];

const mobileStackOffsets = [
  { x: "16.9vw", y: 0 },
  { x: "0.7vw", y: "-35.3vw" },
  { x: "-15.4vw", y: "-70.9vw" },
];

export function CaseCarousel() {
  const [active, setActive] = useState(0);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const shouldReduceMotion = useReducedMotion();
  const move = (direction: number) => {
    setActive(
      (current) => (current - direction + cases.length) % cases.length,
    );
  };
  const selectCard = (position: number) => {
    if (position === 2) return;
    move(position === 0 ? -1 : 1);
  };

  return (
    <motion.section
      id="cases"
      className="case-carousel"
      aria-label="Selected cases"
      initial={isMobile && !shouldReduceMotion ? "stacked" : false}
      whileInView="spread"
      viewport={{ once: true, amount: 0.28 }}
    >
      <motion.div
        className="case-deck"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 55) move(info.offset.x < 0 ? 1 : -1);
        }}
      >
        {cases.map((item, index) => {
          const position = (index - active + cases.length) % cases.length;
          return (
            <motion.button
              type="button"
              className={`case-card case-position-${position}`}
              key={item.image}
              layout="position"
              custom={position}
              variants={{
                stacked: (cardPosition: number) => ({
                  x: mobileStackOffsets[cardPosition].x,
                  y: mobileStackOffsets[cardPosition].y,
                }),
                spread: (cardPosition: number) => ({
                  x: 0,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 150,
                    damping: 22,
                    delay: cardPosition * 0.12,
                  },
                }),
              }}
              transition={{ type: "spring", stiffness: 180, damping: 24 }}
              aria-label={`Show case ${index + 1}`}
              onClick={() => selectCard(position)}
            >
              <h3>{item.label}</h3>
              <img src={item.image} alt="Portfolio campaign visual" />
            </motion.button>
          );
        })}
      </motion.div>

      <button
        type="button"
        className="gallery-arrow gallery-arrow-prev"
        aria-label="Previous case"
        onClick={() => move(-1)}
      >
        <img src="./assets/figma/arrow-prev.svg" alt="" />
      </button>
      <button
        type="button"
        className="gallery-arrow gallery-arrow-next"
        aria-label="Next case"
        onClick={() => move(1)}
      >
        <img src="./assets/figma/arrow-next.svg" alt="" />
      </button>
    </motion.section>
  );
}
