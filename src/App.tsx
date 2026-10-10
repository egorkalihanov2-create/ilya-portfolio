import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import FolderInteraction from "@/components/ui/folder-interaction";
import { FolderPopup } from "@/components/ui/folder-popup";
import {
  PerspectiveCarouselWithModal,
  loadCaseCatalog,
  perspectiveProjects,
} from "@/components/perspective-carousel";
import { useMediaQuery } from "@/lib/use-media-query";

const folders = [
  {
    id: "global",
    title: "Global & regional brands",
    logos: [
      "./assets/figma/projects/alfa.png",
      "./assets/figma/projects/pepsico.png",
    ],
    projects: [
      { name: "Pepsico", logo: "./assets/figma/projects/pepsico.png" },
      { name: "Alfa Bank", logo: "./assets/figma/projects/alfa.png" },
      { name: "Beeline", logo: "./assets/figma/projects/beeline.png" },
      { name: "Level Group", logo: "./assets/figma/projects/level-group.png" },
      { name: "Megafon", logo: "./assets/figma/projects/megafon.png", logoClass: "logo-megafon" },
      { name: "Yota Mobile", logo: "./assets/figma/projects/yota.png" },
      { name: "Demix", logo: "./assets/figma/projects/demix.png", logoClass: "logo-demix" },
    ],
  },
  {
    id: "tech",
    title: "Tech & products",
    logos: [
      "./assets/figma/projects/citydrive.png",
      "./assets/figma/projects/yandex-market.png",
    ],
    projects: [
      { name: "Yandex Market", logo: "./assets/figma/projects/yandex-market.png" },
      { name: "Yandex Go", logo: "./assets/figma/projects/yandex-go.svg" },
      { name: "Citydrive", logo: "./assets/figma/projects/citydrive.png" },
      { name: "Green Cars Compare", logo: "./assets/figma/projects/green-cars.svg" },
    ],
  },
  {
    id: "agencies",
    title: "Agencies & creative companies",
    logos: [
      "./assets/figma/projects/setters.svg",
      "./assets/figma/projects/winx.png",
    ],
    projects: [
      { name: "SETTERS", logo: "./assets/figma/projects/setters.svg", logoClass: "logo-setters" },
      { name: "Winx", logo: "./assets/figma/projects/winx.png", logoClass: "logo-winx" },
      { name: "Skolkovo", logo: "./assets/figma/projects/skolkovo.svg" },
      { name: "Beyond Tailor", logo: "./assets/figma/projects/beyond-tailor.png", logoClass: "logo-beyond" },
    ],
  },
  {
    id: "fmcg",
    title: "FMCG",
    logos: [
      "./assets/figma/projects/kozel.png",
      "./assets/figma/projects/prostokvashino.png",
    ],
    projects: [
      { name: "Kozel", logo: "./assets/figma/projects/kozel.png" },
      { name: "Green Baboon", logo: "./assets/figma/projects/green-baboon.png", logoClass: "logo-green-baboon" },
      { name: "Prostokvashino", logo: "./assets/figma/projects/prostokvashino.png" },
    ],
  },
] as const;

type FolderData = (typeof folders)[number];

