import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useSystemSetting } from "@/features/config/hooks/use-system-setting";

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

  // Local state for sliders — immediate UI feedback
  const [localFontSize, setLocalFontSize] = useState(14);
  const [localOpacity, setLocalOpacity] = useState(0.2);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from settings when loaded
  useEffect(() => {
    if (settings?.site?.theme?.xinghui?.danmakuFontSize != null) {
      setLocalFontSize(settings.site.theme.xinghui.danmakuFontSize);
    }
    if (settings?.site?.theme?.xinghui?.danmakuOpacity != null) {
      setLocalOpacity(settings.site.theme.xinghui.danmakuOpacity);
    }
  }, [settings]);

  const danmakuList: string[] =
    settings?.site?.theme?.xinghui?.danmakuList ?? [];

  const saveThemeConfig = useCallback(
    async (patch: Record<string, unknown>) => {
      if (!settings) return;
      setSaving(true);
      try {
        await saveSettings({
          ...settings,
          site: {
            ...settings.site,
            theme: {
              ...settings.site?.theme,
              xinghui: {
                ...settings.site?.theme?.xinghui,
                ...patch,
              },
            },
          },
        });
      } catch (err) {
        console.error("[admin/danmaku] save failed:", err);
        toast.error("保存失败，请重试");
      } finally {
        setSaving(false);
      }
    },
    [settings, saveSettings],
  );

  // Debounced save for sliders
  const debouncedSave = useCallback(
    (patch: Record<string, unknown>) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveThemeConfig(patch);
      }, 500);
    },
    [saveThemeConfig],
  );

  const handleFontSizeChange = (value: number) => {
    setLocalFontSize(value);
    debouncedSave({ danmakuFontSize: value });
  };

  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value);
    debouncedSave({ danmakuOpacity: value });
  };

  const handleAdd = () => {
    const text = newText.trim();
    if (!text) return toast.error("请输入弹幕文案");
    if (danmakuList.includes(text)) return toast.error("该文案已存在");
    saveThemeConfig({ danmakuList: [...danmakuList, text] });
    setNewText("");
    toast.success("已添加");
  };

  const handleRemove = (idx: number) => {
    if (!confirm("确定删除这条弹幕？")) return;
    const newList = danmakuList.filter((_, i) => i !== idx);
    saveThemeConfig({ danmakuList: newList });
    toast.success("已删除");
  };

  const handleEdit = (idx: number, value: string) => {
    const newList = [...danmakuList];
    newList[idx] = value;
    saveThemeConfig({ danmakuList: newList });
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-border/30 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-medium tracking-tight">
            弹幕管理
          </h1>
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
            Danmaku · {danmakuList.length} 条弹幕
          </p>
        </div>
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
            onChange={(e) => handleFontSizeChange(Number(e.target.value))}
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
            onChange={(e) => handleOpacityChange(Number(e.target.value) / 100)}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {saving && (
          <p className="text-xs text-muted-foreground animate-pulse">
            保存中...
          </p>
        )}
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
            disabled={configLoading || saving}
            className="px-6 py-2 text-xs font-mono uppercase tracking-widest bg-foreground text-background hover:bg-foreground/80 disabled:opacity-50 transition-colors"
          >
            添加
          </button>
        </div>
      </div>

      {/* Danmaku list */}
      <div className="border border-border/30 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold">
          弹幕列表 · {danmakuList.length} 条
        </h3>
        {configLoading ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            加载中...
          </div>
        ) : danmakuList.length === 0 ? (
          <div className="text-center text-muted-foreground text-xs font-mono py-20">
            暂无弹幕，请添加
          </div>
        ) : (
          <div className="space-y-2">
            {danmakuList.map((text, idx) => (
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
                  disabled={saving}
                  className="text-xs font-mono text-muted-foreground hover:text-red-500 px-2 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
