import type { PostItem } from "@/features/posts/schema/posts.schema";
import type { Moment } from "@/lib/db/schema/moments.table";
import type { Photo } from "@/lib/db/schema/photos.table";
import type { Project } from "@/lib/db/schema/projects.table";

/**
 * 首页数据契约直接复用数据库行类型（Drizzle 推断）。
 *
 * 这里曾手写精简接口（id/content/mood/location...），但路由传入的是完整
 * 数据行，字段更多（updatedAt、visibility、tags...），导致契约与实际不符、
 * 主题组件拿不到真实字段。手写副本只会随 schema 演进而再次漂移。
 */
export type MomentItem = Moment;
export type PhotoItem = Photo;
export type ProjectItem = Project;

export interface HomePageProps {
  posts: Array<PostItem>;
  pinnedPosts?: Array<PostItem>;
  popularPosts?: Array<PostItem>;
  moments?: { items: Array<MomentItem>; total: number };
  talkPosts?: Array<PostItem>;
  photos?: Array<PhotoItem>;
  projects?: Array<ProjectItem>;
}
