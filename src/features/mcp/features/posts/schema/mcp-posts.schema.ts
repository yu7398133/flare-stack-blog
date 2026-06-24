import { z } from "zod";
import { POST_STATUSES, POST_TYPES } from "@/lib/db/schema";

export const McpTagSchema = z.object({
  createdAt: z.iso.datetime().describe("Tag creation time."),
  id: z.number().describe("Numeric tag ID."),
  name: z.string().describe("Tag name."),
});

export const McpPostsListInputSchema = z.object({
  offset: z.number().optional().describe("Result offset."),
  limit: z.number().optional().describe("Maximum number of posts to return."),
  status: z.enum(POST_STATUSES).optional().describe("Filter by post status."),
  publicOnly: z
    .boolean()
    .optional()
    .describe("Only include publicly visible posts."),
  search: z.string().optional().describe("Filter by title or summary text."),
  sortDir: z.enum(["ASC", "DESC"]).optional().describe("Sort direction."),
  sortBy: z
  type: z.enum(POST_TYPES).optional().describe("Filter by post type: article or talk."),
    .enum(["publishedAt", "updatedAt"])
    .optional()
    .describe("Field used for sorting."),
});

export const McpPostSummarySchema = z.object({
  createdAt: z.iso.datetime().describe("Post creation time."),
  id: z.number().describe("Numeric post ID."),
  publishedAt: z.iso.datetime().nullable().describe("Publish time, if any."),
  readTimeInMinutes: z.number().describe("Estimated reading time in minutes."),
  slug: z.string().describe("Post slug."),
  status: z.enum(POST_STATUSES).describe("Post status."),
  type: z.enum(POST_TYPES).describe("Post type: article or talk."),
  summary: z.string().nullable().describe("Post summary."),
  title: z.string().describe("Post title."),
  updatedAt: z.iso.datetime().describe("Last update time."),
});

export const McpPostListItemSchema = McpPostSummarySchema.extend({
  tags: z.array(McpTagSchema).optional().describe("Assigned tags."),
});

export const McpPostsListOutputSchema = z.object({
  items: z.array(McpPostListItemSchema).describe("Matching posts."),
});

export const McpPostByIdInputSchema = z.object({
  id: z.number().describe("Numeric post ID."),
});

export const McpPostDetailSchema = McpPostSummarySchema.extend({
