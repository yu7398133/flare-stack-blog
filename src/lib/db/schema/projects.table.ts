import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createdAt, id, updatedAt } from "./helper";

/**
 * 项目展示 - Projects table
 */
export const ProjectsTable = sqliteTable(
  "projects",
  {
    id,
    title: text().notNull(),
    description: text(),
    content: text(), // 详细说明 (markdown)
    imageUrl: text("image_url"),
    projectUrl: text("project_url"), // 项目链接
    repoUrl: text("repo_url"), // 仓库链接
    techStack: text("tech_stack"), // JSON array of tech tags
    status: text("status", { enum: ["active", "archived", "planned"] })
      .default("active")
      .notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    featured: integer("featured", { mode: "boolean" }).default(false).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("projects_status_idx").on(table.status),
    index("projects_featured_idx").on(table.featured),
  ],
);

export type Project = typeof ProjectsTable.$inferSelect;
export type ProjectInsert = typeof ProjectsTable.$inferInsert;
