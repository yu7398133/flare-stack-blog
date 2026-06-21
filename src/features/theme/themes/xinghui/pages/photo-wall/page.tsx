import { useState } from "react";
import { Camera, X, ChevronLeft } from "lucide-react";
import type { PhotoWallPageProps } from "@/features/theme/contract/pages";

interface AlbumGroup {
  album: string;
  photos: PhotoWallPageProps["photos"];
}

export function PhotoWallPage({
  photos,
  albums,
  selectedAlbum,
  onAlbumChange,
}: PhotoWallPageProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [openAlbum, setOpenAlbum] = useState<string | null>(null);

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

  // If an album is open, show its photos
  const viewingAlbum = openAlbum
    ? albumGroups.find((g) => g.album === openAlbum)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-3 tracking-wider">
          光影画廊
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 font-serif">
          定格时间，封存泰拉与现实的每一次心跳
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          {photos.length} 张照片
        </p>
      </div>

      {/* Album filter */}
      <div className="xh-glass p-4 flex flex-wrap gap-2">
        <button
          onClick={() => {
            onAlbumChange("");
            setOpenAlbum(null);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !selectedAlbum && !openAlbum
              ? "bg-indigo-500 text-white shadow-md"
              : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20"
          }`}
        >
          全部
        </button>
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => {
              onAlbumChange(album);
              setOpenAlbum(null);
            }}
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

      {/* Viewing individual album */}
      {viewingAlbum ? (
        <div className="flex flex-col gap-4">
          {/* Back button */}
          <button
            onClick={() => setOpenAlbum(null)}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition-colors self-start"
          >
            <ChevronLeft size={16} />
            返回相册列表
          </button>

          <div className="xh-glass p-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
              {viewingAlbum.album}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {viewingAlbum.photos.length} 张照片
            </p>
          </div>

          {/* Photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {viewingAlbum.photos.map((photo) => (
              <div
                key={photo.id}
                className="xh-glass xh-glass-hover overflow-hidden cursor-pointer group"
                onClick={() => setLightboxPhoto(photo.imageUrl)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.thumbnailUrl || photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-2">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                    {photo.title}
                  </p>
                  {photo.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {photo.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Album cards grid */
        displayGroups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayGroups.map((group) => (
              <div
                key={group.album}
                className="xh-glass xh-glass-hover overflow-hidden group cursor-pointer"
                onClick={() => setOpenAlbum(group.album)}
              >
                <div className="aspect-video overflow-hidden relative">
                  <img
                    src={
                      group.photos[0]?.thumbnailUrl ||
                      group.photos[0]?.imageUrl
                    }
                    alt={group.album}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1 rounded-xl">
                      点击查看
                    </span>
                  </div>
                </div>
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
                        {new Date(
                          group.photos[0].createdAt,
                        ).toLocaleDateString("zh-CN")}
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
            <p className="text-sm text-slate-400 dark:text-slate-500">
              暂无照片
            </p>
          </div>
        )
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
