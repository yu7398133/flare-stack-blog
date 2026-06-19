import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import theme from "@theme";

export const Route = createFileRoute("/_public/about")({
  component: AboutRoute,
});

function AboutRoute() {
  const { siteConfig } = useRouteContext({ from: "__root__" });

  return (
    <theme.AboutPage
      author={siteConfig.author}
      description={siteConfig.description}
      social={siteConfig.social}
    />
  );
}
