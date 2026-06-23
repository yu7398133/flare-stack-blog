import { ExternalLink, GitBranch, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { ProjectsPageProps } from "@/features/theme/contract/pages";
import type { Project } from "@/lib/db/schema/projects.table";

// Project icon map — matches reference site style
const PROJECT_ICONS: Record<string, string> = {
  react: "⚛️",
  vue: "💚",
  next: "▲",
  nuxt: "💚",
  node: "💚",
  python: "🐍",
  rust: "🦀",
  go: "🐹",
  ts: "💎",
  js: "💛",
  default: "🚀",
};

function getProjectIcon(project: Project): string {
  try {
    const stack: string[] = project.techStack ? JSON.parse(project.techStack) : [];
    for (const tech of stack) {
      const lower = tech.toLowerCase();
      for (const [key, icon] of Object.entries(PROJECT_ICONS)) {
        if (lower.includes(key)) return icon;
      }
    }
  } catch {}
  return PROJECT_ICONS.default;
}

export function ProjectsPage({ projects }: ProjectsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) => {
      const techStack = (() => {
        try { return p.techStack ? JSON.parse(p.techStack) : []; } catch { return []; }
      })();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        techStack.some((t: string) => t.toLowerCase().includes(q))
      );
    });
  }, [projects, searchQuery]);

  return (
    <div className="w-full py-10 relative z-10">
      {/* Header — matches reference site layout */}
      <div className="mb-8 flex flex-col items-center md:items-start">
        <div className="text-center md:text-left w-full">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-widest drop-shadow-sm uppercase">
            Projects Matrix
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-serif">
            开源项目、科研代码与实验室折腾记录。
          </p>
        </div>
      </div>

      {/* Search bar — rounded-full, serif font, matches reference */}
      <div className="mb-12 flex justify-center w-full">
        <div className="relative w-full max-w-lg">
          <input id="page-search" name="page-search"
            type="text"
            placeholder="搜索项目名称、描述或技术栈..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-full px-6 py-3 pl-12 text-slate-800 dark:text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500 font-serif"
          />
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
        </div>
      </div>

      {/* Projects grid — 2 columns, matches reference card style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 relative">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-500 font-serif w-full">
            云端尚未建立代号为 [{searchQuery}] 的档案...
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const techStack: string[] = (() => {
    try {
      return project.techStack ? JSON.parse(project.techStack) : [];
    } catch {
      return [];
    }
  })();

  const icon = getProjectIcon(project);

  return (
    <a
      href={project.repoUrl || project.projectUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full rounded-3xl bg-white/60 dark:bg-slate-800/50 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl overflow-hidden hover:shadow-indigo-500/20 transition-all duration-700 hover:-translate-y-1 group relative p-6 md:p-8"
    >
      {/* Decorative glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors duration-700" />

      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <span className="text-4xl">{icon}</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {project.title}
          </h2>
        </div>
        {/* GitHub icon */}
        <svg
          className="w-8 h-8 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"
          />
        </svg>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed line-clamp-3 mb-6 relative z-10 min-h-[60px]">
        {project.description || "暂无描述"}
      </p>

      <div className="flex flex-wrap gap-2 relative z-10 mt-auto">
        {techStack.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-bold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-md shadow-sm border border-indigo-500/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
