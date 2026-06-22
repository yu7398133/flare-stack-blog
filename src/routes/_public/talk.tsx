import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";
import type { PostListItem } from "@/features/posts/schema/posts.schema";

export const Route = createFileRoute("/_public/talk")({
  component: TalkRoute,
});

function TalkRoute() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery<{
    items: PostListItem[];
    nextCursor: number | null;
  }>({
    queryKey: ["talk", page],
    queryFn: async () => {
      const offset = page * limit;
      const res = await fetch(
        `/api/posts?limit=${limit}&offset=${offset}&type=talk&publicOnly=true`,
      );
      return res.json();
    },
  });

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  if (isLoading) return <theme.TalkPageSkeleton />;

  const posts = data?.items || [];
  const hasNextPage = data?.nextCursor !== null;

  return (
    <theme.TalkPage
      posts={posts}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
    />
  );
}
