export interface CaseMedia {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  caption?: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export interface CaseTextBlock {
  id: string;
  type: "text";
  heading?: string;
  text: string;
}

export interface CaseMediaBlock {
  id: string;
  type: "media";
  item: CaseMedia;
}

export interface CaseCarouselBlock {
  id: string;
  type: "carousel";
  layout?: "carousel" | "grid";
  columns?: 2 | 3 | 4;
  items: CaseMedia[];
}

export type CaseBlock = CaseTextBlock | CaseMediaBlock | CaseCarouselBlock;

export interface PerspectiveProject {
  id: string;
  title: string;
  tag: string;
  coverImage: string;
  image: string;
  previewVideo?: CaseMedia;
  blocks?: CaseBlock[];
  description?: string;
  role?: string;
}

export interface CaseCatalog {
  version: 1;
  revision: number;
  projects: PerspectiveProject[];
}
