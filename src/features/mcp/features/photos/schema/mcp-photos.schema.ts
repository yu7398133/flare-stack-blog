import { z } from "zod";

export const McpPhotoSchema = z.object({
  id: z.number().describe("Numeric photo ID."),
  title: z.string().describe("Photo title."),
  description: z.string().nullable().describe("Photo description."),
  imageUrl: z.string().describe("URL of the photo image."),
  thumbnailUrl: z.string().nullable().describe("URL of the photo thumbnail."),
  album: z.string().nullable().describe("Album/category this photo belongs to."),
  tags: z.string().nullable().describe("JSON array of tags."),
  sortOrder: z.number().describe("Sort order for ordering within an album."),
  createdAt: z.iso.datetime().describe("Photo creation time."),
  updatedAt: z.iso.datetime().describe("Last update time."),
});

export const McpPhotosListInputSchema = z.object({
  limit: z.number().optional().describe("Maximum number of photos to return."),
  offset: z.number().optional().describe("Result offset."),
  album: z.string().optional().describe("Filter by album name."),
});

export const McpPhotosListOutputSchema = z.object({
  items: z.array(McpPhotoSchema).describe("Matching photos."),
});

export const McpPhotoCreateInputSchema = z.object({
  title: z.string().min(1).max(200).describe("Photo title (required)."),
  description: z.string().max(500).optional().describe("Photo description."),
  imageUrl: z.string().url().describe("URL of the photo image (required)."),
  thumbnailUrl: z.string().url().optional().describe("URL of the photo thumbnail."),
  album: z.string().max(100).optional().describe("Album/category name."),
  tags: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .describe("Tags as JSON string or array of strings."),
  sortOrder: z.number().int().optional().describe("Sort order for ordering within an album."),
});

export const McpPhotoCreateOutputSchema = z.object({
  id: z.number().describe("Numeric ID of the created photo."),
});

export const McpPhotoDeleteInputSchema = z.object({
  id: z.number().describe("Numeric photo ID to delete."),
});

export const McpPhotoDeleteOutputSchema = z.object({
  deleted: z.literal(true).describe("Whether the photo was deleted."),
  id: z.number().describe("Numeric photo ID."),
  title: z.string().describe("Title of the deleted photo."),
});
