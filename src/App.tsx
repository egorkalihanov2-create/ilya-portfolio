import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { CaseCarousel } from "@/components/ui/case-carousel";
import FolderInteraction from "@/components/ui/folder-interaction";
import { FolderPopup } from "@/components/ui/folder-popup";

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
          <img
            src="./assets/figma/hero.png"
            alt="Ilya, the originator"
          />
        </section>

        <section id="about" className="intro-copy">
          <p>
            Hey, I’m Ilya — a Conceptual Creative who’s spent<br className="desktop-break" />
            the last 7 years between global ad agencies, tech teams and brands,
            turning what companies need<br className="desktop-break" />
            to say into ideas people might actually care about
          </p>
        </section>

        <motion.section
          className="statement-block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
        >
          <motion.div
            className="statement-copy"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.65 } },
            }}
          >
            <h2>
              My creative instinct<br />
              is to <u>originate</u>, not decorate.
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
          <div className="portrait-wrap">
            <img src="./assets/figma/portrait.png" alt="Ilya seated outdoors" />
          </div>
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
            WORLD-CHANGERS <span className="brand-dot"><img src="./assets/figma/logo-small.png" alt="" /></span> DO NOT WAIT
            <span className="heinz-pill"><img src="./assets/figma/heinz.png" alt="Heinz" /></span> FOR PERMISSION
          </p>
          <p className="manifesto-bottom">
            And the festival-winning <span className="airbnb-pill"><img src="./assets/figma/airbnb.png" alt="Airbnb" /></span>
            work is proof of that.
          </p>
          <motion.div
            className="floating-object"
            animate={{ y: [-7, 7, -7] }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src="./assets/figma/floating-object.png" alt="D&AD award pencil" />
          </motion.div>
        </section>

        <motion.section
          className="cta-block"
          initial="hidden"
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
              href="mailto:napishi"
              variants={{
                hidden: { opacity: 0, scale: 0.55 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.45, type: "spring" } },
              }}
              animate={{ y: [0, -8, 0] }}
              transition={{ y: { delay: 1.15, duration: 3.4, repeat: Infinity, ease: "easeInOut" } }}
            >
              <img src="./assets/figma/cta-hands.png" alt="" />
              <span>Let’s create<br />something</span>
            </motion.a>
            <motion.a
              className="cta-choice cta-choice-more"
              href="#about"
              variants={{
                hidden: { opacity: 0, scale: 0.55 },
                visible: { opacity: 1, scale: 1, transition: { delay: 0.62, type: "spring" } },
              }}
              animate={{ y: [0, 9, 0] }}
              transition={{ y: { delay: 1.25, duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            >
              <img className="mirror" src="./assets/figma/cta-hands.png" alt="" />
              <span>More<br />about me</span>
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
