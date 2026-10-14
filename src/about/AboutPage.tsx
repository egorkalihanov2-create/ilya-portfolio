import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

const storyParagraphs = [
  "I still believe advertising can be art.",
  "Not all of it. Not by default. And definitely not the kind made just to please the boardroom or win another award.",
  "I mean those rare moments when someone sees an ad — and doesn’t scroll past it. When people stop. Smile. Argue with it. Send it to a friend. Or simply feel that the product has something to say, not just something to sell.",
  "That’s probably why I ended up in creative.",
  "My path wasn’t exactly classic. I didn’t come from copywriting or art direction. I came through strategy. And that shaped the way I think about ideas.",
  "To me, an idea is not just a nice line or a beautiful picture. It has to serve a purpose.",
  "Make the product make sense.\nMake the brand feel less like everyone else.\nMake people want to hear the rest.",
  "That’s how I ended up working across very different worlds: memes for Winx fairies, a horror podcast told by a carsharing vehicle, a mockumentary about a student who knows how to smooth things over, or an EVP platform for a big company where people needed to believe in change again.",
  "Different worlds. Different problems. Same instinct: look past the obvious and find the thought that makes the brief feel alive.",
  "So yes, I still believe advertising can be art.",
  "Not museum art. Not pretentious art. The kind that helps people notice something, feel something, or see something differently.",
  "And honestly, we need more of that.",
  "Because Earth without art is just “eh”.",
];

const tools = [
  {
    label: "Thinking & writing",
    description: (
      <><strong>ChatGPT, Claude, DeepSeek</strong> — for research, idea development, scripts, copy, case structure and strategic sparring.</>
    ),
  },
  {
    label: "Visual exploration",
    description: (
      <><strong>Midjourney, Firefly, Nano Banana</strong> — for visual directions, references, moodboards and fast concept exploration.</>
    ),
  },
  {
    label: "Design & presentations",
    description: (
      <><strong>Figma, Photoshop, Keynote</strong> — for layouts, storyboards, presentation systems and polished creative decks.</>
    ),
  },
  {
    label: "Video & audio prototyping",
    description: (
      <><strong>Runway, Kling, ElevenLabs</strong> — for animatics, motion tests, voice experiments and quick audiovisual prototypes.</>
    ),
  },
] as const;

const lineLayouts = [
  { left: "7.7%", top: "38.9%", width: "11.4%", rotate: "0deg", flip: 1 },
  { left: "35.5%", top: "32.5%", width: "10.8%", rotate: "18deg", flip: 1 },
  { left: "69.5%", top: "31.5%", width: "10.5%", rotate: "47deg", flip: -1 },
  { left: "51.5%", top: "40%", width: "11%", rotate: "28deg", flip: 1 },
] as const;

function Header() {
  return (
    <header className="about-header">
      <nav aria-label="Main navigation">
        <a href="./index.html">Main</a>
        <a href="./about.html" aria-current="page">About me</a>
        <a href="./index.html#cases">Cases</a>
        <a href="./index.html#contacts">Contacts</a>
      </nav>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.62], [1, 0.92, 0]);
  const baseX = useTransform(scrollYProgress, [0, 0.16, 0.25, 0.34, 0.62], [0, 0, -4, 5, 0]);
  const redX = useTransform(scrollYProgress, [0, 0.12, 0.22, 0.32, 0.62], [0, 0, 10, -7, 1]);
  const cyanX = useTransform(scrollYProgress, [0, 0.14, 0.24, 0.36, 0.62], [0, 0, -9, 8, -1]);
  const splitOpacity = useTransform(scrollYProgress, [0, 0.14, 0.24, 0.48, 0.62], [0, 0, 0.35, 0.18, 0]);

  return (
    <section ref={ref} id="top" className="about-hero" aria-label="About me">
      <img className="about-hero-background" src="./assets/figma/about/background.png" alt="Creative workshop audience" />
      <img className="about-hero-object" src="./assets/figma/about/object.png" alt="Ilya sitting in the audience" />
      <div className="about-hero-title" aria-label="About me">
        <motion.span style={reduceMotion ? undefined : { opacity, x: baseX }}>About me</motion.span>
        {!reduceMotion && <>
          <motion.span className="about-hero-title-split split-red" aria-hidden style={{ opacity: splitOpacity, x: redX }}>About me</motion.span>
          <motion.span className="about-hero-title-split split-cyan" aria-hidden style={{ opacity: splitOpacity, x: cyanX }}>About me</motion.span>
        </>}
      </div>
    </section>
  );
}

