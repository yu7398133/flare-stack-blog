import { Globe, ExternalLink } from "lucide-react";
import type { FriendLinksPageProps } from "@/features/theme/contract/pages";

export function FriendLinksPage({ links }: FriendLinksPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          🔗 友情链接
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          感谢以下朋友的友情链接
        </p>
      </div>

      {links.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="xh-glass xh-glass-hover p-5 flex items-start gap-4 group"
            >
              {link.logoUrl ? (
                <img
                  src={link.logoUrl}
                  alt={link.siteName}
                  className="w-12 h-12 rounded-xl object-cover border border-white/30 dark:border-white/10 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  <Globe size={20} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {link.siteName}
                </h3>
                {link.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>
              <ExternalLink
                size={14}
                className="text-slate-400 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1"
              />
            </a>
          ))}
        </div>
      ) : (
        <div className="xh-glass p-12 text-center text-sm text-slate-400 dark:text-slate-500">
          暂无友情链接
        </div>
      )}
    </div>
  );
}
