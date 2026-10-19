import { useEffect, useMemo, useState } from "react";
import {
  loadCaseCatalog,
  perspectiveProjects,
  type PerspectiveProject,
} from "@/components/perspective-carousel";
import { CaseDetailView } from "./CaseDetailView";

const preferredTagOrder = [
  "Special project",
  "OLV",
  "Influence",
  "SMM",
  "DOOH",
  "EVP",
  "Employer Branding",
  "TV",
  "OOH",
];

const preferredProjectOrder = [
  "alfa-smooth-over",
  "demix",
  "winx",
  "beeline",
  "alfa-only",
  "citydrive",
];

function splitTags(tag: string) {
  return tag
    .split("/")
    .map((value) => value.trim())
    .filter(Boolean);
}

function projectHasTag(project: PerspectiveProject, tag: string) {
  return splitTags(project.tag).some(
    (projectTag) => projectTag.toLocaleLowerCase() === tag.toLocaleLowerCase(),
  );
}

function Header() {
  return (
    <header className="site-header">
      <nav aria-label="Main navigation">
        <a href="./index.html">Main</a>
        <a href="./about.html">About me</a>
        <a href="./cases.html" aria-current="page">Cases</a>
        <a href="./contacts.html">Contacts</a>
      </nav>
    </header>
  );
}

export default function CasesPage() {
  const [projects, setProjects] = useState(perspectiveProjects);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("case");
  });

  useEffect(() => {
    const controller = new AbortController();
    void loadCaseCatalog(controller.signal)
      .then((catalog) => setProjects(catalog.projects))
      .catch(() => {
        // Keep the bundled fallback when the editable catalog is unavailable.
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const updateFromHistory = () => {
      setSelectedProjectId(new URLSearchParams(window.location.search).get("case"));
    };
    window.addEventListener("popstate", updateFromHistory);
    return () => window.removeEventListener("popstate", updateFromHistory);
  }, []);

  const tags = useMemo(() => {
    const catalogTags = projects.flatMap((project) => splitTags(project.tag));
    const uniqueTags = new Map<string, string>();
    for (const tag of [...preferredTagOrder, ...catalogTags]) {
      const key = tag.toLocaleLowerCase();
      if (!uniqueTags.has(key)) uniqueTags.set(key, tag);
    }
    return [...uniqueTags.values()];
  }, [projects]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aIndex = preferredProjectOrder.indexOf(a.id);
      const bIndex = preferredProjectOrder.indexOf(b.id);
      return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex)
        - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
    });
  }, [projects]);

  const visibleProjects = useMemo(() => {
    return selectedTag
      ? orderedProjects.filter((project) => projectHasTag(project, selectedTag))
      : orderedProjects;
  }, [orderedProjects, selectedTag]);

  const selectedProject = orderedProjects.find((project) => project.id === selectedProjectId) ?? null;

  const navigateToProject = (project: PerspectiveProject) => {
    const url = new URL(window.location.href);
    url.searchParams.set("case", project.id);
    window.history.pushState({}, "", url);
    setSelectedProjectId(project.id);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const closeProject = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("case");
    window.history.pushState({}, "", url);
    setSelectedProjectId(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (selectedProject) {
    return (
      <div className="cases-shell cases-shell--detail">
        <Header />
        <CaseDetailView
          project={selectedProject}
          projects={orderedProjects}
          onClose={closeProject}
          onSelect={navigateToProject}
        />
      </div>
    );
  }

  return (
    <div className="cases-shell">
      <Header />
      <main className="cases-flow">
        <section className="cases-filter" aria-labelledby="cases-filter-heading">
          <h1 id="cases-filter-heading">Filter by tag:</h1>
          <div className="cases-filter-list" aria-label="Case tags">
            {tags.map((tag) => {
              const active = selectedTag === tag;
              const count = projects.filter((project) => projectHasTag(project, tag)).length;
              return (
                <button
                  key={tag}
                  type="button"
                  className={active ? "is-active" : ""}
                  aria-pressed={active}
                  aria-label={`${tag}: ${count} ${count === 1 ? "case" : "cases"}`}
                  onClick={() => setSelectedTag(active ? null : tag)}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </section>

        <section className="cases-grid" aria-live="polite" aria-label="Portfolio cases">
          {visibleProjects.map((project) => (
            <button
              key={project.id}
              type="button"
              className="cases-card"
              onClick={() => navigateToProject(project)}
              aria-label={`Open ${project.title}`}
            >
              <img src={project.coverImage} alt={project.title} />
            </button>
          ))}
          {visibleProjects.length === 0 ? (
            <div className="cases-empty">
              <p>No cases yet for “{selectedTag}”.</p>
              <button type="button" onClick={() => setSelectedTag(null)}>Show all cases</button>
            </div>
          ) : null}
        </section>

        <section className="cases-actions" aria-label="Next steps">
          <a className="page-pill page-pill--yellow" href="./contacts.html">
            Let’s create<br />something
          </a>
          <a className="page-pill page-pill--dark" href="./index.html">
            Go to<br />Main Page
          </a>
        </section>

        <footer className="cases-footer">
          <span>Send me a cat sticker, and I’ll know we have something to talk about)</span>
          <a href="https://t.me/wilyam_the_originator" target="_blank" rel="noreferrer">
            tg: @wilyam_the_originator
          </a>
        </footer>
      </main>
    </div>
  );
}
