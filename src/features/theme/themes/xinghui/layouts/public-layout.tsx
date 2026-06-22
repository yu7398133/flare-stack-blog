import { useState, useCallback } from "react";
import { useRouteContext } from "@tanstack/react-router";
import type { PublicLayoutProps } from "@/features/theme/contract/layouts";
import { MusicProvider } from "../components/music-provider";
import { FloatingPlayer } from "../components/floating-player";
import { DanmakuBackground } from "../components/danmaku-background";
import { ClickEffect } from "../components/click-effect";
import { FireflyEffect } from "../components/firefly-effect";
import { WindyGrass } from "../components/windy-grass";
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

  const rawMusicIds = siteConfig.theme.xinghui?.musicIds ?? [];
  const musicPlaylistIds = siteConfig.theme.xinghui?.musicPlaylistIds ?? [];
  const musicResolverUrl = siteConfig.theme.xinghui?.musicResolverUrl || "";

  // Normalize musicIds: extract string IDs and build audioUrl/vip maps
  const musicIds = rawMusicIds.map((item) =>
    typeof item === "string" ? item : item.id,
  );
  const audioUrlMap = Object.fromEntries(
    rawMusicIds
      .filter(
        (item): item is { id: string; audioUrl?: string } =>
          typeof item !== "string" && !!item.audioUrl,
      )
      .map((item) => [item.id, item.audioUrl!]),
  );
  const vipMap = Object.fromEntries(
    rawMusicIds
      .filter(
        (item): item is { id: string; vip?: boolean } =>
          typeof item !== "string" && !!item.vip,
      )
      .map((item) => [item.id, true]),
  );
  const homeBgBase = siteConfig.theme.xinghui?.homeBg;

  const [bgUrl, setBgUrl] = useState<string | undefined>(() => {
    if (!homeBgBase) return undefined;
    const sep = homeBgBase.includes("?") ? "&" : "?";
    return `${homeBgBase}${sep}_t=${Date.now()}`;
  });

  const refreshBg = useCallback(() => {
    if (!homeBgBase) return;
    const sep = homeBgBase.includes("?") ? "&" : "?";
    setBgUrl(`${homeBgBase}${sep}_t=${Date.now()}`);
  }, [homeBgBase]);

  return (
    <MusicProvider musicIds={musicIds} musicPlaylistIds={musicPlaylistIds} audioUrlMap={audioUrlMap} vipMap={vipMap} resolverUrl={musicResolverUrl}>
      <div className="xh-page-bg min-h-screen relative">
        <DanmakuBackground />

        {bgUrl && (
          <div className="fixed inset-0 z-0">
            <img
              src={bgUrl}
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
            onRefreshBg={refreshBg}
          />

          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-8">
            {children}
          </main>
        </div>

        <FloatingPlayer />
        <ClickEffect />
        <FireflyEffect />
        <WindyGrass />
      </div>
    </MusicProvider>
  );
}
