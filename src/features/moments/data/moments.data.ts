import { and, desc, eq, sql } from "drizzle-orm";
import type { DB } from "@/lib/db";
import {
  type Moment,
  type MomentInsert,
  MomentsTable,
} from "@/lib/db/schema/moments.table";

export async function getAll(
  db: DB,
  options?: { visibility?: string; limit?: number; offset?: number },
): Promise<Moment[]> {
  const conditions = [];
  if (options?.visibility) {
    conditions.push(
      eq(MomentsTable.visibility, options.visibility as "public" | "private"),
    );
  }

  const query = db.select().from(MomentsTable);
  const filtered =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered
    .orderBy(desc(MomentsTable.createdAt))
    .limit(options?.limit ?? 20)
    .offset(options?.offset ?? 0);
}

export async function count(db: DB, visibility?: string): Promise<number> {
  const conditions = [];
  if (visibility) {
    conditions.push(
      eq(MomentsTable.visibility, visibility as "public" | "private"),
    );
  }
  const query = db.select({ count: sql<number>`count(*)` }).from(MomentsTable);
  const filtered =
    conditions.length > 0 ? query.where(and(...conditions)) : query;
  const results = await filtered;
  return results[0]?.count ?? 0;
}

export async function getById(db: DB, id: number): Promise<Moment | undefined> {
  const results = await db
    .select()
    .from(MomentsTable)
    .where(eq(MomentsTable.id, id))
    .limit(1);
  return results[0];
}

export async function create(db: DB, data: MomentInsert): Promise<Moment> {
  const results = await db.insert(MomentsTable).values(data).returning();
  return results[0];
}

export async function update(
  db: DB,
  id: number,
  data: Partial<MomentInsert>,
): Promise<Moment | undefined> {
  const results = await db
    .update(MomentsTable)
    .set(data)
    .where(eq(MomentsTable.id, id))
    .returning();
  return results[0];
}

export async function remove(db: DB, id: number): Promise<void> {
  await db.delete(MomentsTable).where(eq(MomentsTable.id, id));
}

export async function incrementLikes(db: DB, id: number): Promise<void> {
  await db
    .update(MomentsTable)
    .set({ likes: sql`${MomentsTable.likes} + 1` })
    .where(eq(MomentsTable.id, id));
}
