import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import theme from "@theme";

export const Route = createFileRoute("/_public/moments")({
  component: MomentsRoute,
});

function MomentsRoute() {
  const [page, setPage] = useState(0);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["moments", page],
    queryFn: async () => {
      const res = await fetch(`/api/moments?limit=${limit}&offset=${page * limit}`);
      return res.json();
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/moments/${id}/like`, { method: "POST" });
    },
  });

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  const handleLike = useCallback((id: number) => {
    likeMutation.mutate(id);
  }, [likeMutation]);

  if (isLoading) return <theme.MomentsPageSkeleton />;

  const moments = data?.items || [];
  const total = data?.total || 0;
  const hasNextPage = moments.length < total;

  return (
    <theme.MomentsPage
      moments={moments}
      total={total}
      hasNextPage={hasNextPage}
      onLoadMore={handleLoadMore}
      onLike={handleLike}
    />
  );
}
