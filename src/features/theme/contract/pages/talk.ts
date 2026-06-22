import type { PostListItem } from "@/features/posts/schema/posts.schema";

export interface TalkPageProps {
  posts: PostListItem[];
  hasNextPage: boolean;
  onLoadMore: () => void;
}
