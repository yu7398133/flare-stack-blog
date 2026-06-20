import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import theme from "@theme";

export const Route = createFileRoute("/_public/photowall")({
  component: PhotoWallRoute,
});

function PhotoWallRoute() {
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [photos, setPhotos] = useState<Array<{ id: number; title: string; imageUrl: string; album: string; description: string | null; thumbnailUrl: string | null; createdAt: string }>>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = selectedAlbum ? `?album=${selectedAlbum}` : "";
        const [photosRes, albumsRes] = await Promise.all([
          fetch(`/api/photos${params}`),
          fetch("/api/photos/albums"),
        ]);
        const photosData = await photosRes.json();
        const albumsData = await albumsRes.json();
        setPhotos(photosData);
        setAlbums(albumsData);
      } catch (e) {
        console.error("Failed to load photos:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedAlbum]);

  if (loading) return <theme.PhotoWallPageSkeleton />;

  return (
    <theme.PhotoWallPage
      photos={photos}
      albums={albums}
      selectedAlbum={selectedAlbum}
      onAlbumChange={setSelectedAlbum}
    />
  );
}
