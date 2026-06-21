import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";
import { siteDomainQuery } from "@/features/config/queries";
import {
  pinnedPostsQuery,
  popularPostsQuery,
  recentPostsQuery,
} from "@/features/posts/queries";
import {
  recentMomentsQuery,
  allPhotosQuery,
  allProjectsQuery,
} from "@/features/theme/themes/xinghui/queries";
import { buildCanonicalUrl, canonicalLink } from "@/lib/seo";

const { recentPostsLimit, popularPostsLimit } = theme.config.home;

export const Route = createFileRoute("/_public/")({
  loader: async ({ context }) => {
    // Core queries (always required)
    const corePromises = [
      context.queryClient.ensureQueryData(recentPostsQuery(recentPostsLimit)),
      context.queryClient.ensureQueryData(siteDomainQuery),
      context.queryClient.ensureQueryData(pinnedPostsQuery),
      context.queryClient.ensureQueryData(popularPostsQuery(popularPostsLimit)),
    ];

    // Xinghui theme extra data — fail gracefully
    const xinghuiPromises = [
      context.queryClient
        .ensureQueryData(recentMomentsQuery(5))
        .catch(() => ({ items: [], total: 0 })),
      context.queryClient
        .ensureQueryData(allPhotosQuery)
        .catch(() => []),
      context.queryClient
        .ensureQueryData(allProjectsQuery)
        .catch(() => []),
    ];

    const results = await Promise.all([...corePromises, ...xinghuiPromises]);
    const domain = results[1];

    return {
      canonicalHref: buildCanonicalUrl(domain, "/"),
    };
  },
  head: ({ loaderData }) => ({
    links: [canonicalLink(loaderData?.canonicalHref ?? "/")],
  }),
  pendingComponent: HomePageSkeleton,
  component: HomeRoute,
});

function HomeRoute() {
  const { data: posts } = useSuspenseQuery(recentPostsQuery(recentPostsLimit));
  const { data: pinnedPosts } = useSuspenseQuery(pinnedPostsQuery);
  const { data: popularPosts } = useSuspenseQuery(
    popularPostsQuery(popularPostsLimit),
  );
  const { data: moments } = useSuspenseQuery(recentMomentsQuery(5));
  const { data: photos } = useSuspenseQuery(allPhotosQuery);
  const { data: projects } = useSuspenseQuery(allProjectsQuery);

  return (
    <theme.HomePage
      posts={posts}
      pinnedPosts={pinnedPosts}
      popularPosts={popularPosts}
      moments={moments}
      photos={photos}
      projects={projects}
    />
  );
}

function HomePageSkeleton() {
  return <theme.HomePageSkeleton />;
}
