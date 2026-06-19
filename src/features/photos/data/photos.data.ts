import { eq, desc } from "drizzle-orm";
import type { DrizzleD1 } from "@/lib/db";
import { PhotosTable, type Photo, type PhotoInsert } from "@/lib/db/schema/photos.table";

export async function getAll(db: DrizzleD1, album?: string): Promise<Photo[]> {
  const query = db.select().from(PhotosTable);
  if (album) {
    return query.where(eq(PhotosTable.album, album)).orderBy(desc(PhotosTable.sortOrder), desc(PhotosTable.createdAt));
  }
  return query.orderBy(desc(PhotosTable.sortOrder), desc(PhotosTable.createdAt));
}

export async function getById(db: DrizzleD1, id: number): Promise<Photo | undefined> {
  const results = await db.select().from(PhotosTable).where(eq(PhotosTable.id, id)).limit(1);
  return results[0];
}

export async function create(db: DrizzleD1, data: PhotoInsert): Promise<Photo> {
  const results = await db.insert(PhotosTable).values(data).returning();
  return results[0];
}

export async function update(db: DrizzleD1, id: number, data: Partial<PhotoInsert>): Promise<Photo | undefined> {
  const results = await db.update(PhotosTable).set(data).where(eq(PhotosTable.id, id)).returning();
  return results[0];
}

export async function remove(db: DrizzleD1, id: number): Promise<void> {
  await db.delete(PhotosTable).where(eq(PhotosTable.id, id));
}

export async function getAlbums(db: DrizzleD1): Promise<string[]> {
  const photos = await db.select({ album: PhotosTable.album }).from(PhotosTable);
  const albums = [...new Set(photos.map((p) => p.album).filter(Boolean))] as string[];
  return albums;
}
