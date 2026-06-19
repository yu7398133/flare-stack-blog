import { useState } from "react";
import { X } from "lucide-react";

interface ImageDisplayProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export function ImageDisplay({ src, alt, width, height }: ImageDisplayProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <figure className="my-4">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          onClick={() => setIsZoomed(true)}
          className="rounded-xl max-w-full h-auto cursor-zoom-in hover:shadow-lg transition-shadow duration-300 border border-white/20 dark:border-white/10"
        />
        {alt && alt !== "blog image" && (
          <figcaption className="text-center text-xs text-slate-400 dark:text-slate-500 mt-2">
            {alt}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </>
  );
}
