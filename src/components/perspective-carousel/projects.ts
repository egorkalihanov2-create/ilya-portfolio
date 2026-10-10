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
      "A mockumentary recruitment campaign that turned a negatively perceived contact-center job into a comedy show about the art of smoothing things over.",
    role:
      "My role: developed the creative concept, campaign idea, video scripts and digital mechanics — from the initial insight to the recruitment landing experience.",
  },
  {
    id: "demix",
    title: "Demix: Make Kvadrat Great Again",
    tag: "TV/OOH/DOOH",
    coverImage: `${assetBase}/covers/demix.webp`,
    image: `${assetBase}/demix.png`,
    description:
      "A football special project created for the Russian Championship — bringing the classic Soviet yard game “Kvadrat” back to the streets with a limited kit available with every football purchase. The campaign was amplified through bloggers and athletes, who helped turn the game from a nostalgic childhood memory into a social challenge people could actually play again.",
    role:
      "My role: developed the big idea, creative concept, limited box and unboxing mechanics, plus the creative framework for blogger and athlete integrations.",
  },
  {
    id: "winx",
    title: "WINX CLUB: Welcome to Russia",
    tag: "SMM",
    coverImage: `${assetBase}/covers/winx.webp`,
    image: `${assetBase}/winx.png`,
    description:
      "Not the most complicated case (the hardest part was getting them officially verified, by the way), but definitely one of my favorites — because how often do you come to work and create memes for fairies?",
    role:
      "My role: SMM strategy, content supervision, collaboration ideas, organic promotion and paid media mechanics.",
  },
  {
    id: "beeline",
    title: "Beeline: Your vision — our execution",
    tag: "EVP/Employer Branding",
    coverImage: `${assetBase}/covers/beeline.webp`,
    image: `${assetBase}/beeline.png`,
    description:
      "Beeline was trying to break out of heavy corporate bureaucracy, but many long-time employees no longer believed that real change was possible. We created an EVP platform that brought back a startup-like mindset: your ideas matter, your voice can move things forward, and the company is ready to help make them happen.",
    role:
      "My role: market and competitor analysis, EVP platform development, master slogan, direction-specific messaging and key visual ideas.",
  },
  {
    id: "alfa-only",
    title: "Alfa-Bank: Alfa Only",
    tag: "TV/OOH/DOOH",
    coverImage: `${assetBase}/covers/alfa-only.webp`,
    image: `${assetBase}/alfa-only.png`,
    description:
      "A nationwide campaign for a premium travel card, introducing Oscar- and Golden Globe-nominated actor Yura Borisov as the new Alfa Only brand ambassador.",
    role:
      "My role: campaign positioning, video scripts, photo shoot concept and key visual direction for TV, OOH and airport DOOH.",
  },
];
