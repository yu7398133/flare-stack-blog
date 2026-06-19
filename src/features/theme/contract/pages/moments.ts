import type { Moment } from "@/lib/db/schema/moments.table";

export interface MomentsPageProps {
  moments: Moment[];
  total: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
  onLike: (id: number) => void;
}
