import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PostManager } from "@/features/posts/components/post-manager";
import type {
  SortDirection,
  SortField,
  StatusFilter,
  TypeFilter,
} from "@/features/posts/components/post-manager/types";
import {
  SORT_DIRECTIONS,
  SORT_FIELDS,
  STATUS_FILTERS,
  TYPE_FILTERS,
} from "@/features/posts/components/post-manager/types";

const searchSchema = z.object({
  page: z.number().int().positive().optional().default(1).catch(1),
  status: z.enum(STATUS_FILTERS).optional().default("ALL").catch("ALL"),
  type: z.enum(TYPE_FILTERS).optional().default("ALL").catch("ALL"),
  sortDir: z.enum(SORT_DIRECTIONS).optional().default("DESC").catch("DESC"),
  sortBy: z
    .enum(SORT_FIELDS)
    .optional()
    .default("updatedAt")
    .catch("updatedAt"),
  search: z.string().optional().default("").catch(""),
});

export type PostsSearchParams = z.infer<typeof searchSchema>;

export const Route = createFileRoute("/admin/posts/")({
  ssr: false,
  validateSearch: searchSchema,
  component: PostManagerPage,
});

function PostManagerPage() {
  const navigate = useNavigate();
  const { page, status, type, sortDir, sortBy, search } = Route.useSearch();

  const updateSearch = (updates: Partial<PostsSearchParams>) => {
    navigate({
      to: "/admin/posts",
      search: {
        page: updates.page ?? 1,
        status: updates.status ?? status,
        type: updates.type ?? type,
        sortDir: updates.sortDir ?? sortDir,
        sortBy: updates.sortBy ?? sortBy,
        search: updates.search ?? search,
      },
    });
  };

  const handlePageChange = (newPage: number) => {
    updateSearch({ page: newPage });
  };

  const handleStatusChange = (newStatus: StatusFilter) => {
    updateSearch({ status: newStatus, page: 1 });
  };

  const handleTypeChange = (newType: TypeFilter) => {
    updateSearch({ type: newType, page: 1 });
  };

  const handleSortUpdate = (update: {
    dir?: SortDirection;
    sortBy?: SortField;
  }) => {
    updateSearch({
      sortDir: update.dir ?? sortDir,
      sortBy: update.sortBy ?? sortBy,
    });
  };

  const handleSearchChange = (newSearch: string) => {
    updateSearch({ search: newSearch });
  };

  const handleResetFilters = () => {
    navigate({
      to: "/admin/posts",
      search: {
        page: 1,
        status: "ALL",
        type: "ALL",
        sortDir: "DESC",
        sortBy: "updatedAt",
        search: "",
      },
    });
  };

  return (
    <PostManager
      page={page}
      status={status}
      type={type}
      sortDir={sortDir}
      sortBy={sortBy}
      search={search}
      onPageChange={handlePageChange}
      onStatusChange={handleStatusChange}
      onTypeChange={handleTypeChange}
      onSortUpdate={handleSortUpdate}
      onSearchChange={handleSearchChange}
      onResetFilters={handleResetFilters}
    />
  );
}
