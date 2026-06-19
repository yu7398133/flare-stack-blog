import type { Project } from "@/lib/db/schema/projects.table";

export interface ProjectsPageProps {
  projects: Project[];
}
