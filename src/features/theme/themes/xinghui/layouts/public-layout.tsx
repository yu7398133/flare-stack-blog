import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import type { PublicLayoutProps } from "@/features/theme/contract/layouts";
import { MusicProvider } from "../components/music-provider";
import { FloatingPlayer } from "../components/floating-player";
import { Footer } from "./footer";
import { MobileMenu } from "./mobile-menu";
import { Navbar } from "./navbar";

export function PublicLayout({
  children,
  navOptions,
  user,
  isSessionLoading,
  logout,
}: PublicLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { siteConfig } = useRouteContext({ from: "__root__" });

  const musicIds = siteConfig.theme.xinghui?.musicIds ?? [];
  const musicPlaylistIds = siteConfig.theme.xinghui?.musicPlaylistIds ?? [];
  const homeBgBase = siteConfig.theme.xinghui?.homeBg;
  // Append cache-busting param for random image APIs so each load gets a fresh image
  const homeBg = homeBgBase
    ? `${homeBgBase}${homeBgBase.includes("?") ? "&" : "?"}_t=${Date.now()}`
    : undefined;

  return (
    <MusicProvider musicIds={musicIds} musicPlaylistIds={musicPlaylistIds}>
      <div className="xh-page-bg min-h-screen relative">
        {/* Background image */}
        {homeBg && (
          <div className="fixed inset-0 z-0">
            <img
              src={homeBg}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/30 dark:bg-black/50" />
            <div className="absolute inset-0 backdrop-blur-sm" />
          </div>
        )}

        <div className="relative z-10">
          <MobileMenu
            navOptions={navOptions}
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            user={user}
            logout={logout}
          />

          <Navbar
            navOptions={navOptions}
            onMenuClick={() => setIsMenuOpen(true)}
            user={user}
            isLoading={isSessionLoading}
          />

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-20 pb-8">
            {children}
          </main>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
            <Footer navOptions={navOptions} />
          </div>
        </div>

        {/* Floating music player widget - visible on all pages except home & music */}
        <FloatingPlayer />
      </div>
    </MusicProvider>
  );
}