function Story() {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`about-story${expanded ? " is-expanded" : ""}`}
      animate={{ height: expanded ? "auto" : undefined }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="about-story-copy" id="about-story-copy">
        {storyParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {!expanded && (
          <motion.button
            type="button"
            className="about-pill about-story-button"
            onClick={() => setExpanded(true)}
            aria-controls="about-story-copy"
            aria-expanded="false"
            exit={{ opacity: 0, scale: 0.8, y: 14 }}
            whileHover={reduceMotion ? undefined : { scale: 1.035 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
          >
            Tell me a story
          </motion.button>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function CreativeTools() {
  const [active, setActive] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const smoothX = useSpring(cursorX, { stiffness: 650, damping: 42, mass: 0.18 });
  const smoothY = useSpring(cursorY, { stiffness: 650, damping: 42, mass: 0.18 });
  const line = lineLayouts[active];

  return (
    <section
      className="about-tools"
      data-active={active}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setCursorVisible(true);
      }}
      onPointerLeave={() => setCursorVisible(false)}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        cursorX.set(event.clientX - rect.left - 24);
        cursorY.set(event.clientY - rect.top - 24);
      }}
    >
      <div className="about-tools-heading">
        <h2>AI &amp; Creative Tools</h2>
        <img src="./assets/figma/about/ui.svg" alt="" />
      </div>

      <div className="about-tools-buttons" role="tablist" aria-label="Creative tool categories">
        {tools.map((tool, index) => (
          <motion.button
            key={tool.label}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls="creative-tool-description"
            className={`about-tool-pill about-tool-pill-${index}`}
            onClick={() => setActive(index)}
            whileHover={reduceMotion ? undefined : { scale: 1.045 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          >
            {tool.label}
          </motion.button>
        ))}
      </div>

      <img
        className="about-tools-line"
        src="./assets/figma/about/line.svg"
        alt=""
        style={{ left: line.left, top: line.top, width: line.width, transform: `rotate(${line.rotate}) scaleX(${line.flip})` }}
      />

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={active}
          id="creative-tool-description"
          className="about-tools-description"
          role="tabpanel"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: reduceMotion ? 0 : 0.24 }}
        >
          {tools[active].description}
        </motion.p>
      </AnimatePresence>

      <motion.img
        className="about-tools-cursor"
        src="./assets/figma/about/cursor.png"
        alt=""
        aria-hidden
        style={{ x: smoothX, y: smoothY }}
        animate={{ opacity: cursorVisible ? 1 : 0, scale: cursorVisible ? 1 : 0.72 }}
        transition={{ duration: reduceMotion ? 0 : 0.14 }}
      />
    </section>
  );
}

export default function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="about-shell">
      <Header />
      <main className="about-flow">
        <Hero />
        <Story />

        <section className="about-dna" aria-labelledby="creative-dna-heading">
          <h2 id="creative-dna-heading">Creative DNA</h2>
          <img src="./assets/figma/about/creative-dna.png" alt="Creative DNA: Ilya holding his dog, surrounded by creative strengths" />
        </section>

        <CreativeTools />

        <section className="about-ending">
          <p>You’ve reached the end, but this is just the beginning.</p>
          <div className="about-ending-actions">
            <motion.a
              className="about-pill about-create-link"
              href="https://t.me/wilyam_the_originator"
              target="_blank"
              rel="noreferrer"
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.025 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Let’s create<br />something
            </motion.a>
            <motion.a
              className="about-pill about-main-link"
              href="./index.html"
              whileHover={reduceMotion ? undefined : { y: -4, scale: 1.025 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              Go to<br />Main Page
            </motion.a>
          </div>
        </section>

        <footer id="contacts" className="about-footer">
          <span>Send me a cat sticker, and I’ll know we have something to talk about)</span>
          <a href="https://t.me/wilyam_the_originator">tg: @wilyam_the_originator</a>
        </footer>
      </main>
    </div>
  );
}