export default function App() {
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [caseProjects, setCaseProjects] = useState(perspectiveProjects);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const closePopup = useCallback(() => setSelectedFolder(null), []);

  useEffect(() => {
    let active = true;
    const load = () => {
      void loadCaseCatalog()
        .then((catalog) => {
          if (active) setCaseProjects(catalog.projects);
        })
        .catch(() => {
          // Keep the bundled fallback if the editable catalog is unavailable.
        });
    };
    const channel = "BroadcastChannel" in window
      ? new BroadcastChannel("ilya-case-catalog")
      : null;
    channel?.addEventListener("message", load);
    window.addEventListener("focus", load);
    load();
    return () => {
      active = false;
      channel?.close();
      window.removeEventListener("focus", load);
    };
  }, []);

  return (
    <div className="site-shell">
      <header className="site-header">
        <nav aria-label="Main navigation">
          <a href="#main">Main</a>
          <a href="#about">About me</a>
          <a href="#cases">Cases</a>
          <a href="#contacts">Contacts</a>
        </nav>
      </header>

      <main id="main" className="main-flow">
        <section className="hero-block" aria-label="Introduction">
          <picture>
            <source media="(max-width: 480px)" srcSet="./assets/figma/mobile-hero.png" />
            <img src="./assets/figma/hero.png" alt="Ilya, the originator" />
          </picture>
        </section>

        <motion.section
          id="about"
          className="intro-copy"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.65 } },
          }}
        >
          <p>
            Hey, I’m Ilya — a Conceptual Creative from Minsk who’s spent<br className="desktop-break" />
            the last 7 years between global ad agencies, tech teams and brands,
            turning what companies need<br className="desktop-break" />
            to say into ideas people might actually care about
          </p>
        </motion.section>

        <motion.section
          className="statement-block"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.div
            className="portrait-wrap"
            variants={{
              hidden: { opacity: isMobile ? 0 : 1, scale: isMobile ? 1.025 : 1 },
              visible: {
                opacity: 1,
                scale: 1,
                transition: { duration: 0.58, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            <picture>
              <source media="(max-width: 480px)" srcSet="./assets/figma/mobile-statement.png" />
              <img src="./assets/figma/portrait.png" alt="Ilya seated outdoors" />
            </picture>
          </motion.div>
          <motion.div
            className="statement-shade"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { delay: isMobile ? 0.42 : 0, duration: 0.45 },
              },
            }}
          />
          <motion.div
            className="statement-copy"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { delay: isMobile ? 0.78 : 0, duration: 0.58 },
              },
            }}
          >
            <h2>
              My creative instinct<br />
              is to <u>originate</u>, not decorate<span className="statement-period">.</span>
            </h2>
            <p>
              I like the “<span className="highlight-wrap">zero to one
                <motion.span
                  className="highlight-stroke"
                  variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                  transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>” kind of thinking — creating something new instead of
              endlessly polishing
            </p>
          </motion.div>
        </motion.section>

        <section className="work-block" aria-labelledby="work-heading">
          <div className="work-heading-row">
            <h2 id="work-heading">Work with</h2>
            <img src="./assets/figma/folder-menu.svg" alt="" />
          </div>
          <div className="folders-grid">
            {folders.map((folder) => (
              <FolderInteraction
                key={folder.title}
                title={folder.title}
                logos={[...folder.logos]}
                onOpen={() => setSelectedFolder(folder)}
              />
            ))}
          </div>
        </section>

        <PerspectiveCarouselWithModal projects={caseProjects} />

        <section className="manifesto-block">
          <p className="manifesto-top">
            WORLD-CHANGERS <motion.a
              className="brand-dot manifesto-action"
              href="https://youtu.be/JxxppIriCwo"
              target="_blank"
              rel="noreferrer"
              aria-label="Open project video"
              initial={shouldReduceMotion ? false : { scale: 1 }}
              whileInView={shouldReduceMotion ? undefined : { scale: [1, 1.36, 0.94, 1] }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ delay: 0.05, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            ><img src="./assets/figma/logo-small.png" alt="" /></motion.a><br className="manifesto-mobile-break" /> DO NOT WAIT
            <motion.a
              className="heinz-pill manifesto-action"
              href="https://youtu.be/WG3IXn9B1lA"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Heinz project video"
              initial={shouldReduceMotion ? false : { scale: 1 }}
              whileInView={shouldReduceMotion ? undefined : { scale: [1, 1.3, 0.96, 1] }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ delay: 0.2, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            ><img src="./assets/figma/heinz.png" alt="Heinz" /></motion.a> FOR PERMISSION
          </p>
          <p className="manifesto-bottom">
            And the festival-winning <motion.a
              className="airbnb-pill manifesto-action"
              href="https://docs.google.com/presentation/d/11pPwlESlAM9gZ4YUOvBcD7anuS9MlzcKkCkUtEQGRSk/edit"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Airbnb project presentation"
              initial={shouldReduceMotion ? false : { scale: 1 }}
              whileInView={shouldReduceMotion ? undefined : { scale: [1, 1.32, 0.95, 1] }}
              viewport={{ once: true, amount: 0.9 }}
              transition={{ delay: 0.35, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            ><img src="./assets/figma/airbnb.png" alt="Airbnb" /></motion.a>
            work is proof of <span className="manifesto-ending">
              that.
              <motion.span
                className="floating-object"
                animate={shouldReduceMotion ? undefined : {
                  y: ["-4%", "4%", "-4%"],
                  rotate: [-0.8, 0.8, -0.8],
                }}
                transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="./assets/figma/pen.png" alt="D&AD award pencil" />
              </motion.span>
            </span>
          </p>
        </section>

        <motion.section
          className="cta-block"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.div
            className="cta-intro"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.55 } },
            }}
          >
            <img src="./assets/figma/cta-head.png" alt="Ilya" />
            <h2>I&apos;m done talking. Ready to start doing?</h2>
          </motion.div>

          <div className="cta-actions">
            <motion.a
              className="cta-choice cta-choice-create"
              href="https://t.me/wilyam_the_originator"
              target="_blank"
              rel="noreferrer"
              variants={{
                hidden: { opacity: 0, y: 120, scale: 0.72 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 0.72, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <motion.div
                className="cta-float"
                animate={shouldReduceMotion ? undefined : { y: [-8, 8, -8] }}
                transition={{ delay: 1.45, duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img src="./assets/figma/cta-hands.png" alt="" />
                <span>Let’s create<br />something</span>
              </motion.div>
            </motion.a>
            <motion.a
              className="cta-choice cta-choice-more"
              href="#about"
              variants={{
                hidden: { opacity: 0, y: 120, scale: 0.72 },
                visible: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: 0.72, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              <motion.div
                className="cta-float"
                animate={shouldReduceMotion ? undefined : { y: [8, -8, 8] }}
                transition={{ delay: 1.45, duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img className="mirror" src="./assets/figma/cta-hands.png" alt="" />
                <span>More<br />about me</span>
              </motion.div>
            </motion.a>
          </div>
        </motion.section>

        <footer id="contacts" className="contacts-block">
          <a href="https://t.me/wilyam_the_originator">tg: @wilyam_the_originator</a>
          <a href="mailto:novik.brand@gmail.com">gmail: novik.brand@gmail.com</a>
        </footer>
      </main>

      <FolderPopup folder={selectedFolder} onClose={closePopup} />
    </div>
  );
}
