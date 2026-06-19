import { useState } from "react";
import { Camera, X } from "lucide-react";
import type { PhotoWallPageProps } from "@/features/theme/contract/pages";

interface AlbumGroup {
  album: string;
  photos: PhotoWallPageProps["photos"];
}

export function PhotoWallPage({ photos, albums, selectedAlbum, onAlbumChange }: PhotoWallPageProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  const albumGroups: AlbumGroup[] = [];
  const albumMap = new Map<string, PhotoWallPageProps["photos"]>();
  for (const photo of photos) {
    const key = photo.album || "default";
    if (!albumMap.has(key)) albumMap.set(key, []);
    albumMap.get(key)!.push(photo);
  }
  for (const [album, groupPhotos] of albumMap) {
    albumGroups.push({ album, photos: groupPhotos });
  }

  const displayGroups = selectedAlbum
    ? albumGroups.filter((g) => g.album === selectedAlbum)
    : albumGroups;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          光影画廊
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          定格时间，封存泰拉与现实的每一次心跳
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {photos.length} 张照片
        </p>
      </div>

      {/* Album filter */}
      <div className="xh-glass p-4 flex flex-wrap gap-2">
        <button
          onClick={() => onAlbumChange("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !selectedAlbum
              ? "bg-indigo-500 text-white shadow-md"
              : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20"
          }`}
        >
          全部
        </button>
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => onAlbumChange(album)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedAlbum === album
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20"
            }`}
          >
            {album}
          </button>
        ))}
      </div>

      {/* Album cards */}
      {displayGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayGroups.map((group) => (
            <div key={group.album} className="xh-glass xh-glass-hover overflow-hidden group cursor-pointer">
              {/* Cover image */}
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={group.photos[0]?.thumbnailUrl || group.photos[0]?.imageUrl}
                  alt={group.album}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-xl">
                    Click to Open
                  </span>
                </div>
              </div>
              {/* Album info */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {group.album}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {group.photos.length} 张照片
                  </span>
                  {group.photos[0]?.createdAt && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(group.photos[0].createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                {group.photos[0]?.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {group.photos[0].description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="xh-glass p-12 text-center">
          <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">暂无照片</p>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={lightboxPhoto}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
