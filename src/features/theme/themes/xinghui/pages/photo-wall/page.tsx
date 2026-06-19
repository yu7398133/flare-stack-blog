import { useState } from "react";
import { Camera, X } from "lucide-react";
import type { PhotoWallPageProps } from "@/features/theme/contract/pages";

export function PhotoWallPage({ photos, albums, selectedAlbum, onAlbumChange }: PhotoWallPageProps) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          📸 照片墙
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          记录生活中的美好瞬间
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

      {/* Photo grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
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
              <div className="p-3">
                <h3 className="text-sm font-medium text-slate-800 dark:text-white truncate">
                  {photo.title}
                </h3>
                {photo.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    {photo.description}
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
