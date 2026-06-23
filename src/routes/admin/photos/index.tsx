import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/photos/")({
  ssr: false,
  component: PhotosAdminPage,
  loader: () => ({ title: "照片管理" }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

interface Photo {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string;
  thumbnailUrl: string | null;
  album: string | null;
  tags: string | null;
  sortOrder: number;
  createdAt: string;
}

function PhotosAdminPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Photo | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    album: "",
    sortOrder: 0,
  });

  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["admin", "photos"],
    queryFn: async () => {
      const res = await fetch("/api/admin/photos");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await fetch("/api/admin/photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("创建失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      toast.success("照片已添加");
      resetForm();
    },
    onError: () => toast.error("添加失败"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & Partial<typeof form>) => {
      const res = await fetch(`/api/admin/photos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("更新失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      toast.success("已更新");
      resetForm();
    },
    onError: () => toast.error("更新失败"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/photos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "photos"] });
      toast.success("已删除");
    },
    onError: () => toast.error("删除失败"),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", imageUrl: "", album: "", sortOrder: 0 });
    setEditItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: Photo) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      album: item.album || "",
      sortOrder: item.sortOrder,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return toast.error("标题不能为空");
    if (!form.imageUrl.trim()) return toast.error("图片URL不能为空");
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const albums = [...new Set((photos || []).map((p) => p.album).filter(Boolean))];

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">照片管理</h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Photos · 共 {photos?.length || 0} 张 · {albums.length} 个相册
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 transition-colors"
        >
          {showForm ? "取消" : "+ 添加照片"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="border border-border/30 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input id="index-form" name="index-form"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="标题"
              className="bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            />
            <input id="index-form" name="index-form"
              value={form.album}
              onChange={(e) => setForm({ ...form, album: e.target.value })}
              placeholder="相册名称 (如: 风景, 城市, 花卉)"
              className="bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            />
          </div>
          <input id="index-form" name="index-form"
            value={form.imageUrl}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="图片URL (https://...)"
            className="w-full bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
          />
          <textarea id="index-form" name="index-form"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="描述 (可选)"
            rows={2}
            className="w-full bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground resize-none"
          />
          {form.imageUrl && (
            <div className="w-32 h-32 border border-border/30 overflow-hidden">
              <img src={form.imageUrl} alt="预览" className="w-full h-full object-cover" />
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            {editItem ? "更新" : "添加"}
          </button>
        </div>
      )}

      {/* Photo Grid */}
      {isLoading ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">加载中...</div>
      ) : !photos?.length ? (
        <div className="text-center text-muted-foreground text-xs font-mono py-20">暂无照片</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="border border-border/30 group hover:border-foreground/30 transition-colors overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <h3 className="text-xs font-mono font-bold truncate">{photo.title}</h3>
                <p className="text-[10px] text-muted-foreground font-mono mt-1">
                  {photo.album || "未分类"} · {new Date(photo.createdAt).toLocaleDateString("zh-CN")}
                </p>
                <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(photo)} className="text-[10px] font-mono text-muted-foreground hover:text-foreground">编辑</button>
                  <button onClick={() => { if (confirm("确定删除?")) deleteMutation.mutate(photo.id); }} className="text-[10px] font-mono text-muted-foreground hover:text-destructive">删除</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
