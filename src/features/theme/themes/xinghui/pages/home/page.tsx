import { Link, useRouteContext } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { ProfileCard } from "../../components/profile-card";
import { CloudPlayer } from "../../components/cloud-player";
import { LyricBar } from "../../components/lyric-bar";
import { LatestPostsCarousel } from "../../components/latest-posts-carousel";
import { LatestChatterCarousel } from "../../components/latest-chatter-carousel";
import { LatestPhotosCarousel } from "../../components/latest-photos-carousel";
import { SiteDashboard } from "../../components/site-dashboard";

export function HomePage({
  posts,
  pinnedPosts,
  popularPosts,
  moments,
  talkPosts,
  photos,
  projects,
}: HomePageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const allPosts = useMemo(() => {
    const seen = new Set<string>();
    const result: PostItem[] = [];
    for (const post of pinnedPosts ?? []) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push(post);
      }
    }
    for (const post of popularPosts ?? []) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push(post);
      }
    }
    for (const post of posts) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push(post);
      }
    }
    return result;
  }, [posts, pinnedPosts, popularPosts]);

  const topPosts = allPosts.slice(0, 5);
  const momentsTotal = moments?.total ?? 0;
  const photosList = photos ?? [];
  const projectsList = projects ?? [];

  const latestPhoto = photosList[0];
  const userAvatar = siteConfig.theme.xinghui?.userAvatar || "";

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allPosts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.summary || "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [searchQuery, allPosts]);

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Search bar */}
      <div className="xh-animate-in">
        <div className="relative max-w-3xl mx-auto w-full group">
          <Search
            size={22}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10"
          />
          <input
            type="text"
            placeholder="搜寻被封存的知识..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl px-8 py-5 pl-16 text-base text-slate-800 dark:text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden z-50">
              {searchResults.map((post) => (
                <Link
                  key={post.slug}
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  onClick={() => setSearchQuery("")}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors border-b border-slate-100/50 dark:border-slate-700/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {post.title}
                    </p>
                    {post.summary && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {post.summary}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
              <Link
                to="/search"
                search={{ q: searchQuery }}
                onClick={() => setSearchQuery("")}
                className="block px-5 py-2.5 text-center text-xs font-bold text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
              >
                查看全部结果 →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 1: Profile Card (7 cols) + Cloud Player (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xh-animate-in xh-delay-1">
          <ProfileCard
            postCount={posts.length}
            momentsCount={momentsTotal}
            photosCount={photosList.length}
            talkCount={talkPosts?.length ?? 0}
          />
        </div>
        <div className="lg:col-span-5 xh-animate-in xh-delay-2">
          <CloudPlayer />
        </div>
      </div>

      {/* Lyric bar */}
      <div className="xh-animate-in xh-delay-2">
        <LyricBar />
      </div>

      {/* Row 2: Posts Carousel (4 cols) + Right panel (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xh-animate-in xh-delay-3 min-h-[280px]">
          <LatestPostsCarousel posts={topPosts} interval={9000} initialDelay={3000} />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Photo wall carousel — latest 5 photos */}
          <LatestPhotosCarousel photos={photosList.slice(0, 5)} interval={9000} initialDelay={6000} />

          {/* Talk (杂谈) + Moments (说说) side by side — 2:1 ratio matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Talk (杂谈) carousel — 2 cols, cover image background */}
            <div className="sm:col-span-2 min-h-[220px]">
              <LatestChatterCarousel posts={talkPosts ?? []} interval={9000} initialDelay={9000} />
            </div>

            {/* Moments (说说) — 1 col, text format matching chatter style */}
            <Link
              to="/moments"
              className="sm:col-span-1 rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] group"
            >
              <div>
                <div className="flex items-end gap-2 mb-3">
                  <span className="text-[10px] font-black text-pink-400 uppercase tracking-widest bg-black/10 dark:bg-black/30 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 shadow-sm">
                    Moments
                  </span>
                  {moments && moments.items.length > 0 && (
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {new Date(moments.items[0].createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3 group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors line-clamp-1">
                  说说
                </h3>
                {moments && moments.items.length > 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {moments.items[0].content}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    暂无说说，去看看吧 →
                  </p>
                )}
              </div>
              {moments && moments.total > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    共 {moments.total} 条
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom: Site Dashboard */}
      <div className="xh-animate-in xh-delay-5">
        <SiteDashboard />
      </div>
    </div>
  );
}
