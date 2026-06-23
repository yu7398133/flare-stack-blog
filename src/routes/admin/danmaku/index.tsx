import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";
import { Check, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/danmaku/")({
  ssr: false,
  component: DanmakuAdminPage,
  loader: () => ({ title: "弹幕管理" }),
  head: ({ loaderData }) => ({ meta: [{ title: loaderData?.title }] }),
});

function DanmakuAdminPage() {
  const { settings, isLoading: configLoading, saveSettings } = useSystemSetting();
  const [newText, setNewText] = useState("");
  const [saving, setSaving] = useState(false);

  // Local state for all editable fields
  const [localDanmakuList, setLocalDanmakuList] = useState<string[]>([]);
  const [localFontSize, setLocalFontSize] = useState(14);
  const [localOpacity, setLocalOpacity] = useState(0.2);
  const [localClickEffect, setLocalClickEffect] = useState(true);
  const [localFireflyEffect, setLocalFireflyEffect] = useState(true);
  const hasInitialized = useRef(false);

  // Sync from settings on first load
  useEffect(() => {
    if (settings && !hasInitialized.current) {
      hasInitialized.current = true;
      const xh = settings.site?.theme?.xinghui;
      setLocalDanmakuList(xh?.danmakuList ?? []);
      setLocalFontSize(xh?.danmakuFontSize ?? 14);
      setLocalOpacity(xh?.danmakuOpacity ?? 0.2);
      setLocalClickEffect(xh?.clickEffect ?? true);
      setLocalFireflyEffect(xh?.fireflyEffect ?? true);
    }
  }, [settings]);

  // Check if local state differs from saved settings
  const isDirty = (() => {
    if (!settings) return false;
    const xh = settings.site?.theme?.xinghui;
    return (
      JSON.stringify(localDanmakuList) !== JSON.stringify(xh?.danmakuList ?? []) ||
      localFontSize !== (xh?.danmakuFontSize ?? 14) ||
      localOpacity !== (xh?.danmakuOpacity ?? 0.2) ||
      localClickEffect !== (xh?.clickEffect ?? true) ||
      localFireflyEffect !== (xh?.fireflyEffect ?? true)
    );
  })();

  // Unified save
  const handleSave = useCallback(async () => {
    if (!settings || saving) return;
    setSaving(true);
    try {
      await saveSettings({
        data: {
          ...settings,
          site: {
            ...settings.site,
            theme: {
              ...settings.site?.theme,
              xinghui: {
                ...settings.site?.theme?.xinghui,
                danmakuList: localDanmakuList,
                danmakuFontSize: localFontSize,
                danmakuOpacity: localOpacity,
                clickEffect: localClickEffect,
                fireflyEffect: localFireflyEffect,
              },
            },
          },
        },
      });
      toast.success("已保存");
    } catch (err) {
      console.error("[admin/danmaku] save failed:", err);
      toast.error("保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [settings, saving, saveSettings, localDanmakuList, localFontSize, localOpacity, localClickEffect, localFireflyEffect]);

  // --- Local-only operations ---

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return toast.error("请输入弹幕文案");
    if (localDanmakuList.includes(text)) return toast.error("该文案已存在");
    setLocalDanmakuList((prev) => [...prev, text]);
    setNewText("");
  };

  const handleRemove = (idx: number) => {
    if (!confirm("确定删除这条弹幕？")) return;
    setLocalDanmakuList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEdit = (idx: number, value: string) => {
    setLocalDanmakuList((prev) => {
      const newList = [...prev];
      newList[idx] = value;
      return newList;
    });
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header with save button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            弹幕管理
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Danmaku · {localDanmakuList.length} 条弹幕
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !isDirty || configLoading}
          className="hidden sm:flex h-11 px-8 items-center gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all font-mono text-[11px] uppercase tracking-[0.2em] font-medium disabled:opacity-50 shadow-lg shadow-foreground/5"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}
          {saving ? "保存中..." : "应用修改"}
        </button>
      </div>

      {/* Appearance settings */}
      <div className="border border-border/30 p-6 space-y-6">
        <h3 className="text-sm font-mono font-bold">外观设置</h3>

        {/* Font size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">字号大小</label>
            <span className="text-xs font-mono font-bold">
              {localFontSize}px
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={localFontSize}
            onChange={(e) => setLocalFontSize(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>10px</span>
            <span>40px</span>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-muted-foreground">透明度</label>
            <span className="text-xs font-mono font-bold">
              {Math.round(localOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(localOpacity * 100)}
            onChange={(e) => setLocalOpacity(Number(e.target.value) / 100)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Effect toggles */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">特效开关</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">鼠标点击特效</p>
            <p className="text-xs text-muted-foreground">点击页面产生粒子动画</p>
          </div>
          <button
            onClick={() => setLocalClickEffect((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              localClickEffect ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                localClickEffect ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">萤火虫特效</p>
            <p className="text-xs text-muted-foreground">页面背景萤火虫浮动动画</p>
          </div>
          <button
            onClick={() => setLocalFireflyEffect((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              localFireflyEffect ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                localFireflyEffect ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Add new danmaku */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">添加弹幕</h3>
        <div className="flex gap-3">
          <input
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="输入弹幕文案..."
            className="flex-1 bg-transparent border border-border/30 p-2 text-sm font-mono focus:outline-none focus:border-foreground"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            onClick={handleAdd}
            disabled={configLoading}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* Danmaku list */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">
          弹幕列表 · {localDanmakuList.length} 条
        </h3>
        {configLoading ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            加载中...
          </div>
        ) : localDanmakuList.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            暂无弹幕，请添加
          </div>
        ) : (
          <div className="space-y-2">
            {localDanmakuList.map((text, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 border border-border/30 p-3 group hover:border-foreground/30 transition-colors"
              >
                <span className="text-xs text-muted-foreground font-mono w-6 text-right shrink-0">
                  {idx + 1}
                </span>
                <input
                  value={text}
                  onChange={(e) => handleEdit(idx, e.target.value)}
                  className="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-border/50 pb-0.5"
                />
                <button
                  onClick={() => handleRemove(idx)}
                  className="text-xs font-mono text-muted-foreground hover:text-red-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating save button for mobile */}
      {isDirty && (
        <div className="fixed bottom-8 right-6 z-50 sm:hidden animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-14 w-14 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all shadow-2xl flex items-center justify-center p-0"
          >
            {saving ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Check size={24} />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
