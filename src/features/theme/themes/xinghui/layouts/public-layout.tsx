import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import type { PublicLayoutProps } from "@/features/theme/contract/layouts";
import { MusicProvider } from "../components/music-provider";
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

  return (
    <MusicProvider musicIds={musicIds}>
      <div className="xh-page-bg min-h-screen">
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

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-8">
          {children}
        </main>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
          <Footer navOptions={navOptions} />
        </div>
      </div>
    </MusicProvider>
  );
}
