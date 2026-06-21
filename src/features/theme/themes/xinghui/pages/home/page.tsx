import { Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useViewCounts } from "@/features/pageview/queries";
import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { HomePageProps } from "@/features/theme/contract/pages";
import { ProfileCard } from "../../components/profile-card";
import { CloudPlayer } from "../../components/cloud-player";
import { LyricBar } from "../../components/lyric-bar";
import { LatestPostsCarousel } from "../../components/latest-posts-carousel";
import { LatestChatterCarousel } from "../../components/latest-chatter-carousel";
import { SiteDashboard } from "../../components/site-dashboard";
import { DanmakuBackground } from "../../components/danmaku-background";

function formatDate(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}.${m}.${day} ${h}:${min}`;
}

export function HomePage({ posts, pinnedPosts, popularPosts }: HomePageProps) {
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

  const allSlugs = useMemo(() => allPosts.map((p) => p.slug), [allPosts]);
  const { data: viewCounts } = useViewCounts(allSlugs);

  // Fetch chatters for carousel
  const { data: chatterData } = useQuery<{
    items: Array<{
      id: number;
      content: string;
      createdAt: string;
      mood: string | null;
      location: string | null;
    }>;
  }>({
    queryKey: ["chatter-preview"],
    queryFn: async () => {
      const r = await fetch("/api/moments?limit=5");
      return r.json();
    },
  });

  // Fetch photos for photo wall banner
  const { data: photos } = useQuery<
    Array<{
      id: number;
      title: string;
      imageUrl: string;
      album: string;
      description: string | null;
    }>
  >({
    queryKey: ["photos-preview"],
    queryFn: async () => {
      const r = await fetch("/api/photos?limit=1");
      return r.json();
    },
  });

  const topPosts = allPosts.slice(0, 5);
  const chatters = chatterData?.items || [];
  const latestPhoto = photos?.[0] || {
    id: 0,
    title: "照片墙",
    imageUrl: "https://bu.dusays.com/2026/05/07/69fc46808a782.jpg",
    album: "风景",
    description: "查看摄影",
  };

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Danmaku background */}
      <DanmakuBackground />

      {/* Row 1: Profile Card (7 cols) + Cloud Player (5 cols) */}
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

      {/* Row 2: Posts Carousel (4 cols) + Right panel (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Latest Posts Carousel */}
        <div className="lg:col-span-4 xh-animate-in xh-delay-3 min-h-[280px]">
          <LatestPostsCarousel posts={topPosts} />
        </div>

        {/* Right: Photo Wall Banner + Chatter Carousel + Theme Toggle */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Photo wall big banner */}
          <Link
            to="/photowall"
            className="xh-glass xh-glass-hover overflow-hidden relative group min-h-[200px] sm:min-h-[220px] flex-shrink-0"
          >
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
          </Link>

          {/* Bottom grid: Chatter carousel + Theme toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
            <div className="sm:col-span-2 min-h-[200px]">
              <LatestChatterCarousel chatters={chatters} />
            </div>
            <div className="sm:col-span-1 min-h-[120px]">
              <div className="xh-glass p-5 h-full flex flex-col items-center justify-center gap-3">
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl hover:scale-110 transition-transform"
                >
                  {isDark ? "🌸" : "✨"}
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isDark ? "浅色模式" : "深色模式"}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {isDark ? "流萤飞舞的深空" : "星辰大海"}
                </span>
              </div>
            </div>
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
