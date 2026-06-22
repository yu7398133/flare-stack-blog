import type { Photo } from "@/lib/db/schema/photos.table";

export interface PhotoWallPageProps {
  photos: Photo[];
  albums: string[];
  selectedAlbum?: string;
  onAlbumChange: (album: string) => void;
  initialAlbum?: string;
}
