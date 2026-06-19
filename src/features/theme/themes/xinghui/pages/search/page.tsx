import { ArrowLeft, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import type { SearchPageProps } from "@/features/theme/contract/pages";

export function SearchPage({
  query,
  results,
  isSearching,
  onQueryChange,
  onSelectPost,
  onBack,
}: SearchPageProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div className="xh-glass p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-white/10 transition-all"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-white/50 dark:bg-white/10 rounded-xl px-4 py-2">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="搜索文章..."
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-white placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Results */}
      {isSearching ? (
        <div className="xh-glass p-8 text-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-sm text-slate-400">搜索中...</span>
        </div>
      ) : results.length > 0 ? (
        <div className="flex flex-col gap-3">
          {results.map((result) => (
            <button
              key={result.post.slug}
              onClick={() => onSelectPost(result.post.slug)}
              className="xh-glass xh-glass-hover p-5 text-left w-full"
            >
              <h3 className="font-bold text-slate-800 dark:text-white mb-1">
                {result.matches.title || result.post.title}
              </h3>
              {result.post.summary && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {result.matches.summary || result.post.summary}
                </p>
              )}
              {result.post.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {result.post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : query.length > 0 ? (
        <div className="xh-glass p-12 text-center text-sm text-slate-400 dark:text-slate-500">
          未找到相关文章
        </div>
      ) : null}
    </div>
  );
}
