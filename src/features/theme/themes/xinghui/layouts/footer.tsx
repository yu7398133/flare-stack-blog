import { useRouteContext } from "@tanstack/react-router";

export function Footer() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 dark:bg-black text-white px-6 py-4 mt-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-1">
        <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
          <span>© {currentYear}</span>
          <span className="font-medium text-slate-300">{siteConfig.author}</span>
          <span>·</span>
          <span>🐟</span>
        </div>
        <p className="text-[10px] text-slate-500">
          Powered by Flare Stack · TanStack Start · Cloudflare Workers
        </p>
      </div>
    </footer>
  );
}
