import { motion } from "motion/react";
import { useState } from "react";

type FolderInteractionProps = {
  title: string;
  logos: string[];
  onOpen: () => void;
};

export function FolderInteraction({
  title,
  logos,
  onOpen,
}: FolderInteractionProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      type="button"
      className="folder-card"
      aria-label={`Open ${title}`}
      onClick={onOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <span className="folder-art" aria-hidden="true">
        <img
          className="folder-back"
          src="./assets/figma/folder-back.svg"
          alt=""
        />

        <span className="folder-logos">
          {logos.slice(0, 2).map((logo, index) => (
            <motion.img
              key={logo}
              src={logo}
              alt=""
              animate={{
                y: isHovered ? -18 - index * 3 : 0,
                rotate: isHovered ? (index === 0 ? -5 : 5) : 0,
              }}
              transition={{ type: "spring", stiffness: 210, damping: 19 }}
            />
          ))}
        </span>

        <motion.img
          className="folder-front"
          src="./assets/figma/folder-front.svg"
          alt=""
          animate={{
            y: isHovered ? 3 : 0,
            rotateX: isHovered ? -12 : 0,
            opacity: isHovered ? 0.72 : 1,
          }}
          transition={{ type: "spring", stiffness: 190, damping: 20 }}
        />
      </span>
      <span className="folder-title">{title}</span>
    </button>
  );
}

export default FolderInteraction;
