import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PostPageProps } from "@/features/theme/contract/pages";
import { authClient } from "@/lib/auth/auth.client";
import { ContentRenderer } from "../../components/content/content-renderer";
import { CommentSection } from "../../components/comment-section";

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// Consistent image per post slug (same seed = same image as timeline)
function getPostCover(_slug: string) {
  return "https://www.loliapi.com/acg/pc/";
}

export function PostPage({ post }: PostPageProps) {
  const { data: session } = authClient.useSession();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const activeId = useActiveTOC(post.toc);

  // Fetch recommended posts
  const { data: recommended } = useQuery({
    queryKey: ["recommended-posts", post.slug],
    queryFn: async () => {
      const res = await fetch(`/api/post/${post.slug}/related?limit=4`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const coverSrc = post.cover || getPostCover(post.slug);

  return (
    <div className="flex flex-col gap-6 xh-animate-in">
      {/* Back navigation */}
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
      >
        <ArrowLeft size={12} />
        <span>返回上一级</span>
      </Link>

      {/* Main layout: article + sidebar */}
      <div className="flex gap-6 items-start">
        {/* Article */}
        <article className="flex-1 min-w-0 rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl overflow-hidden transition-colors duration-700">
          {/* Cover image */}
          <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700 relative group overflow-hidden">
            <img
              src={coverSrc}
              alt=""
              className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.publishedAt && (
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold bg-white/30 dark:bg-slate-900/50 px-3 py-1.5 rounded-full text-xs shadow-sm border border-white/20 dark:border-white/5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {formatDate(post.publishedAt)}
                </span>
              )}
              {post.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  to="/posts"
                  search={{ tagName: tag.name }}
                  className="flex items-center gap-1 text-pink-600 dark:text-pink-400 font-bold bg-white/30 dark:bg-slate-900/50 px-2.5 py-1.5 rounded-full text-xs shadow-sm border border-white/20 dark:border-white/5 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                >
                  <span className="opacity-70">#</span> {tag.name}
                </Link>
              ))}
              {session?.user.role === "admin" && (
                <Link
                  to="/admin/posts/edit/$id"
                  params={{ id: String(post.id) }}
                  className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors text-xs"
                >
                  <Edit3 size={12} />
                  <span>编辑</span>
                </Link>
              )}
            </div>

            {/* Content */}
            <div className="xh-prose prose prose-slate dark:prose-invert prose-base md:prose-lg max-w-none">
              <ContentRenderer content={post.contentJson} />
            </div>

            {/* End marker */}
            <div className="my-8 flex items-center justify-center">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/30 dark:via-slate-600/30 to-transparent" />
              <span className="mx-4 text-sm font-mono tracking-widest text-slate-400 dark:text-slate-500 opacity-50">
                END
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-slate-300/30 dark:from-slate-600/30 via-transparent to-transparent" />
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-5 w-64 shrink-0 sticky top-24 self-start">
          {/* Author card */}
          <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-md mb-3 transition-transform duration-500 hover:rotate-3">
              <img
                src={siteConfig.theme.xinghui?.avatar || "/images/avatar.png"}
                alt="avatar"
                className="w-full h-full rounded-full object-cover bg-white"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              {siteConfig.author}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Recommended posts */}
          {recommended && recommended.length > 0 && (
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5">
              <h3 className="font-black text-slate-900 dark:text-white mb-3 border-l-4 border-indigo-500 pl-2 text-sm uppercase tracking-widest">
                Recommended
              </h3>
              <div className="space-y-3">
                {recommended.map(
                  (r: { slug: string; title: string; publishedAt?: string }) => (
                    <Link
                      key={r.slug}
                      to="/post/$slug"
                      params={{ slug: r.slug }}
                      className="group block"
                    >
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {r.title}
                      </h4>
                      {r.publishedAt && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                          {formatDate(r.publishedAt)}
                        </p>
                      )}
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}

          {/* TOC */}
          {post.toc && post.toc.length > 0 && (
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-4 max-h-[calc(100vh-20rem)] overflow-y-auto xh-scrollbar">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                目录
              </h3>
              <nav className="flex flex-col">
                {post.toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(item.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block text-sm py-1 border-l-[1.5px] transition-all duration-300 leading-relaxed ${
                      activeId === item.id
                        ? "text-indigo-600 dark:text-indigo-400 border-indigo-500 font-medium pl-3"
                        : "text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 pl-3 hover:border-slate-300 dark:hover:border-slate-600"
                    }`}
                    style={{
                      marginLeft: `${(item.level - 2) * 0.75}rem`,
                    }}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            </div>
          )}
        </aside>
      </div>

      {/* Comments */}
      <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-6 xh-animate-in">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

function useActiveTOC(
  toc?: Array<{ id: string; level: number; text: string }>,
) {
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    if (!toc?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActiveId(e.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [toc]);
  return activeId;
}
