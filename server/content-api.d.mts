export interface ContentApiOptions {
  root: string;
  dataDir?: string;
  development?: boolean;
  allowLocal?: boolean;
  password?: string;
  siteOrigin?: string;
}

export interface ContentApi {
  handler: (request: unknown, response: unknown, next: () => void) => Promise<void>;
  dataDir: string;
}

export function createContentApi(options: ContentApiOptions): Promise<ContentApi>;
