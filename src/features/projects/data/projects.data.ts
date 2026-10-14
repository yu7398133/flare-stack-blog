import { and, desc, eq } from "drizzle-orm";
import type { DB } from "@/lib/db";
import {
  type Project,
  type ProjectInsert,
  ProjectsTable,
} from "@/lib/db/schema/projects.table";

export async function getAll(
  db: DB,
  options?: { status?: string; featured?: boolean },
): Promise<Project[]> {
  const conditions = [];
  if (options?.status) {
    conditions.push(
      eq(
        ProjectsTable.status,
        options.status as "active" | "archived" | "planned",
      ),
    );
  }
  if (options?.featured !== undefined) {
    conditions.push(eq(ProjectsTable.featured, options.featured));
  }

  const query = db.select().from(ProjectsTable);
  const filtered =
    conditions.length > 0 ? query.where(and(...conditions)) : query;

  return filtered.orderBy(
    desc(ProjectsTable.featured),
    desc(ProjectsTable.sortOrder),
    desc(ProjectsTable.createdAt),
  );
}

export async function getById(
  db: DB,
  id: number,
): Promise<Project | undefined> {
  const results = await db
    .select()
    .from(ProjectsTable)
    .where(eq(ProjectsTable.id, id))
    .limit(1);
  return results[0];
}

export async function create(db: DB, data: ProjectInsert): Promise<Project> {
  const results = await db.insert(ProjectsTable).values(data).returning();
  return results[0];
}

export async function update(
  db: DB,
  id: number,
  data: Partial<ProjectInsert>,
): Promise<Project | undefined> {
  const results = await db
    .update(ProjectsTable)
    .set(data)
    .where(eq(ProjectsTable.id, id))
    .returning();
  return results[0];
}

export async function remove(db: DB, id: number): Promise<void> {
  await db.delete(ProjectsTable).where(eq(ProjectsTable.id, id));
}
