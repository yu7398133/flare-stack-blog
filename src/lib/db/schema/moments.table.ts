import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./helper";

/**
 * 说说/杂谈 - Moments/Chatter table
 * 轻量级内容，类似朋友圈/微博
 */
export const MomentsTable = sqliteTable(
  "moments",
  {
    id,
    content: text().notNull(),
    images: text(), // JSON array of image URLs
    mood: text(), // 心情标签
    location: text(), // 位置信息
    visibility: text("visibility", { enum: ["public", "private"] })
      .default("public")
      .notNull(),
    likes: integer().default(0).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("moments_created_at_idx").on(table.createdAt),
    index("moments_visibility_idx").on(table.visibility),
  ],
);

export type Moment = typeof MomentsTable.$inferSelect;
export type MomentInsert = typeof MomentsTable.$inferInsert;
