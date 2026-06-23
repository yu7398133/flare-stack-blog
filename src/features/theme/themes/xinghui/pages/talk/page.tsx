import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Ghost } from "lucide-react";
import type { PostListItem } from "@/features/posts/schema/posts.schema";
import { getPostCover } from "../../utils/post-cover";

interface TalkPageProps {
  posts: PostListItem[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}

export function TalkPage({ posts, hasNextPage, onLoadMore }: TalkPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState("全部");

  // Extract all tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        tags.add(tag.name);
      }
    }
    return ["全部", ...Array.from(tags)];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchSearch =
        !searchQuery.trim() ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.summary || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchTag =
        activeTag === "全部" ||
        post.tags?.some((t) => t.name === activeTag);
      return matchSearch && matchTag;
    });
  }, [posts, searchQuery, activeTag]);

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 md:mb-4">
          云端杂谈
        </h1>
        <p className="text-xs md:text-base text-slate-500 dark:text-slate-400 font-medium italic opacity-80">
          " 在代码之外记录生活的碎片 "
        </p>
      </div>

      {/* Search + Tags */}
      <div className="flex flex-col items-center gap-5 md:gap-8">
        <div className="relative w-full max-w-lg group">
          <input id="page-search" name="page-search"
            type="text"
            placeholder="搜寻被遗忘的思绪..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 pl-10 md:pl-14 text-sm md:text-base text-slate-800 dark:text-white shadow-lg md:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400 font-medium"
          />
          <Search className="w-4 h-4 md:w-5 md:h-5 absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-20 pointer-events-none" />
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 md:px-5 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all duration-500 border ${
                activeTag === tag
                  ? "bg-indigo-500 text-white border-indigo-500 shadow-md md:shadow-lg md:shadow-indigo-500/30 scale-105"
                  : "bg-white/30 dark:bg-slate-800/30 text-slate-600 dark:text-slate-400 border-white/20 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-700/60"
              }`}
            >
              {tag === "全部" ? tag : `# ${tag}`}
            </button>
          ))}
        </div>
      </div>

      {/* Waterfall layout with timeline-style cards */}
      {filteredPosts.length > 0 ? (
        <div className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
            {filteredPosts.map((post) => {
              const cover = getPostCover(post.slug, post.cover, 400, 250);
              return (
                <div key={post.id} className="break-inside-avoid">
                <Link
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform duration-300"
                >
                  <div className="relative h-28 sm:h-36 overflow-hidden">
                    <img
                      src={cover}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-white/90 text-[10px] font-mono font-bold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("zh-CN")
                        : ""}
                    </span>
                  </div>
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 line-clamp-2 group-hover:text-indigo-500 transition-colors">
                      {post.title}
                    </h3>
                    {post.summary && (
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 flex-1">
                        {post.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag.id}
                          className="text-[8px] md:text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex flex-col items-center text-center px-10 py-16 bg-white/40 dark:bg-slate-800/30 backdrop-blur-3xl rounded-[40px] border border-white/30 dark:border-white/10 shadow-xl max-w-lg">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse" />
              <Ghost
                size={40}
                className="text-indigo-500 relative z-10"
                strokeWidth={1.5}
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              {searchQuery ? "没找到相关内容" : "杂谈空空如也"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchQuery ? "尝试换个关键词搜索" : "还没有记录下任何碎片呢"}
            </p>
          </div>
        </div>
      )}

      {/* Load more */}
      {hasNextPage && !searchQuery && activeTag === "全部" && (
        <button
          onClick={onLoadMore}
          className="xh-glass p-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all flex items-center justify-center gap-2 rounded-2xl"
        >
          加载更多
        </button>
      )}
    </div>
  );
}
