import type { Photo, PhotoInsert } from "@/lib/db/schema/photos.table";
import { serializeMcpDate } from "../../../service/mcp-serialize";

export function serializeMcpPhoto(photo: Photo) {
  return {
    id: photo.id,
    title: photo.title,
    description: photo.description ?? null,
    imageUrl: photo.imageUrl,
    thumbnailUrl: photo.thumbnailUrl ?? null,
    album: photo.album ?? null,
    tags: photo.tags ?? null,
    sortOrder: photo.sortOrder,
    createdAt: serializeMcpDate(photo.createdAt),
    updatedAt: serializeMcpDate(photo.updatedAt),
  };
}

type McpPhotoCreateInput = {
  title: string;
  description?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  album?: string;
  tags?: string | string[];
  sortOrder?: number;
};

export function toPhotoInsertInput(input: McpPhotoCreateInput): PhotoInsert {
  const data: PhotoInsert = {
    title: input.title,
    imageUrl: input.imageUrl,
  };

  if (input.description !== undefined) {
    data.description = input.description;
  }

  if (input.thumbnailUrl !== undefined) {
    data.thumbnailUrl = input.thumbnailUrl;
  }

  if (input.album !== undefined) {
    data.album = input.album;
  }

  if (input.tags !== undefined) {
    data.tags = Array.isArray(input.tags) ? JSON.stringify(input.tags) : input.tags;
  }

  if (input.sortOrder !== undefined) {
    data.sortOrder = input.sortOrder;
  }

  return data;
}
