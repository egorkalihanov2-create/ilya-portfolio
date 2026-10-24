import { useCallback, useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";
import { MobileStackedCarouselBlock } from "./MobileStackedCarouselBlock";
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
  const isMobile = useMediaQuery("(max-width: 720px)");
  const closeProject = useCallback(() => setSelectedProject(null), []);

  return (
    <>
      {isMobile ? (
        <MobileStackedCarouselBlock
          projects={projects}
          onOpen={setSelectedProject}
        />
      ) : (
        <PerspectiveCarouselBlock
          projects={projects}
          onOpen={setSelectedProject}
        />
      )}
      <ProjectModal project={selectedProject} onClose={closeProject} />
    </>
  );
}
