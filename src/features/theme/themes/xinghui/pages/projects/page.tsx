import { ExternalLink, GitBranch, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ProjectsPageProps } from "@/features/theme/contract/pages";
import type { Project } from "@/lib/db/schema/projects.table";

export function ProjectsPage({ projects }: ProjectsPageProps) {
  const featured = projects.filter((p) => p.featured);
  const regular = projects.filter((p) => !p.featured);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="xh-glass p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-3">
          <ArrowLeft size={12} />
          返回上一级
        </Link>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
          Projects Matrix
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          开源项目、科研代码与实验室折腾记录。
        </p>
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

      {projects.length === 0 && (
        <div className="xh-glass p-12 text-center">
          <p className="text-sm text-slate-400 dark:text-slate-500">暂无项目</p>
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
      {/* Image */}
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="w-full h-32 object-cover rounded-xl"
          loading="lazy"
        />
      )}

      {/* Title + Status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-bold text-slate-800 dark:text-white">
          {project.title}
        </h3>
        {project.status === "archived" && (
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">
            已归档
          </span>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
          {project.description}
        </p>
      )}

      {/* Tech stack */}
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

      {/* Links */}
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
