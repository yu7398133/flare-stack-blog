import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";

export const Route = createFileRoute("/_public/chatter")({
  component: ChatterRoute,
});

function ChatterRoute() {
  const { data, isLoading } = useQuery<{ items: Array<{ id: number; content: string; createdAt: string; mood: string | null; location: string | null; likes: number }> }>({
    queryKey: ["moments", "chatter"],
    queryFn: async () => {
      const res = await fetch("/api/moments?limit=50");
      return res.json();
    },
  });

  if (isLoading) return <theme.MomentsPageSkeleton />;

  return (
    <theme.MomentsPage
      moments={data?.items || []}
      total={data?.items?.length || 0}
      hasNextPage={false}
      onLoadMore={() => {}}
      onLike={() => {}}
    />
  );
}
