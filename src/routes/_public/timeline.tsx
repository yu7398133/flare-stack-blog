import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
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

  // Filter out talk posts — timeline only shows regular articles
  const posts = useMemo(() => {
    return (data?.items || []).filter((post) => post.type !== "talk");
  }, [data?.items]);

  if (isLoading) return <theme.TimelinePageSkeleton />;

  return <theme.TimelinePage posts={posts} />;
}
