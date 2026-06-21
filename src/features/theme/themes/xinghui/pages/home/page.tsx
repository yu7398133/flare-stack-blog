import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { ProfileCard } from "../../components/profile-card";
import { CloudPlayer } from "../../components/cloud-player";
import { LyricBar } from "../../components/lyric-bar";
import { LatestPostsCarousel } from "../../components/latest-posts-carousel";
import { SiteDashboard } from "../../components/site-dashboard";
import { DanmakuBackground } from "../../components/danmaku-background";

export function HomePage({
  posts,
  pinnedPosts,
  popularPosts,
  moments,
  photos,
  projects,
}: HomePageProps) {
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

  return (
    <div className="flex flex-col gap-6 relative">
      <DanmakuBackground />

      {/* Row 1: Profile Card (7 cols) + Cloud Player (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xh-animate-in xh-delay-1">
          <ProfileCard
            postCount={posts.length}
            momentsCount={momentsTotal}
            photosCount={photosList.length}
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
          <LatestPostsCarousel posts={topPosts} />
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Photo wall banner */}
          <Link
            to="/photowall"
            className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-all duration-700 hover:scale-[1.02] relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0"
          >
            {latestPhoto ? (
              <>
                <img
                  src={latestPhoto.imageUrl}
                  alt={latestPhoto.title}
                  className="w-full h-full absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-6">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 underline decoration-pink-400">
                    {latestPhoto.title}
                  </h3>
                  <p className="text-white/90 text-sm sm:text-lg line-clamp-1">
                    {latestPhoto.description || "点击查看照片墙"}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full h-full min-h-[200px] flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>
            )}
          </Link>

          {/* Moments preview */}
          <Link
            to="/moments"
            className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] group"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono text-pink-500 dark:text-pink-400 uppercase tracking-widest">
                💬 说说
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-pink-500/30 to-transparent" />
            </div>
            {moments && moments.items.length > 0 ? (
              <>
                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {moments.items[0].content}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {moments.items[0].mood && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400">
                      {moments.items[0].mood}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {new Date(moments.items[0].createdAt).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-auto">
                    共 {moments.total} 条 →
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 dark:text-slate-500">暂无说说，去写一条吧 →</p>
            )}
          </Link>
        </div>
      </div>

      {/* Bottom: Site Dashboard */}
      <div className="xh-animate-in xh-delay-5">
        <SiteDashboard
          momentsCount={momentsTotal}
          photosCount={photosList.length}
          projectsCount={projectsList.length}
        />
      </div>
    </div>
  );
}
