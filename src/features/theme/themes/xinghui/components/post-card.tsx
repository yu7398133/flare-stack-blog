import { Link } from "@tanstack/react-router";
import { Calendar, Clock, Eye } from "lucide-react";
import type { PostItem } from "@/features/posts/schema/posts.schema";

interface PostCardProps {
  post: PostItem;
  pinned?: boolean;
  views?: number;
}

export function PostCard({ post, pinned, views }: PostCardProps) {
  return (
    <Link
      to="/post/$slug"
      params={{ slug: post.slug }}
      className="xh-glass xh-glass-hover p-5 sm:p-6 flex flex-col gap-3 group"
    >
      {/* Tags & Pin badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {pinned && (
          <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            📌 置顶
          </span>
        )}
        {post.tags?.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs font-medium"
          >
            {tag.name}
          </span>
        ))}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
        {post.title}
      </h3>

      {/* Summary */}
      {post.summary && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {post.summary}
        </p>
      )}

      {/* Meta */}
      <div className="flex items-center gap-4 mt-auto text-xs text-slate-400 dark:text-slate-500">
        {post.publishedAt && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>
              {new Date(post.publishedAt).toLocaleDateString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
          </div>
        )}
        {post.readTimeInMinutes > 0 && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{post.readTimeInMinutes} 分钟</span>
          </div>
        )}
        {views !== undefined && views > 0 && (
          <div className="flex items-center gap-1">
            <Eye size={12} />
            <span>{views}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
