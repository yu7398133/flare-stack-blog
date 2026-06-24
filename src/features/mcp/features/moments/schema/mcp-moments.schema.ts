import { z } from "zod";

export const McpMomentSchema = z.object({
  id: z.number().describe("Numeric moment ID."),
  content: z.string().describe("Moment content text."),
  images: z.string().nullable().optional().describe("JSON array of image URLs, if any."),
  mood: z.string().nullable().optional().describe("Mood tag, if any."),
  location: z.string().nullable().optional().describe("Location info, if any."),
  visibility: z.enum(["public", "private"]).describe("Visibility setting."),
  likes: z.number().describe("Like count."),
  createdAt: z.iso.datetime().describe("Creation time."),
  updatedAt: z.iso.datetime().describe("Last update time."),
});

export const McpMomentsListInputSchema = z.object({
  limit: z.number().optional().describe("Maximum number of moments to return."),
  offset: z.number().optional().describe("Result offset."),
});

export const McpMomentsListOutputSchema = z.object({
  items: z.array(McpMomentSchema).describe("Matching moments."),
  total: z.number().describe("Total matching moments."),
});

export const McpMomentCreateInputSchema = z.object({
  content: z.string().min(1).max(5000).describe("Moment content text."),
  images: z.string().optional().describe("JSON array of image URLs."),
  mood: z.string().max(50).optional().describe("Mood tag."),
  location: z.string().max(200).optional().describe("Location info."),
  visibility: z.enum(["public", "private"]).optional().describe("Visibility setting."),
});

export const McpMomentDeleteInputSchema = z.object({
  id: z.number().describe("Numeric moment ID to delete."),
});
