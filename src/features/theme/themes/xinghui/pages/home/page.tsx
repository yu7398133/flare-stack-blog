import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { ProfileCard } from "../../components/profile-card";
import { CloudPlayer } from "../../components/cloud-player";
import { LyricBar } from "../../components/lyric-bar";
import { LatestPostsCarousel } from "../../components/latest-posts-carousel";
import { SiteDashboard } from "../../components/site-dashboard";
import { PostCard } from "../../components/post-card";

export function HomePage({ posts, pinnedPosts, popularPosts }: HomePageProps) {
  // Merge all posts: pinned first, then popular, then recent
  const allPosts = useMemo(() => {
    const seen = new Set<string>();
    const result: { post: PostItem; pinned: boolean }[] = [];

    for (const post of pinnedPosts ?? []) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push({ post, pinned: true });
      }
    }
    for (const post of popularPosts ?? []) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push({ post, pinned: false });
      }
    }
    for (const post of posts) {
      if (!seen.has(post.slug)) {
        seen.add(post.slug);
        result.push({ post, pinned: false });
      }
    }
    return result;
  }, [posts, pinnedPosts, popularPosts]);

  const allSlugs = useMemo(() => allPosts.map((p) => p.post.slug), [allPosts]);
  const { data: viewCounts } = useViewCounts(allSlugs);

  const latestPosts = posts.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Profile Card + Music Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 xh-animate-in xh-delay-1">
          <ProfileCard postCount={posts.length} />
        </div>
        <div className="lg:col-span-5 xh-animate-in xh-delay-2">
          <CloudPlayer />
        </div>
      </div>

      {/* Lyric bar */}
      <div className="xh-animate-in xh-delay-2">
        <LyricBar />
      </div>

      {/* Row 2: Latest Posts Carousel + Pinned */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xh-animate-in xh-delay-3">
          <LatestPostsCarousel posts={latestPosts} />
        </div>
        <div className="lg:col-span-8 xh-animate-in xh-delay-3">
          {pinnedPosts && pinnedPosts.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">
                📌 置顶文章
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pinnedPosts.map((post) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    pinned
                    views={viewCounts?.[post.slug]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Recent posts grid */}
      <div className="xh-animate-in xh-delay-4">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">
          🕐 最近更新
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPosts.slice(0, 6).map(({ post, pinned }) => (
            <PostCard
              key={post.slug}
              post={post}
              pinned={pinned}
              views={viewCounts?.[post.slug]}
            />
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="xh-animate-in xh-delay-5 text-center">
        <Link
          to="/posts"
          className="inline-block px-8 py-3 rounded-xl xh-glass text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all"
        >
          查看全部文章 →
        </Link>
      </div>

      {/* Bottom dashboard */}
      <div className="xh-animate-in xh-delay-6">
        <SiteDashboard />
      </div>
    </div>
  );
}
