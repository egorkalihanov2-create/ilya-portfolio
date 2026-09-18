import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

type FolderPopupProps = {
  open: boolean;
  onClose: () => void;
};

const brands = [
  ["Alfa Bank", "./assets/figma/logo-alfa.png"],
  ["Pepsico", "./assets/figma/logo-pepsico.png"],
  ["Spotify", "./assets/figma/logo-spotify.png"],
  ["Yandex Market", "./assets/figma/logo-yandex.png"],
  ["Yota Mobile", "./assets/figma/logo-yota.png"],
];

export function FolderPopup({ open, onClose }: FolderPopupProps) {
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
            className="folder-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-popup-title"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 25 }}
          >
            <header className="popup-header">
              <h2 id="folder-popup-title">Global &amp; regional brands</h2>
              <button type="button" className="popup-back" onClick={onClose}>
                <img src="./assets/figma/arrow-back.svg" alt="" />
                Back
              </button>
            </header>
            <div className="brand-grid">
              {brands.map(([name, logo], index) => (
                <motion.div
                  className="brand-item"
                  key={name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.05 }}
                >
                  <img src={logo} alt="" />
                  <span>{name}</span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
