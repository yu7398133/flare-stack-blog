import { useRouteContext } from "@tanstack/react-router";

export function Footer() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="xh-glass px-6 py-6 mt-8">
      <div className="flex items-center justify-center gap-1 text-sm text-slate-500 dark:text-slate-400">
        <span>© {currentYear}</span>
        <span className="font-medium text-slate-700 dark:text-slate-300">{siteConfig.author}</span>
        <span>·</span>
        <span>🐟</span>
      </div>
    </footer>
  );
}
