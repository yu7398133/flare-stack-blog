import { Globe, Mail, Rss } from "lucide-react";
import type { AboutPageProps } from "@/features/theme/contract/pages";

const platformIcons: Record<string, typeof Globe> = {
  github: Globe,
  email: Mail,
  rss: Rss,
};

export function AboutPage({ author, description, social }: AboutPageProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          关于 {author}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          了解站长的更多信息
        </p>
      </div>

      {/* About content */}
      <div className="xh-glass p-6 sm:p-8">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {author.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{author}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Tech stack */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            技术栈
          </h3>
          <div className="flex flex-wrap gap-2">
            {["React", "TypeScript", "TailwindCSS", "Cloudflare", "TanStack Router", "Hono", "Drizzle ORM"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        {social && social.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
              联系方式
            </h3>
            <div className="flex flex-wrap gap-3">
              {social.map((link, i) => {
                const Icon = platformIcons[link.platform] || Globe;
                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl xh-glass xh-glass-hover text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    <Icon size={16} />
                    <span>{link.platform}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
