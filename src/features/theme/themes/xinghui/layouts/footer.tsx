import { Link, useRouteContext } from "@tanstack/react-router";
import type { NavOption } from "@/features/theme/contract/layouts";

interface FooterProps {
  navOptions: NavOption[];
}

export function Footer({ navOptions }: FooterProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const currentYear = new Date().getFullYear();

  return (
    <footer className="xh-glass px-6 py-6 mt-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1">
          <span>© {currentYear}</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{siteConfig.author}</span>
          <span>· Powered by</span>
          <a
            href="https://github.com/du2333/flare-stack-blog"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          >
            Flare Stack Blog
          </a>
        </div>
        <div className="flex items-center gap-4">
          {navOptions.map((opt) => (
            <Link
              key={opt.id}
              to={opt.to}
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
