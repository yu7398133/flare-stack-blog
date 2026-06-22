import type { PostItem } from "@/features/posts/schema/posts.schema";

export interface MomentItem {
  id: number;
  content: string;
  createdAt: string;
  mood: string | null;
  location: string | null;
}

export interface PhotoItem {
  id: number;
  title: string;
  imageUrl: string;
  album: string;
  description: string | null;
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  projectUrl: string | null;
  repoUrl: string | null;
  techStack: string | null;
}

export interface HomePageProps {
  posts: Array<PostItem>;
  pinnedPosts?: Array<PostItem>;
  popularPosts?: Array<PostItem>;
  moments?: { items: Array<MomentItem>; total: number };
  talkPosts?: Array<PostItem>;
  photos?: Array<PhotoItem>;
  projects?: Array<ProjectItem>;
}
