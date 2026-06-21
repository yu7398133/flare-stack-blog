import { queryOptions } from "@tanstack/react-query";

export const XINGHUI_KEYS = {
  moments: ["xinghui", "moments"] as const,
  photos: ["xinghui", "photos"] as const,
  projects: ["xinghui", "projects"] as const,
};

function getBaseUrl() {
  if (typeof window !== "undefined") return "";
  // In SSR on Cloudflare Workers, we can use the request URL origin
  // Fall back to empty string (relative) which works in the same worker
  return "";
}

export function recentMomentsQuery(limit = 5) {
  return queryOptions({
    queryKey: [...XINGHUI_KEYS.moments, limit],
    queryFn: async () => {
      const base = getBaseUrl();
      const res = await fetch(`${base}/api/moments?limit=${limit}`);
      if (!res.ok) return { items: [], total: 0 };
      return res.json() as Promise<{
        items: Array<{
          id: number;
          content: string;
          createdAt: string;
          mood: string | null;
          location: string | null;
        }>;
        total: number;
      }>;
    },
  });
}

export const allPhotosQuery = queryOptions({
  queryKey: XINGHUI_KEYS.photos,
  queryFn: async () => {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/photos`);
    if (!res.ok) return [];
    return res.json() as Promise<
      Array<{
        id: number;
        title: string;
        imageUrl: string;
        album: string;
        description: string | null;
      }>
    >;
  },
});

export const allProjectsQuery = queryOptions({
  queryKey: XINGHUI_KEYS.projects,
  queryFn: async () => {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/projects`);
    if (!res.ok) return [];
    return res.json() as Promise<
      Array<{
        id: number;
        title: string;
        description: string;
        projectUrl: string | null;
        repoUrl: string | null;
        techStack: string | null;
      }>
    >;
  },
});
