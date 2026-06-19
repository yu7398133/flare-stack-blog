import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";

export const Route = createFileRoute("/_public/projects")({
  component: ProjectsRoute,
});

function ProjectsRoute() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      return res.json();
    },
  });

  if (isLoading) return <theme.ProjectsPageSkeleton />;

  return <theme.ProjectsPage projects={projects || []} />;
}
