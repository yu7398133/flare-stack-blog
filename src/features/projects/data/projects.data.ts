import { eq, desc, and, sql } from "drizzle-orm";
import type { DrizzleD1 } from "@/lib/db";
import { ProjectsTable, type Project, type ProjectInsert } from "@/lib/db/schema/projects.table";

export async function getAll(db: DrizzleD1, options?: { status?: string; featured?: boolean }): Promise<Project[]> {
  const conditions = [];
  if (options?.status) {
    conditions.push(eq(ProjectsTable.status, options.status as "active" | "archived" | "planned"));
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(ProjectsTable.featured, options.featured));
  }

  const query = db.select().from(ProjectsTable);
  const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered.orderBy(desc(ProjectsTable.featured), desc(ProjectsTable.sortOrder), desc(ProjectsTable.createdAt));
}

export async function getById(db: DrizzleD1, id: number): Promise<Project | undefined> {
  const results = await db.select().from(ProjectsTable).where(eq(ProjectsTable.id, id)).limit(1);
  return results[0];
}

export async function create(db: DrizzleD1, data: ProjectInsert): Promise<Project> {
  const results = await db.insert(ProjectsTable).values(data).returning();
  return results[0];
}

export async function update(db: DrizzleD1, id: number, data: Partial<ProjectInsert>): Promise<Project | undefined> {
  const results = await db.update(ProjectsTable).set(data).where(eq(ProjectsTable.id, id)).returning();
  return results[0];
}

export async function remove(db: DrizzleD1, id: number): Promise<void> {
  await db.delete(ProjectsTable).where(eq(ProjectsTable.id, id));
}
