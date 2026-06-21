import { Link, useRouteContext } from "@tanstack/react-router";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useEffect, useState } from "react";
import type { PostPageProps } from "@/features/theme/contract/pages";
import { authClient } from "@/lib/auth/auth.client";
import { ContentRenderer } from "../../components/content/content-renderer";
import { CommentSection } from "../../components/comment-section";

function formatDate(date: Date | string) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${min}:${s}`;
}

export function PostPage({ post }: PostPageProps) {
  const { data: session } = authClient.useSession();
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const activeId = useActiveTOC(post.toc);

  return (
    <div className="flex flex-col gap-6 xh-animate-in">
      {/* Back navigation */}
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        <span>返回上一级</span>
      </Link>

      {/* Main layout: content + TOC sidebar */}
      <div className="flex gap-6 items-start">
        {/* Article container */}
        <article className="xh-glass px-6 md:px-10 pt-8 pb-6 flex-1 min-w-0">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
            {post.publishedAt && (
              <span>写作时间：{formatDate(post.publishedAt)}</span>
            )}
            {session?.user.role === "admin" && (
              <Link
                to="/admin/posts/edit/$id"
                params={{ id: String(post.id) }}
                className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                <Edit3 size={14} />
                <span>编辑</span>
              </Link>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to="/posts"
                  search={{ tagName: tag.name }}
                  className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
                >
                  # {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="xh-prose prose prose-slate dark:prose-invert prose-base max-w-none">
            <ContentRenderer content={post.contentJson} />
          </div>
        </article>

        {/* TOC sidebar - right side, sticky */}
        {post.toc && post.toc.length > 0 && (
          <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
            <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-4 max-h-[calc(100vh-8rem)] overflow-y-auto xh-scrollbar">
              <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                目录
              </h3>
              <nav className="flex flex-col">
                {post.toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById(item.id);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block text-xs py-1 border-l-[1.5px] transition-all duration-300 leading-relaxed ${
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
          </aside>
        )}
      </div>

      {/* Author info */}
      <div
        className="xh-glass p-6 flex items-start gap-4 xh-animate-in"
        style={{ animationDelay: "100ms" }}
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {siteConfig.author?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white">
            {siteConfig.author}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {siteConfig.description}
          </p>
        </div>
      </div>

      {/* Comments */}
      <div
        className="xh-glass p-6 xh-animate-in"
        style={{ animationDelay: "200ms" }}
      >
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

/** Hook to track which TOC heading is currently in view */
function useActiveTOC(
  toc?: Array<{ id: string; level: number; text: string }>,
) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!toc || toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
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
