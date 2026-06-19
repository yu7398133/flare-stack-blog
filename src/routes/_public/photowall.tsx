import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import theme from "@theme";
import type { Photo } from "@/lib/db/schema/photos.table";

export const Route = createFileRoute("/_public/photowall")({
  component: PhotoWallRoute,
});

function PhotoWallRoute() {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");

  const { data: photos, isLoading: isLoadingPhotos } = useQuery<Photo[]>({
    queryKey: ["photos", selectedAlbum],
    queryFn: async () => {
      const params = selectedAlbum ? `?album=${selectedAlbum}` : "";
      const res = await fetch(`/api/photos${params}`);
      return res.json();
    },
  });

  const { data: albums } = useQuery<string[]>({
    queryKey: ["photo-albums"],
    queryFn: async () => {
      const res = await fetch("/api/photos/albums");
      return res.json();
    },
  });

  if (isLoadingPhotos) return <theme.PhotoWallPageSkeleton />;

  return (
    <theme.PhotoWallPage
      photos={photos || []}
      albums={albums || []}
      selectedAlbum={selectedAlbum}
      onAlbumChange={setSelectedAlbum}
    />
  );
}
