import type { Moment } from "@/lib/db/schema/moments.table";

export interface TalkPageProps {
  moments: Moment[];
  total: number;
  hasNextPage: boolean;
  onLoadMore: () => void;
}
