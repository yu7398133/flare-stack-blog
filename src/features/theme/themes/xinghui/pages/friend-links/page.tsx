import { Globe, ExternalLink } from "lucide-react";
import type { FriendLinksPageProps } from "@/features/theme/contract/pages";
import { useRouteContext } from "@tanstack/react-router";

export function FriendLinksPage({ links }: FriendLinksPageProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <div className="flex flex-col gap-8 xh-animate-in">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-3 uppercase">
          云端引力
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 font-serif">
          那些散落在赛博宇宙各处的有趣灵魂与神经节点。
        </p>
      </div>

      {/* Friend cards grid */}
      {links.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-full rounded-2xl md:rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-lg md:shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-[1.02] group relative p-3 md:p-6"
            >
              {/* Hover glow */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-indigo-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-5 relative z-10 mb-2 md:mb-4">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full p-[2px] md:p-1 bg-gradient-to-tr from-indigo-500/50 to-purple-500/50 shadow-sm md:shadow-md group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out flex-shrink-0">
                  {link.logoUrl ? (
                    <img
                      src={link.logoUrl}
                      alt={link.siteName}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
                      <Globe size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden w-full">
                  <h2 className="text-sm md:text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {link.siteName}
                  </h2>
                  <div className="text-[9px] md:text-xs font-bold text-indigo-500/70 dark:text-indigo-400/70 tracking-widest uppercase mt-0.5 md:mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-indigo-500 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>

              <p className="text-[10px] md:text-sm text-slate-700 dark:text-slate-300 font-serif leading-snug md:leading-relaxed line-clamp-2 md:line-clamp-3 relative z-10">
                {link.description || "欢迎访问~"}
              </p>
            </a>
          ))}
        </div>
      ) : (
        <div className="xh-glass p-12 text-center text-sm text-slate-400 dark:text-slate-500 font-serif">
          暂无友情链接，欢迎申请交换~
        </div>
      )}

      {/* Apply for friend link */}
      <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-2xl md:rounded-3xl p-5 md:p-8 max-w-3xl mx-auto text-center shadow-lg md:shadow-xl">
        <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white mb-2 md:mb-4 tracking-wider">
          ✨ 建立神经连接
        </h2>
        <p className="text-xs md:text-base text-slate-600 dark:text-slate-400 font-serif mb-4 md:mb-6">
          欢迎各位大佬交换友链！请点击下方按钮提交申请。
        </p>
        <a
          href="/submit-friend-link"
          className="inline-block px-8 py-3 bg-indigo-500 text-white rounded-full text-sm font-bold hover:bg-indigo-600 hover:scale-105 transition-all shadow-lg shadow-indigo-500/30"
        >
          申请友链
        </a>
      </div>
    </div>
  );
}

export function FriendLinksPageSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="h-10 w-48 xh-skeleton rounded mb-3" />
        <div className="h-4 w-64 xh-skeleton rounded" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="xh-glass h-32 xh-skeleton" />
        ))}
      </div>
    </div>
  );
}
