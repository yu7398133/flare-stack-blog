import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./helper";

/**
 * 照片墙 - Photos table
 */
export const PhotosTable = sqliteTable(
  "photos",
  {
    id,
    title: text().notNull(),
    description: text(),
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    album: text().default("default"),
    tags: text(), // JSON array of tags
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [index("photos_album_idx").on(table.album)],
);

export type Photo = typeof PhotosTable.$inferSelect;
export type PhotoInsert = typeof PhotosTable.$inferInsert;
