import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { dbMiddleware } from "@/lib/middlewares";
import * as MomentsData from "@/features/moments/data/moments.data";
import * as PhotosData from "@/features/photos/data/photos.data";
import * as ProjectsData from "@/features/projects/data/projects.data";

// ── Server Functions ──────────────────────────────────────

export const getRecentMomentsFn = createServerFn()
  .middleware([dbMiddleware])
  .validator((limit: number) => limit)
  .handler(async ({ data: limit, context }) => {
    const items = await MomentsData.getAll(context.db, {
      visibility: "public",
      limit,
    });
    const total = await MomentsData.count(context.db, "public");
    return { items, total };
  });

export const getAllPhotosFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return PhotosData.getAll(context.db);
  });

export const getAllProjectsFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return ProjectsData.getAll(context.db);
  });

// ── Query Options ─────────────────────────────────────────

export const XINGHUI_KEYS = {
  moments: ["xinghui", "moments"] as const,
  photos: ["xinghui", "photos"] as const,
  projects: ["xinghui", "projects"] as const,
};

export function recentMomentsQuery(limit = 5) {
  return queryOptions({
    queryKey: [...XINGHUI_KEYS.moments, limit],
    queryFn: async () => {
      if (typeof window === "undefined") {
        return getRecentMomentsFn({ data: limit });
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

export const allPhotosQuery = queryOptions({
  queryKey: XINGHUI_KEYS.photos,
  queryFn: async () => {
    if (typeof window === "undefined") {
      return getAllPhotosFn();
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
  queryFn: async () => {
    if (typeof window === "undefined") {
      return getAllProjectsFn();
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
