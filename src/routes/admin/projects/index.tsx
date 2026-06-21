import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/projects/")({
  ssr: false,
  component: ProjectsAdminPage,
  loader: () => ({ title: "项目管理" }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

interface Project {
  id: number;
  title: string;
  description: string | null;
  content: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  repoUrl: string | null;
  techStack: string | null;
  status: string;
  sortOrder: number;
  featured: boolean;
  createdAt: string;
}

function ProjectsAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Project | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    projectUrl: "",
    repoUrl: "",
    techStack: "",
    status: "active" as "active" | "archived" | "planned",
    featured: false,
  });

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["admin", "projects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/projects");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("创建失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("项目已添加");
      resetForm();
    },
    onError: () => toast.error("添加失败"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & Partial<typeof form>) => {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("更新失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("已更新");
      resetForm();
    },
    onError: () => toast.error("更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      toast.success("已删除");
    },
    onError: () => toast.error("删除失败"),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", projectUrl: "", repoUrl: "", techStack: "", status: "active", featured: false });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: Project) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      projectUrl: item.projectUrl || "",
      repoUrl: item.repoUrl || "",
      techStack: item.techStack || "",
      status: item.status as "active" | "archived" | "planned",
      featured: item.featured,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("标题不能为空");
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const statusColors: Record<string, string> = {
    active: "text-green-600 dark:text-green-400",
    archived: "text-muted-foreground",
    planned: "text-blue-600 dark:text-blue-400",
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">项目管理</h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Projects · 共 {projects?.length || 0} 个
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          {showForm ? "取消" : "+ 添加项目"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-border/30 p-6 space-y-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="项目名称"
            className="w-full bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="项目描述"
            rows={2}
            className="w-full bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground resize-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.projectUrl}
              onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
              placeholder="项目链接 (可选)"
              className="bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            />
            <input
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              placeholder="仓库链接 (可选)"
              className="bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            />
          </div>
          <input
            value={form.techStack}
            onChange={(e) => setForm({ ...form, techStack: e.target.value })}
            placeholder='技术栈 (JSON数组，如 ["React","TailwindCSS"])'
            className="w-full bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
          />
          <div className="flex items-center gap-4">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
              className="bg-transparent border border-border/30 p-2 text-xs font-mono focus:outline-none"
            >
              <option value="active">进行中</option>
              <option value="planned">计划中</option>
              <option value="archived">已归档</option>
            </select>
            <label className="flex items-center gap-2 text-xs font-mono">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />
              置顶推荐
            </label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {editItem ? "更新" : "添加"}
          </button>
        </div>
      )}

      {/* Project List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">加载中...</div>
      ) : !projects?.length ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">暂无项目</div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div key={project.id} className="border border-border/30 p-4 group hover:border-foreground/30 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-mono font-bold">{project.title}</h3>
                    {project.featured && <span className="text-[10px] px-1.5 py-0.5 bg-foreground text-background font-mono">置顶</span>}
                    <span className={`text-[10px] font-mono ${statusColors[project.status] || ""}`}>
                      [{project.status}]
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1">{project.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
                    {project.techStack && <span>🛠 {project.techStack}</span>}
                    {project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noopener" className="hover:text-foreground">🔗 演示</a>}
                    {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noopener" className="hover:text-foreground">📦 仓库</a>}
                    <span>{new Date(project.createdAt).toLocaleDateString("zh-CN")}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(project)} className="text-xs font-mono text-muted-foreground hover:text-foreground">编辑</button>
                  <button onClick={() => { if (confirm("确定删除?")) deleteMutation.mutate(project.id); }} className="text-xs font-mono text-muted-foreground hover:text-destructive">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
