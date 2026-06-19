import { Link } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import type { TimelinePageProps } from "@/features/theme/contract/pages";

interface MonthGroup {
  month: string;
  posts: TimelinePageProps["posts"];
}

export function TimelinePageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <div className="h-6 w-32 xh-skeleton rounded mb-2" />
        <div className="h-4 w-24 xh-skeleton rounded" />
      </div>
      <div className="relative pl-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-700" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-8 ml-6">
            <div className="h-4 w-20 xh-skeleton rounded mb-3" />
            <div className="flex flex-col gap-3">
              {[1, 2].map((j) => (
                <div key={j} className="xh-glass p-4">
                  <div className="h-4 w-3/4 xh-skeleton rounded mb-2" />
                  <div className="h-3 w-1/2 xh-skeleton rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelinePage({ posts }: TimelinePageProps) {
  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
  );

  const monthGroups: MonthGroup[] = [];
  const monthMap = new Map<string, TimelinePageProps["posts"]>();

  for (const post of sortedPosts) {
    const date = new Date(post.publishedAt || 0);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(post);
  }

  for (const [month, groupPosts] of monthMap) {
    monthGroups.push({ month, posts: groupPosts });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          📅 文章归档
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          共 {posts.length} 篇文章
        </p>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent" />

        {monthGroups.map((group) => (
          <div key={group.month} className="mb-8">
            {/* Month label */}
            <div className="absolute -left-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
              <Calendar size={12} className="text-white" />
            </div>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-6">
              {group.month}
            </h2>

            {/* Posts in this month */}
            <div className="flex flex-col gap-3 ml-6">
              {group.posts.map((post) => (
                <Link
                  key={post.id}
                  to="/post/$slug"
                  params={{ slug: post.slug }}
                  className="xh-glass xh-glass-hover p-4 group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {post.title}
                      </h3>
                      {post.summary && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {post.summary}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {new Date(post.publishedAt || 0).toLocaleDateString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {monthGroups.length === 0 && (
          <div className="xh-glass p-12 text-center">
            <p className="text-sm text-slate-400 dark:text-slate-500">暂无文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
