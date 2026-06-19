import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Edit3, Eye, Tag } from "lucide-react";
import { Suspense } from "react";
import type { PostPageProps } from "@/features/theme/contract/pages";
import { authClient } from "@/lib/auth/auth.client";
import { ContentRenderer } from "../../components/content/content-renderer";
import { CommentSection } from "../../components/comment-section";

export function PostPage({ post }: PostPageProps) {
  const { data: session } = authClient.useSession();
  const wordCount = post.readTimeInMinutes * 300;

  return (
    <div className="flex flex-col gap-6 xh-animate-in">
      {/* Back navigation */}
      <Link
        to="/posts"
        className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors w-fit"
      >
        <ArrowLeft size={14} />
        <span>返回文章列表</span>
      </Link>

      {/* Article container */}
      <article className="xh-glass px-6 md:px-10 pt-8 pb-6">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6">
          {post.publishedAt && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>
                {new Date(post.publishedAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{post.readTimeInMinutes} 分钟阅读</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>约 {wordCount} 字</span>
          </div>
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
                <Tag size={10} className="inline mr-1" />
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Summary */}
        {post.summary && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border-l-4 border-indigo-500 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.summary}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-slate dark:prose-invert prose-base max-w-none prose-img:rounded-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-pre:bg-transparent prose-pre:p-0">
          <ContentRenderer content={post.contentJson} />
        </div>

        {/* End marker */}
        <div className="my-8 flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300/50 dark:via-slate-600/50 to-transparent" />
          <span className="mx-4 text-xs font-mono tracking-widest text-slate-300 dark:text-slate-600">
            END
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-slate-300/50 dark:from-slate-600/50 via-transparent to-transparent" />
        </div>
      </article>

      {/* Comments */}
      <div className="xh-glass p-6 xh-animate-in" style={{ animationDelay: "150ms" }}>
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}
