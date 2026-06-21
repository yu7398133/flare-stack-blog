import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";
import type { Moment } from "@/lib/db/schema/moments.table";

export const Route = createFileRoute("/_public/talk")({
  component: TalkRoute,
});

function TalkRoute() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery<{ items: Moment[]; total: number }>({
    queryKey: ["talk", page],
    queryFn: async () => {
      const res = await fetch(`/api/moments?limit=${limit}&offset=${page * limit}`);
      return res.json();
    },
  });

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  if (isLoading) return <theme.TalkPageSkeleton />;

  const moments = data?.items || [];
  const total = data?.total || 0;
  const hasNextPage = moments.length < total;

  return (
    <theme.TalkPage
      moments={moments}
      total={total}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
    />
  );
}
