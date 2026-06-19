import { ArrowLeft } from "lucide-react";
import type { AuthLayoutProps } from "@/features/theme/contract/layouts";

export function AuthLayout({ onBack, children }: AuthLayoutProps) {
  return (
    <div className="xh-page-bg min-h-screen flex items-center justify-center p-4">
      {/* Decorative blur orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute -top-14 left-0 w-10 h-10 rounded-xl xh-glass flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Auth card */}
        <div className="xh-glass p-8 md:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}
