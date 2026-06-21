import { ExternalLink, GitBranch, Search } from "lucide-react";
import { useState, useMemo } from "react";
import type { ProjectsPageProps } from "@/features/theme/contract/pages";
import type { Project } from "@/lib/db/schema/projects.table";

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

  const featured = filtered.filter((p) => p.featured);
  const regular = filtered.filter((p) => !p.featured);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-widest drop-shadow-sm uppercase">
          Projects Matrix
        </h1>
        <p className="text-slate-600 dark:text-slate-400 font-serif text-base">
          开源项目、折腾记录。
        </p>
      </div>

      {/* Search bar */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-lg group">
          <Search
            size={20}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-20"
          />
          <input
            type="text"
            placeholder="搜索项目名称、描述或技术栈..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl px-6 py-4 pl-14 text-slate-800 dark:text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Featured projects */}
      {featured.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">
            ⭐ 精选项目
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((project) => (
              <ProjectCard key={project.id} project={project} featured />
            ))}
          </div>
        </div>
      )}

      {/* Regular projects */}
      {regular.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 px-1">
            📁 其他项目
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="xh-glass p-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {searchQuery ? "没有找到匹配的项目" : "暂无项目"}
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, featured }: { project: Project; featured?: boolean }) {
  const techStack: string[] = (() => {
    try {
      return project.techStack ? JSON.parse(project.techStack) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className={`xh-glass xh-glass-hover p-5 flex flex-col gap-3 ${featured ? "min-h-[200px]" : ""}`}>
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-32 object-cover rounded-xl"
          loading="lazy"
        />
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
          {project.title}
        </h3>
        {project.status === "archived" && (
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">
            已归档
          </span>
        )}
      </div>

      {project.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {project.description}
        </p>
      )}

      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {techStack.map((tech, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-auto pt-2">
        {project.projectUrl && (
          <a
            href={project.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <ExternalLink size={12} />
            <span>访问</span>
          </a>
        )}
        {project.repoUrl && (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <GitBranch size={12} />
            <span>源码</span>
          </a>
        )}
      </div>
    </div>
  );
}
