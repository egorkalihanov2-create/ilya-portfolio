import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, useState, type CSSProperties } from "react";

type CSSCustomProperties = CSSProperties & Record<`--${string}`, string | number>;

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
      <><strong>ChatGPT, Claude, DeepSeek</strong> —<br className="about-tools-mobile-break" /> for research, idea development, scripts, copy, case structure and strategic sparring.</>
    ),
  },
  {
    label: "Visual exploration",
    description: (
      <><strong>NanoBanana, ChatGPT, Midjourney</strong> —<br className="about-tools-mobile-break" /> for moodboards, visual territories, key visuals and fast image prototyping.</>
    ),
  },
  {
    label: "Design & presentations",
    description: (
      <><strong>Figma, Google Slides, Base44, Readymag</strong> —<br className="about-tools-mobile-break" /> for decks, layouts, case studies and final idea packaging.</>
    ),
  },
  {
    label: "Video & audio prototyping",
    description: (
      <><strong>Higgsfield, ElevenLabs, Flow, Kling</strong> —<br className="about-tools-mobile-break" /> for animatics, video/audio references and early proof of concept.</>
    ),
  },
] as const;

const toolLines = [
  {
    src: "./assets/figma/about/line.svg",
    mobileSrc: "./assets/figma/about/mobile-line-yellow.svg",
    box: { left: "8.3615%", top: "38.9247%", width: "11.3932%", height: "22.4637%" },
    mobileBox: { left: "11.403763%", top: "25.97785%", width: "10.709178%", height: "47.758681%" },
    image: { top: "-0.71%", left: "-1.43%", width: "101.61%", height: "102.15%" },
    mirrored: false,
  },
  {
    src: "./assets/figma/about/line-2.svg",
    mobileSrc: "./assets/figma/about/mobile-line-green.svg",
    box: { left: "28.4731%", top: "31.5054%", width: "7.3852%", height: "22.7957%" },
    mobileBox: { left: "73.28726%", top: "35.915608%", width: "11.165995%", height: "38.085934%" },
    image: { top: "-1.05%", left: "-2.21%", width: "103.69%", height: "102.12%" },
    mirrored: false,
  },
  {
    src: "./assets/figma/about/line-4.svg",
    mobileSrc: "./assets/figma/about/mobile-line-purple.svg",
    box: { left: "81.0839%", top: "32.3656%", width: "6.2109%", height: "29.9462%" },
    mobileBox: { left: "63.207684%", top: "66.098043%", width: "2.737586%", height: "8.343055%" },
    image: { top: "-0.58%", left: "-2.63%", width: "105.26%", height: "101.6%" },
    mirrored: true,
  },
  {
    src: "./assets/figma/about/line-3.svg",
    mobileSrc: "./assets/figma/about/mobile-line-red.svg",
    box: { left: "60.4359%", top: "42.9032%", width: "6.485%", height: "12.2581%" },
    mobileBox: { left: "14.336041%", top: "51.777558%", width: "16.034562%", height: "22.508132%" },
    image: { top: "-2.59%", left: "-2.52%", width: "103.33%", height: "105.08%" },
    mirrored: true,
  },
] as const;

function Header() {
  return (
    <header className="about-header">
      <nav aria-label="Main navigation">
        <a href="./index.html">Main</a>
        <a href="./about.html" aria-current="page">About me</a>
        <a href="./cases.html">Cases</a>
        <a href="./contacts.html">Contacts</a>
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
      <img className="about-hero-background" src="./assets/figma/about/hero-figma-background.png" alt="Creative workshop audience" />
      <img className="about-hero-object" src="./assets/figma/about/hero-figma-object.png" alt="Ilya sitting in the audience" />
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
  const line = toolLines[active];
  const lineStyle = {
    ...line.box,
    "--mobile-line-left": line.mobileBox.left,
    "--mobile-line-top": line.mobileBox.top,
    "--mobile-line-width": line.mobileBox.width,
    "--mobile-line-height": line.mobileBox.height,
  } as CSSCustomProperties;

  const positionCursor = (
    element: HTMLElement,
    clientX: number,
    clientY: number,
  ) => {
    const rect = element.getBoundingClientRect();
    cursorX.set(clientX - rect.left - 24);
    cursorY.set(clientY - rect.top - 24);
  };

  return (
    <section
      className="about-tools"
      data-active={active}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        positionCursor(event.currentTarget, event.clientX, event.clientY);
        setCursorVisible(true);
      }}
      onPointerLeave={() => setCursorVisible(false)}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        positionCursor(event.currentTarget, event.clientX, event.clientY);
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

      <div
        key={line.src}
        className={`about-tools-line${line.mirrored ? " is-mirrored" : ""}`}
        aria-hidden
        style={lineStyle}
      >
        <picture>
          <source media="(max-width: 600px)" srcSet={line.mobileSrc} />
          <img src={line.src} alt="" style={line.image} />
        </picture>
      </div>

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
        style={{ x: cursorX, y: cursorY }}
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
