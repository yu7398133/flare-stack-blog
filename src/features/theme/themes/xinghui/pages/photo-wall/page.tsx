import { useState, useMemo, useEffect } from "react";
import { Search, X, ArrowLeft } from "lucide-react";
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
  initialAlbum,
}: PhotoWallPageProps) {
  const [openAlbum, setOpenAlbum] = useState<string | null>(initialAlbum || null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    caption?: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Debounce search
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setActiveQuery(searchQuery.toLowerCase());
      setIsTransitioning(false);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build album groups
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

  // Search filtering
  const { matchedAlbums, matchedPhotos } = useMemo(() => {
    if (!activeQuery)
      return { matchedAlbums: albumGroups, matchedPhotos: [] };
    const ma = albumGroups.filter((a) =>
      a.album.toLowerCase().includes(activeQuery),
    );
    const mp = photos
      .filter(
        (p) =>
          p.title.toLowerCase().includes(activeQuery) ||
          p.description?.toLowerCase().includes(activeQuery),
      )
      .map((p) => ({ ...p, albumName: p.album || "default" }));
    return { matchedAlbums: ma, matchedPhotos: mp };
  }, [activeQuery, albumGroups, photos]);

  const viewingAlbum = openAlbum
    ? albumGroups.find((g) => g.album === openAlbum)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Album list view */}
      {!viewingAlbum && (
        <div className="xh-animate-in">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-2 transition-colors duration-700">
                光影画廊
              </h1>
              <p className="text-base text-slate-600 dark:text-slate-400 font-medium tracking-wider">
                定格时间，封存泰拉与现实的每一次心跳
              </p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-500 dark:text-slate-400 group-focus-within:text-indigo-500 transition-colors"
              />
              <input
                type="text"
                placeholder="搜索相册名或照片描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full text-sm text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all duration-700"
              />
            </div>
          </div>

          <div
            className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            {/* Search results: matched photos */}
            {activeQuery && matchedPhotos.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-indigo-500 rounded-full" />
                  匹配的单张照片 ({matchedPhotos.length})
                </h3>
                <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
                  {matchedPhotos.map((photo, index) => (
                    <div
                      key={`search-${photo.id}-${index}`}
                      onClick={() =>
                        setSelectedImage({
                          url: photo.imageUrl,
                          caption: photo.title,
                        })
                      }
                      className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in shadow-lg bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/10 transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20"
                    >
                      <img
                        src={photo.thumbnailUrl || photo.imageUrl}
                        alt={photo.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                        <span className="text-indigo-300 font-black text-[10px] tracking-widest uppercase mb-1 drop-shadow-md">
                          {photo.albumName}
                        </span>
                        <p className="text-white font-medium text-sm drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {photo.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Album cards with stacked photo effect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mt-6">
              {matchedAlbums.map((group) => (
                <div
                  key={group.album}
                  onClick={() => setOpenAlbum(group.album)}
                  className="group cursor-pointer flex flex-col items-center"
                >
                  {/* Stacked photos effect */}
                  <div className="relative w-[85%] aspect-[4/3] mb-6">
                    {/* Back photo (rotated right) */}
                    <div className="absolute inset-0 bg-slate-300 dark:bg-slate-700 rounded-[4px] shadow-md transform rotate-6 translate-x-4 translate-y-2 group-hover:rotate-12 group-hover:translate-x-8 transition-all duration-500 border-[6px] border-white dark:border-slate-200 overflow-hidden opacity-60">
                      {group.photos[2] ? (
                        <img
                          src={
                            group.photos[2].thumbnailUrl ||
                            group.photos[2].imageUrl
                          }
                          className="w-full h-full object-cover grayscale blur-[2px]"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-slate-600" />
                      )}
                    </div>
                    {/* Middle photo (rotated left) */}
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-600 rounded-[4px] shadow-lg transform -rotate-3 -translate-x-2 -translate-y-1 group-hover:-rotate-6 group-hover:-translate-x-6 transition-all duration-500 border-[6px] border-white dark:border-slate-200 overflow-hidden opacity-80 z-10">
                      {group.photos[1] ? (
                        <img
                          src={
                            group.photos[1].thumbnailUrl ||
                            group.photos[1].imageUrl
                          }
                          className="w-full h-full object-cover grayscale-[50%]"
                          alt=""
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-slate-500" />
                      )}
                    </div>
                    {/* Front photo (cover) */}
                    <div className="absolute inset-0 bg-white dark:bg-slate-200 rounded-[4px] shadow-2xl border-[6px] border-white dark:border-slate-200 overflow-hidden z-20 transform group-hover:-translate-y-2 group-hover:scale-105 transition-all duration-500 relative">
                      <img
                        src={
                          group.photos[0]?.thumbnailUrl ||
                          group.photos[0]?.imageUrl
                        }
                        alt={group.album}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                        <p className="text-white font-black text-lg drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          {group.photos[0]?.description || group.album}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Album info */}
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
                    {group.album}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {group.photos.length} 张照片
                  </p>
                </div>
              ))}
            </div>

            {activeQuery &&
              matchedAlbums.length === 0 &&
              matchedPhotos.length === 0 && (
                <div className="text-center py-20 text-slate-500 font-medium">
                  没有找到相关的记忆...
                </div>
              )}
          </div>
        </div>
      )}

      {/* Album detail view */}
      {viewingAlbum && (
        <div className="xh-animate-in">
          {/* Header with back button */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => setOpenAlbum(null)}
                  className="group flex items-center gap-1.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <span className="bg-white/40 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-lg border border-white/50 dark:border-white/10 shadow-sm group-hover:shadow-md transition-all">
                    <ArrowLeft size={14} />
                  </span>
                  返回画廊
                </button>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-wider mb-2">
                {viewingAlbum.album}
              </h1>
              {viewingAlbum.photos[0]?.description && (
                <p className="text-base text-slate-600 dark:text-slate-400 font-medium">
                  {viewingAlbum.photos[0].description}
                </p>
              )}
            </div>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/50 dark:border-white/10 shadow-sm">
              共{" "}
              <span className="text-indigo-500 dark:text-indigo-400 text-lg">
                {viewingAlbum.photos.length}
              </span>{" "}
              张
            </div>
          </div>

          {/* Masonry photo grid */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            {viewingAlbum.photos.map((photo, index) => (
              <div
                key={`${photo.id}-${index}`}
                onClick={() =>
                  setSelectedImage({
                    url: photo.imageUrl,
                    caption: photo.title,
                  })
                }
                className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-zoom-in shadow-lg bg-white/20 dark:bg-slate-800/20 border border-white/30 dark:border-white/10 transition-transform duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20 xh-animate-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <img
                  src={photo.thumbnailUrl || photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5">
                  {photo.title && (
                    <p className="text-white font-medium text-sm drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      {photo.title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-10 cursor-zoom-out xh-animate-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2"
          >
            <X size={24} />
          </button>
          <img
            src={selectedImage.url}
            alt={selectedImage.caption || ""}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {selectedImage.caption && (
            <div className="absolute bottom-10 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white text-sm font-medium tracking-wide shadow-2xl">
              {selectedImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
