import { useCallback, useState } from "react";
import { PerspectiveCarouselBlock } from "./PerspectiveCarouselBlock";
import { ProjectModal } from "./ProjectModal";
import type { PerspectiveProject } from "./types";

export function PerspectiveCarouselWithModal({
  projects,
}: {
  projects: PerspectiveProject[];
}) {
  const [selectedProject, setSelectedProject] =
    useState<PerspectiveProject | null>(null);
  const closeProject = useCallback(() => setSelectedProject(null), []);

  return (
    <>
      <PerspectiveCarouselBlock
        projects={projects}
        onOpen={setSelectedProject}
      />
      <ProjectModal project={selectedProject} onClose={closeProject} />
    </>
  );
}
