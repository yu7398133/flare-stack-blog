import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";
import { useEffect, useState } from "react";
import type { Photo } from "@/lib/db/schema/photos.table";

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
    // 标注类型：res.json() 返回 any，若不标注，Promise.all 会让下游
    // useState 推断出 unknown，赋给主题 props 时报 TS2322。
    const photos = (await photosRes.json()) as Photo[];
    const albums = (await albumsRes.json()) as string[];
    return { photos, albums };
  },
});

function PhotoWallRoute() {
  const { photos: initialPhotos, albums: initialAlbums } =
    Route.useLoaderData();
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
        const photosData = (await photosRes.json()) as Photo[];
        const albumsData = (await albumsRes.json()) as string[];
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
