import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";

export const Route = createFileRoute("/_public/about")({
  component: AboutRoute,
});

function AboutRoute() {
  // 关于页从 theme 实现内部的 useRouteContext 读取 siteConfig，
  // 这里不再传 author/description/social（历史死契约，无人接收）。
  return <theme.AboutPage />;
}
