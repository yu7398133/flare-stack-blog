import { queryOptions } from "@tanstack/react-query";
import { isSSR } from "@/lib/utils";
import { getRecentMomentsFn } from "@/features/moments/api/moments.api";
import { getAllPhotosFn } from "@/features/photos/api/photos.api";
import { getAllProjectsFn } from "@/features/projects/api/projects.api";
import { getPostsCursorFn } from "@/features/posts/api/posts.public.api";

export const XINGHUI_KEYS = {
  moments: ["xinghui", "moments"] as const,
  talk: ["xinghui", "talk"] as const,
  photos: ["xinghui", "photos"] as const,
  projects: ["xinghui", "projects"] as const,
};

export function recentMomentsQuery(limit = 5) {
  return queryOptions({
    queryKey: [...XINGHUI_KEYS.moments, limit],
    staleTime: 0,
    queryFn: async () => {
      if (isSSR) {
        return await getRecentMomentsFn({ data: { limit } });
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
    staleTime: 0,
    queryFn: async () => {
      if (isSSR) {
        const result = await getPostsCursorFn({
          data: { limit, type: "talk" },
        });
        return { items: result.items, nextCursor: result.nextCursor };
      }
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
  staleTime: 0,
  queryFn: async () => {
    if (isSSR) {
      return await getAllPhotosFn();
    }
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
  staleTime: 0,
  queryFn: async () => {
    if (isSSR) {
      return await getAllProjectsFn();
    }
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
