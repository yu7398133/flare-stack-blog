import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import theme from "@theme";

const photowallSearchSchema = {
  album: undefined as string | undefined,
};

export const Route = createFileRoute("/_public/photowall")({
  validateSearch: (search: Record<string, unknown>) => ({
    album: typeof search.album === "string" ? search.album : undefined,
  }),
  component: PhotoWallRoute,
  loader: async () => {
    const [photosRes, albumsRes] = await Promise.all([
      fetch("https://blog.chenyusc.eu.org/api/photos"),
      fetch("https://blog.chenyusc.eu.org/api/photos/albums"),
    ]);
    const photos = await photosRes.json();
    const albums = await albumsRes.json();
    return { photos, albums };
  },
});

function PhotoWallRoute() {
  const { photos: initialPhotos, albums: initialAlbums } = Route.useLoaderData();
  const { album: albumParam } = Route.useSearch();
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [photos, setPhotos] = useState(initialPhotos);
  const [albums, setAlbums] = useState(initialAlbums);

  useEffect(() => {
    if (!selectedAlbum) {
      setPhotos(initialPhotos);
      setAlbums(initialAlbums);
      return;
    }
    const fetchData = async () => {
      try {
        const [photosRes, albumsRes] = await Promise.all([
          fetch(`/api/photos?album=${selectedAlbum}`),
          fetch("/api/photos/albums"),
        ]);
        const photosData = await photosRes.json();
        const albumsData = await albumsRes.json();
        setPhotos(photosData);
        setAlbums(albumsData);
      } catch (e) {
        console.error("Failed to load photos:", e);
      }
    };
    fetchData();
  }, [selectedAlbum, initialPhotos, initialAlbums]);

  return (
    <theme.PhotoWallPage
      photos={photos}
      albums={albums}
      selectedAlbum={selectedAlbum}
      onAlbumChange={setSelectedAlbum}
      initialAlbum={albumParam}
    />
  );
}
