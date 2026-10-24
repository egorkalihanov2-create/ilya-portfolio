import { useEffect, useMemo, useState } from "react";
import {
  loadCaseCatalog,
  perspectiveProjects,
  type PerspectiveProject,
} from "@/components/perspective-carousel";
import { CaseDetailView } from "./CaseDetailView";

const caseFilters: ReadonlyArray<{
  label: string;
  projectIds: readonly string[];
}> = [
  {
    label: "My CD Loves",
    projectIds: ["demix", "alfa-smooth-over", "beeline", "citydrive"],
  },
  { label: "Enchantix Era", projectIds: ["winx"] },
  {
    label: "My Mom Loves",
    projectIds: ["alfa-only", "winx", "alfa-smooth-over"],
  },
  { label: "Good Old-Fashioned Ads", projectIds: ["alfa-only", "beeline"] },
  {
    label: "Famous Faces",
    projectIds: ["alfa-only", "alfa-smooth-over", "demix"],
  },
  { label: "Reality Hacks", projectIds: ["citydrive"] },
];

const preferredProjectOrder = [
  "alfa-smooth-over",
  "demix",
  "winx",
  "beeline",
  "alfa-only",
  "citydrive",
];

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

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aIndex = preferredProjectOrder.indexOf(a.id);
      const bIndex = preferredProjectOrder.indexOf(b.id);
      return (aIndex < 0 ? Number.MAX_SAFE_INTEGER : aIndex)
        - (bIndex < 0 ? Number.MAX_SAFE_INTEGER : bIndex);
    });
  }, [projects]);

  const visibleProjects = useMemo(() => {
    if (!selectedTag) return orderedProjects;
    const filter = caseFilters.find(({ label }) => label === selectedTag);
    return filter
      ? orderedProjects.filter((project) => filter.projectIds.includes(project.id))
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
            {caseFilters.map(({ label, projectIds }) => {
              const active = selectedTag === label;
              const count = projects.filter((project) => projectIds.includes(project.id)).length;
              return (
                <button
                  key={label}
                  type="button"
                  className={active ? "is-active" : ""}
                  aria-pressed={active}
                  aria-label={`${label}: ${count} ${count === 1 ? "case" : "cases"}`}
                  onClick={() => setSelectedTag(active ? null : label)}
                >
                  {label}
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
