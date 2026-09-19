import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { CaseCarousel } from "@/components/ui/case-carousel";
import FolderInteraction from "@/components/ui/folder-interaction";
import { FolderPopup } from "@/components/ui/folder-popup";
import { useMediaQuery } from "@/lib/use-media-query";

const folders = [
  {
    title: "Global & regional brands",
    logos: [
      "./assets/figma/logo-alfa.png",
      "./assets/figma/logo-pepsico.png",
    ],
    featured: true,
  },
  {
    title: "Tech & products",
    logos: [
      "./assets/figma/logo-tech.png",
      "./assets/figma/logo-yandex.png",
    ],
  },
  {
    title: "Agencies & creative companies",
    logos: [
      "./assets/figma/logo-spotify.png",
      "./assets/figma/logo-yandex.png",
    ],
  },
  {
    title: "FMCG",
    logos: [
      "./assets/figma/logo-spotify.png",
      "./assets/figma/logo-yandex.png",
    ],
  },
];

export default function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const closePopup = useCallback(() => setIsPopupOpen(false), []);

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
            Hey, I’m Ilya — a Conceptual Creative who’s spent<br className="desktop-break" />
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
              I like the <span className="highlight-wrap">“zero to one”
                <motion.span
                  className="highlight-stroke"
                  variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                  transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </span> kind of thinking — creating something new instead of
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
                {...folder}
                onOpen={() => setIsPopupOpen(true)}
              />
            ))}
          </div>
        </section>

        <CaseCarousel />

        <section className="manifesto-block">
          <p className="manifesto-top">
            WORLD-CHANGERS <span className="brand-dot"><img src="./assets/figma/logo-small.png" alt="" /></span><br className="manifesto-mobile-break" /> DO NOT WAIT
            <span className="heinz-pill"><img src="./assets/figma/heinz.png" alt="Heinz" /></span> FOR PERMISSION
          </p>
          <p className="manifesto-bottom">
            And the festival-winning <span className="airbnb-pill"><img src="./assets/figma/airbnb.png" alt="Airbnb" /></span>
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
          <a href="tel:+79319992201">phone: +7 931 999 2201</a>
          <a href="mailto:napishi">gmail: napishi</a>
        </footer>
      </main>

      <FolderPopup open={isPopupOpen} onClose={closePopup} />
    </div>
  );
}
