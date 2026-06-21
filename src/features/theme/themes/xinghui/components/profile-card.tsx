import { useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe, Mail, Rss } from "lucide-react";

interface ProfileCardProps {
  postCount: number;
}

export function ProfileCard({ postCount }: ProfileCardProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  const { data: momentsData } = useQuery<{ total: number }>({
    queryKey: ["moments-count"],
    queryFn: async () => {
      const res = await fetch("/api/moments?limit=1");
      return res.json();
    },
  });

  const { data: photosData } = useQuery<Array<unknown>>({
    queryKey: ["photos-count"],
    queryFn: async () => {
      const res = await fetch("/api/photos");
      return res.json();
    },
  });

  const momentsCount = momentsData?.total ?? 0;
  const photosCount = photosData?.length ?? 0;

  return (
    <div className="xh-glass xh-glass-hover p-6 sm:p-8 flex flex-col justify-between h-full min-h-[240px] relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 blur-[50px] rounded-full transition-opacity duration-1000 group-hover:opacity-100 opacity-60" />

      <div className="flex items-start gap-5 relative z-10">
        {/* Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-lg flex-shrink-0 transition-transform duration-500 group-hover:rotate-3">
          <img
            src={siteConfig.theme.xinghui?.avatar || "/images/avatar.png"}
            alt={siteConfig.author}
            className="w-full h-full rounded-xl object-cover bg-white"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-wider truncate">
            {siteConfig.author}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
            {siteConfig.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mt-6 relative z-10">
        <div className="text-center">
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{postCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">文章</p>
        </div>
        <div className="w-px h-8 bg-slate-300/50 dark:bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{momentsCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">杂谈</p>
        </div>
        <div className="w-px h-8 bg-slate-300/50 dark:bg-slate-700" />
        <div className="text-center">
          <p className="text-2xl font-black text-pink-600 dark:text-pink-400">{photosCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">照片</p>
        </div>
      </div>

      {/* Social links */}
      <div className="flex gap-2 mt-4 relative z-10">
        {siteConfig.social?.map((link, i) => {
          const iconMap: Record<string, typeof Globe> = {
            github: Globe,
            email: Mail,
            rss: Rss,
          };
          const Icon = iconMap[link.platform] || Globe;
          return (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/50 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-white/80 dark:hover:bg-white/20 transition-all"
              title={link.platform}
            >
              <Icon size={16} />
            </a>
          );
        })}
      </div>
    </div>
  );
}
