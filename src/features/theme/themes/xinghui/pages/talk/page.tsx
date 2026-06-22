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
          <input
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

      {/* Masonry waterfall layout */}
      {filteredPosts.length > 0 ? (
        <div className="columns-2 lg:columns-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
          {filteredPosts.map((post) => {
            const cover = getPostCover(post.slug, post.cover, 400, 250);
            return (
              <div key={post.id} className="break-inside-avoid">
                <Link
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  className="block rounded-2xl md:rounded-[32px] bg-white/40 dark:bg-slate-800/40 backdrop-blur-2xl border border-white/50 dark:border-white/5 shadow-md md:shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                >
                  {/* Cover image */}
                  <div className="w-full h-28 md:h-52 overflow-hidden relative">
                    <img
                      src={cover}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-7">
                    <div className="flex items-center justify-between mb-2 md:mb-4">
                      {post.publishedAt && (
                        <div className="text-[8px] md:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider md:tracking-[0.2em] bg-indigo-500/5 dark:bg-indigo-400/10 px-1.5 py-0.5 md:px-3 md:py-1 rounded-md md:rounded-lg border border-indigo-500/10">
                          {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm md:text-xl font-bold text-slate-800 dark:text-white mb-1.5 md:mb-4 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 md:line-clamp-none">
                      {post.title}
                    </h3>

                    {post.summary && (
                      <div className="text-[10px] md:text-sm text-slate-600 dark:text-slate-300 leading-snug md:leading-relaxed line-clamp-4 md:line-clamp-5 opacity-90 font-medium italic">
                        {post.summary}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 md:mt-6 flex flex-wrap gap-1 md:gap-2">
                        {post.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-[8px] md:text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-500/5 dark:bg-white/5 px-1.5 py-0.5 md:px-2.5 md:py-1 rounded-md border border-slate-500/10 dark:border-white/5 transition-all group-hover:bg-indigo-500/10 group-hover:text-indigo-500"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
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
