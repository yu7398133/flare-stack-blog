import { useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import type { PublicLayoutProps } from "@/features/theme/contract/layouts";
import { ClickEffect } from "../components/click-effect";
import { DanmakuBackground } from "../components/danmaku-background";
import { FireflyEffect } from "../components/firefly-effect";
import { FloatingPlayer } from "../components/floating-player";
import { MusicProvider } from "../components/music-provider";
import { WindyGrass } from "../components/windy-grass";
import { useHomeBg } from "../utils/home-bg";
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

  const {
    url: bgUrl,
    degraded: isBgDegraded,
    onError: handleBgError,
    onLoad: handleBgLoad,
    refresh: refreshBg,
  } = useHomeBg(homeBgBase);

  return (
    <MusicProvider
      musicIds={musicIds}
      musicPlaylistIds={musicPlaylistIds}
      audioUrlMap={audioUrlMap}
      vipMap={vipMap}
      resolverUrl={musicResolverUrl}
    >
      <div className="xh-page-bg min-h-screen relative">
        <DanmakuBackground />

        {/* 随机图源会返回 404 单图；img 抛错时换一张，取不到就退到这个渐变底色 */}
        {(bgUrl || isBgDegraded) && (
          <div className="fixed inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black">
            {bgUrl && (
              <img
                src={bgUrl}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
                onError={handleBgError}
                onLoad={handleBgLoad}
              />
            )}
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
