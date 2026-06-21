import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import theme from "@theme";
import { useEffect } from "react";
import { toast } from "sonner";
import { AUTH_KEYS } from "@/features/auth/queries";
import { getThemePreloadImages } from "@/features/theme/site-config.helpers";
import { authClient } from "@/lib/auth/auth.client";
import { getLogoutAuthErrorMessage } from "@/lib/auth/auth-errors";
import { CACHE_CONTROL } from "@/lib/constants";
import { m } from "@/paraglide/messages";

export const Route = createFileRoute("/_public")({
  loader: ({ context }) => ({
    preloadImages: getThemePreloadImages(context.siteConfig),
  }),
  component: PublicLayout,
  headers: () => {
    return CACHE_CONTROL.public;
  },
  head: ({ loaderData }) => ({
    links: (loaderData?.preloadImages ?? []).map((href) => ({
      rel: "preload" as const,
      as: "image",
      href,
    })),
  }),
});

function PublicLayout() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const queryClient = useQueryClient();

  const navOptions = [
    { label: "首页", to: "/" as const, id: "home" },
    { label: "项目", to: "/projects" as const, id: "projects" },
    { label: "归档", to: "/timeline" as const, id: "timeline" },
    { label: "照片墙", to: "/photowall" as const, id: "photowall" },
    { label: "音乐", to: "/music" as const, id: "music" },
    { label: "说说", to: "/moments" as const, id: "moments" },
    { label: "友链", to: "/friend-links" as const, id: "friend-links" },
    { label: "关于", to: "/about" as const, id: "about" },
  ];

  const logout = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(m.auth_logout_failed(), {
        description:
          getLogoutAuthErrorMessage(error, m) ?? m.auth_logout_failed_desc(),
      });
      return;
    }

    queryClient.removeQueries({ queryKey: AUTH_KEYS.session });

    toast.success(m.auth_logout_success(), {
      description: m.auth_logout_success_desc(),
    });
  };

  // Global shortcut: Cmd/Ctrl + K to navigate to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault();
        navigate({ to: "/search" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <>
      <theme.PublicLayout
        navOptions={navOptions}
        user={session?.user}
        isSessionLoading={isSessionPending}
        logout={logout}
      >
        <Outlet />
      </theme.PublicLayout>
      <theme.Toaster />
    </>
  );
}
