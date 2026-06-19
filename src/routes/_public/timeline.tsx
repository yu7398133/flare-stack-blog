import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";
import type { PostItem } from "@/features/posts/schema/posts.schema";

export const Route = createFileRoute("/_public/timeline")({
  component: TimelineRoute,
});

function TimelineRoute() {
  const { data, isLoading } = useQuery<{ items: PostItem[] }>({
    queryKey: ["posts", "all"],
    queryFn: async () => {
      const res = await fetch("/api/posts?limit=100");
      return res.json();
    },
  });

  if (isLoading) return <theme.TimelinePageSkeleton />;

  return <theme.TimelinePage posts={data?.items || []} />;
}
