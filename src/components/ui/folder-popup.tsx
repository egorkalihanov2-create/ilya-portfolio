import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

type FolderPopupProps = {
  folder: {
    id: string;
    title: string;
    projects: readonly {
      name: string;
      logo: string;
      logoClass?: string;
    }[];
  } | null;
  onClose: () => void;
};

export function FolderPopup({ folder, onClose }: FolderPopupProps) {
  const open = Boolean(folder);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="popup-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) onClose();
          }}
        >
          <motion.section
            className={`folder-popup folder-popup-${folder?.id ?? "closed"}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-popup-title"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 25 }}
          >
            <header className="popup-header">
              <h2 id="folder-popup-title">{folder?.title}</h2>
              <button type="button" className="popup-back" onClick={onClose}>
                <img src="./assets/figma/arrow-back.svg" alt="" />
                Back
              </button>
            </header>
            <div className="brand-grid">
              {folder?.projects.map((project, index) => (
                <motion.div
                  className="brand-item"
                  key={project.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.05 }}
                >
                  <span className={`project-logo ${project.logoClass ?? ""}`}>
                    <img src={project.logo} alt="" />
                  </span>
                  <span>{project.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
