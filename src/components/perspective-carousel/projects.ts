import type { PerspectiveProject } from "./types";

const assetBase = `${import.meta.env.BASE_URL}assets/perspective-carousel`;

export const perspectiveProjects: PerspectiveProject[] = [
  {
    id: "citydrive",
    title: "CITYDRIVE: Tales from the Crypt",
    tag: "special project",
    coverImage: `${assetBase}/covers/citydrive.webp`,
    image: `${assetBase}/citydrive.png`,
    description:
      "A Halloween campaign that transformed a common carsharing problem into an entertaining user experience.",
    role:
      "My role: developed the creative concept, campaign platform and communication mechanics — from the initial idea to final execution.",
  },
  {
    id: "alfa-smooth-over",
    title: "Alfa-Bank: Smooth Over",
    tag: "TV/OLV",
    coverImage: `${assetBase}/covers/alfa-smooth-over.webp`,
    image: `${assetBase}/alfa-smooth-over.png`,
    description:
      "A bright brand story about learning to navigate everyday conflicts with more ease and a little humour.",
    role:
      "My role: creative concept, visual direction and campaign mechanics across the core video and digital formats.",
  },
  {
    id: "demix",
    title: "Demix: Make Kvadrat Great Again",
    tag: "TV/OOH/DOOH",
    coverImage: `${assetBase}/covers/demix.webp`,
    image: `${assetBase}/demix.png`,
    description:
      "A street-football campaign that turned the neighbourhood pitch into a vivid symbol of shared ambition.",
    role:
      "My role: campaign platform, key visual direction and adaptation of the idea across film and outdoor media.",
  },
  {
    id: "winx",
    title: "WINX CLUB: Welcome to Russia",
    tag: "SMM",
    coverImage: `${assetBase}/covers/winx.webp`,
    image: `${assetBase}/winx.png`,
    description:
      "A social-first launch welcoming an iconic global universe into a distinctly local cultural setting.",
    role:
      "My role: creative platform, launch narrative and a modular social content system for the campaign.",
  },
  {
    id: "beeline",
    title: "Beeline: Your vision — our execution",
    tag: "EVP/Employer Branding",
    coverImage: `${assetBase}/covers/beeline.webp`,
    image: `${assetBase}/beeline.png`,
    description:
      "An employer-brand idea built around the people who turn ambitious visions into things that work.",
    role:
      "My role: strategic creative concept, visual language and communication system for employer branding.",
  },
  {
    id: "alfa-only",
    title: "Alfa-Bank: Alfa Only",
    tag: "TV/OOH/DOOH",
    coverImage: `${assetBase}/covers/alfa-only.webp`,
    image: `${assetBase}/alfa-only.png`,
    description:
      "A premium campaign balancing effortless service, contemporary fashion and an intentionally surreal sense of calm.",
    role:
      "My role: campaign idea, art direction and rollout principles across film, outdoor and digital touchpoints.",
  },
];
