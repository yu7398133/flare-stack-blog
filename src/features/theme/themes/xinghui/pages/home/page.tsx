import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { ProfileCard } from "../../components/profile-card";
import { CloudPlayer } from "../../components/cloud-player";
import { LyricBar } from "../../components/lyric-bar";
import { PostCard } from "../../components/post-card";

export function HomePage({ posts, pinnedPosts, popularPosts }: HomePageProps) {
  const allPosts = useMemo(() => {
    const seen = new Set<string>();
    const result: { post: PostItem; pinned: boolean }[] = [];
    for (const post of pinnedPosts ?? []) {
      if (!seen.has(post.slug)) { seen.add(post.slug); result.push({ post, pinned: true }); }
    }
    for (const post of popularPosts ?? []) {
      if (!seen.has(post.slug)) { seen.add(post.slug); result.push({ post, pinned: false }); }
    }
    for (const post of posts) {
      if (!seen.has(post.slug)) { seen.add(post.slug); result.push({ post, pinned: false }); }
    }
    return result;
  }, [posts, pinnedPosts, popularPosts]);

  const allSlugs = useMemo(() => allPosts.map((p) => p.post.slug), [allPosts]);
  const { data: viewCounts } = useViewCounts(allSlugs);

  const { data: photos } = useQuery<Array<{ id: number; title: string; imageUrl: string; album: string }>>({
    queryKey: ["photos-preview"],
    queryFn: async () => { const r = await fetch("/api/photos?limit=1"); return r.json(); },
  });

  const { data: momentsData } = useQuery<{ items: Array<{ id: number; content: string; createdAt: string }> }>({
    queryKey: ["moments-preview"],
    queryFn: async () => { const r = await fetch("/api/moments?limit=1"); return r.json(); },
  });

  const latestPost = posts[0];
  const latestPhoto = photos?.[0];
  const latestMoment = momentsData?.items?.[0];

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

      {/* Row 2: Latest Insight + Preview cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Latest Insight */}
        <div className="lg:col-span-5 xh-animate-in xh-delay-3">
          {latestPost && (
            <Link
              to="/post/$slug"
              params={{ slug: latestPost.slug }}
              className="block xh-glass xh-glass-hover overflow-hidden group"
            >
              {latestPost.cover && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={latestPost.cover}
                    alt={latestPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-4">
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                  Latest Insight{latestPost.publishedAt ? ` ${new Date(latestPost.publishedAt).toLocaleDateString("zh-CN")} ${new Date(latestPost.publishedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                </p>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {latestPost.title}
                </h3>
                {latestPost.summary && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{latestPost.summary}</p>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Photo preview */}
        <div className="lg:col-span-3 xh-animate-in xh-delay-3">
          <Link to="/photowall" className="block xh-glass xh-glass-hover overflow-hidden group h-full">
            {latestPhoto ? (
              <div className="aspect-square overflow-hidden">
                <img src={latestPhoto.imageUrl} alt={latestPhoto.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center text-4xl">📸</div>
            )}
            <div className="p-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {latestPhoto?.title || "照片墙"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to Open</p>
            </div>
          </Link>
        </div>

        {/* Moments preview */}
        <div className="lg:col-span-4 xh-animate-in xh-delay-3">
          <Link to="/moments" className="block xh-glass xh-glass-hover p-4 h-full group">
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
              Records{latestMoment ? ` ${new Date(latestMoment.createdAt).toLocaleDateString("zh-CN")} ${new Date(latestMoment.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : ""}
            </p>
            {latestMoment ? (
              <>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {latestMoment.content.slice(0, 50)}{latestMoment.content.length > 50 ? "..." : ""}
                </h3>
              </>
            ) : (
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">说说</h3>
            )}
          </Link>
        </div>
      </div>

      {/* Row 3: Recent posts grid */}
      <div className="xh-animate-in xh-delay-4">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">
          🕐 最近更新
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allPosts.slice(0, 6).map(({ post, pinned }) => (
            <PostCard key={post.slug} post={post} pinned={pinned} views={viewCounts?.[post.slug]} />
          ))}
        </div>
      </div>

      {/* View all button */}
      <div className="xh-animate-in xh-delay-5 text-center">
        <Link to="/posts" className="inline-block px-8 py-3 rounded-xl xh-glass text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:scale-105 transition-all">
          查看全部文章 →
        </Link>
      </div>

      {/* Bottom dashboard */}
      <div className="xh-animate-in xh-delay-6">
        <div className="xh-glass p-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <span>系统已稳定运行：</span>
          <span className="font-mono">Next.js 15</span>
          <span className="font-mono">React 19</span>
          <span className="font-mono">Tailwind 4</span>
        </div>
      </div>
    </div>
  );
}
