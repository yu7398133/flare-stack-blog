import { useEffect, useRef } from "react";
import type { PostsPageProps } from "@/features/theme/contract/pages";
import { PostCard } from "../../components/post-card";

export function PostsPage({
  posts,
  tags,
  selectedTag,
  onTagClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: PostsPageProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col gap-6">
      {/* Tag filter bar */}
      <div className="xh-glass p-4 flex flex-wrap gap-2">
        <button
          onClick={() => onTagClick("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !selectedTag
              ? "bg-indigo-500 text-white shadow-md"
              : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20"
          }`}
        >
          全部
        </button>
        {tags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagClick(tag.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedTag === tag.name
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white/50 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/20"
            }`}
          >
            {tag.name}
            <span className="ml-1 opacity-60">({tag.postCount})</span>
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="xh-glass p-12 text-center text-sm text-slate-400 dark:text-slate-500">
          暂无文章
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>加载中...</span>
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <div className="flex items-center gap-4 text-slate-300 dark:text-slate-600">
            <span className="h-px w-12 bg-current" />
            <span className="text-xs font-bold italic">到底啦 ~</span>
            <span className="h-px w-12 bg-current" />
          </div>
        )}
      </div>
    </div>
  );
}
