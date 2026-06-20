import { Link } from "@tanstack/react-router";
import { ArrowLeft, Edit3 } from "lucide-react";
import { useRouteContext } from "@tanstack/react-router";
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

      {/* Article container */}
      <article className="xh-glass px-6 md:px-10 pt-8 pb-6">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
          {post.publishedAt && (
            <span>
              写作时间：{formatDate(post.publishedAt)}
            </span>
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
        <div className="prose prose-slate dark:prose-invert prose-base max-w-none prose-img:rounded-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0">
          <ContentRenderer content={post.contentJson} />
        </div>
      </article>

      {/* Author info */}
      <div className="xh-glass p-6 flex items-start gap-4 xh-animate-in" style={{ animationDelay: "100ms" }}>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {siteConfig.author?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white">{siteConfig.author}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{siteConfig.description}</p>
        </div>
      </div>

      {/* Table of Contents */}
      {post.toc && post.toc.length > 0 && (
        <div className="xh-glass p-6 xh-animate-in" style={{ animationDelay: "150ms" }}>
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            Table of Contents
          </h3>
          <nav className="flex flex-col gap-1">
            {post.toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Comments */}
      <div className="xh-glass p-6 xh-animate-in" style={{ animationDelay: "200ms" }}>
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
