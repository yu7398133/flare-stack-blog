import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/moments/")({
  ssr: false,
  component: MomentsAdminPage,
  loader: () => ({ title: "说说管理" }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

interface Moment {
  id: number;
  content: string;
  images: string | null;
  mood: string | null;
  location: string | null;
  visibility: string;
  likes: number;
  createdAt: string;
}

function MomentsAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Moment | null>(null);
  const [form, setForm] = useState({
    content: "",
    mood: "",
    location: "",
    visibility: "public" as "public" | "private",
  });

  const { data, isLoading } = useQuery<{ items: Moment[]; total: number }>({
    queryKey: ["admin", "moments"],
    queryFn: async () => {
      const res = await fetch("/api/admin/moments");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await fetch("/api/admin/moments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("创建失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moments"] });
      toast.success("说说已发布");
      resetForm();
    },
    onError: () => toast.error("发布失败"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & Partial<typeof form>) => {
      const res = await fetch(`/api/admin/moments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("更新失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moments"] });
      toast.success("已更新");
      resetForm();
    },
    onError: () => toast.error("更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/moments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moments"] });
      toast.success("已删除");
    },
    onError: () => toast.error("删除失败"),
  });

  const resetForm = () => {
    setForm({ content: "", mood: "", location: "", visibility: "public" });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: Moment) => {
    setEditItem(item);
    setForm({
      content: item.content,
      mood: item.mood || "",
      location: item.location || "",
      visibility: item.visibility as "public" | "private",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.content.trim()) return toast.error("内容不能为空");
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const moments = data?.items || [];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">说说管理</h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Moments · 共 {data?.total || 0} 条
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          {showForm ? "取消" : "+ 发布说说"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-border/30 p-6 space-y-4">
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            placeholder="写点什么..."
            rows={4}
            className="w-full bg-transparent border border-border/30 p-3 text-sm font-mono focus:outline-none focus:border-foreground resize-none"
          />
          <div className="flex gap-4">
            <input
              value={form.mood}
              onChange={(e) => setForm({ ...form, mood: e.target.value })}
              placeholder="心情 (可选)"
              className="flex-1 bg-transparent border border-border/30 p-2 text-xs font-mono focus:outline-none focus:border-foreground"
            />
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="位置 (可选)"
              className="flex-1 bg-transparent border border-border/30 p-2 text-xs font-mono focus:outline-none focus:border-foreground"
            />
            <select
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value as "public" | "private" })}
              className="bg-transparent border border-border/30 p-2 text-xs font-mono focus:outline-none"
            >
              <option value="public">公开</option>
              <option value="private">私密</option>
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {editItem ? "更新" : "发布"}
          </button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">加载中...</div>
      ) : moments.length === 0 ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">暂无说说</div>
      ) : (
        <div className="space-y-3">
          {moments.map((item) => (
            <div key={item.id} className="border border-border/30 p-4 group hover:border-foreground/30 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground font-mono">
                    {item.mood && <span>心情: {item.mood}</span>}
                    {item.location && <span>位置: {item.location}</span>}
                    <span>❤️ {item.likes}</span>
                    <span>{item.visibility === "private" ? "🔒 私密" : "🌐 公开"}</span>
                    <span>{new Date(item.createdAt).toLocaleString("zh-CN")}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(item)} className="text-xs font-mono text-muted-foreground hover:text-foreground">编辑</button>
                  <button onClick={() => { if (confirm("确定删除?")) deleteMutation.mutate(item.id); }} className="text-xs font-mono text-muted-foreground hover:text-destructive">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
