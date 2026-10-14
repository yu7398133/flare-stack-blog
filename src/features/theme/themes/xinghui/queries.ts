import { queryOptions } from "@tanstack/react-query";
import { getRecentMomentsFn } from "@/features/moments/api/moments.api";
import { getAllPhotosFn } from "@/features/photos/api/photos.api";
import { getPostsCursorFn } from "@/features/posts/api/posts.public.api";
import { getAllProjectsFn } from "@/features/projects/api/projects.api";
import { isSSR } from "@/lib/utils";

/**
 * 客户端分支的返回类型必须与 SSR 分支（server fn）一致。
 *
 * 此前每个 query 的客户端分支都写 `res.json() as Promise<手写精简类型>`，
 * 而 SSR 分支返回 server fn 的完整类型，两条路径产生不同的名义类型，
 * 于是 useSuspenseQuery 的结果无法赋给主题契约的 props（TS2322）。
 * 这里统一以 server fn 的返回类型为唯一来源。
 */
type ServerFnResult<T extends (...args: never) => Promise<unknown>> = Awaited<
  ReturnType<T>
>;

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
    queryFn: async (): Promise<ServerFnResult<typeof getRecentMomentsFn>> => {
      if (isSSR) {
        return await getRecentMomentsFn({ data: { limit } });
      }
      const res = await fetch(`/api/moments?limit=${limit}`);
      if (!res.ok) return { items: [], total: 0 };
      return res.json();
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
      return (await res.json()) as {
        items: ServerFnResult<typeof getPostsCursorFn>["items"];
        nextCursor: number | null;
      };
    },
  });
}

export const allPhotosQuery = queryOptions({
  queryKey: XINGHUI_KEYS.photos,
  staleTime: 0,
  queryFn: async (): Promise<ServerFnResult<typeof getAllPhotosFn>> => {
    if (isSSR) {
      return await getAllPhotosFn();
    }
    const res = await fetch("/api/photos");
    if (!res.ok) return [];
    return res.json();
  },
});

export const allProjectsQuery = queryOptions({
  queryKey: XINGHUI_KEYS.projects,
  staleTime: 0,
  queryFn: async (): Promise<ServerFnResult<typeof getAllProjectsFn>> => {
    if (isSSR) {
      return await getAllProjectsFn();
    }
    const res = await fetch("/api/projects");
    if (!res.ok) return [];
    return res.json();
  },
});
