import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { dbMiddleware } from "@/lib/middlewares";
import * as MomentsData from "@/features/moments/data/moments.data";
import * as PhotosData from "@/features/photos/data/photos.data";
import * as ProjectsData from "@/features/projects/data/projects.data";

// ── Server Functions ──────────────────────────────────────

export const getRecentMomentsFn = createServerFn()
  .middleware([dbMiddleware])
  .validator((input: { limit: number }) => input)
  .handler(async ({ data, context }) => {
    const items = await MomentsData.getAll(context.db, {
      visibility: "public",
      limit: data.limit,
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
    queryFn: () => getRecentMomentsFn({ data: { limit } }),
  });
}

export const allPhotosQuery = queryOptions({
  queryKey: XINGHUI_KEYS.photos,
  queryFn: () => getAllPhotosFn(),
});

export const allProjectsQuery = queryOptions({
  queryKey: XINGHUI_KEYS.projects,
  queryFn: () => getAllProjectsFn(),
});
