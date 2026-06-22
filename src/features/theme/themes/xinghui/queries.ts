import { queryOptions } from "@tanstack/react-query";
import { isSSR } from "@/lib/utils";

/**
 * Get the base URL for API calls.
 * On SSR (Cloudflare Workers), we need absolute URLs.
 * On client, relative URLs work fine.
 */
function getBaseUrl(): string {
  if (!isSSR) return "";
  // During SSR on Cloudflare Workers, we can't easily get the origin.
  // Use a known fallback — the API routes are on the same worker.
  // This is a limitation; the data will be fetched client-side instead.
  return "";
}

export const XINGHUI_KEYS = {
  moments: ["xinghui", "moments"] as const,
  talk: ["xinghui", "talk"] as const,
  photos: ["xinghui", "photos"] as const,
  projects: ["xinghui", "projects"] as const,
};

export function recentMomentsQuery(limit = 5) {
  return queryOptions({
    queryKey: [...XINGHUI_KEYS.moments, limit],
    queryFn: async () => {
      if (isSSR) {
        // During SSR, return empty data — will be fetched client-side
        return { items: [], total: 0 };
      }
      const res = await fetch(`/api/moments?limit=${limit}`);
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

export function recentTalkPostsQuery(limit = 5) {
  return queryOptions({
    queryKey: [...XINGHUI_KEYS.talk, limit],
    queryFn: async () => {
      if (isSSR) return { items: [], nextCursor: null };
      const res = await fetch(
        `/api/posts?limit=${limit}&type=talk&publicOnly=true`,
      );
      if (!res.ok) return { items: [], nextCursor: null };
      return res.json() as Promise<{
        items: Array<{
          id: number;
          title: string;
          slug: string;
          summary: string | null;
          publishedAt: string | null;
          createdAt: string;
 }>;
        nextCursor: number | null;
      }>;
    },
  });
}

export const allPhotosQuery = queryOptions({
  queryKey: XINGHUI_KEYS.photos,
  queryFn: async () => {
    if (isSSR) return [];
    const res = await fetch("/api/photos");
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
    if (isSSR) return [];
    const res = await fetch("/api/projects");
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
