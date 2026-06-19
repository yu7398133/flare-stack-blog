import { Hono } from "hono";
import { z } from "zod";
import * as ProjectsData from "@/features/projects/data/projects.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const projectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  content: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  projectUrl: z.string().url().optional().or(z.literal("")),
  repoUrl: z.string().url().optional().or(z.literal("")),
  techStack: z.string().optional(),
  status: z.enum(["active", "archived", "planned"]).optional(),
  sortOrder: z.number().int().optional(),
  featured: z.boolean().optional(),
});

const projectUpdateSchema = projectCreateSchema.partial();

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const adminProjectsRoute = app
  // GET /api/admin/projects
  .get("/", async (c) => {
    const ctx = getServiceContext(c);
    const projects = await ProjectsData.getAll(ctx.db);
    return c.json(projects);
  })
  // POST /api/admin/projects
  .post("/", async (c) => {
    const body = await c.req.json();
    const parsed = projectCreateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const project = await ProjectsData.create(ctx.db, parsed.data);
    return c.json(project, 201);
  })
  // PATCH /api/admin/projects/:id
  .patch("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const body = await c.req.json();
    const parsed = projectUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const project = await ProjectsData.update(ctx.db, id, parsed.data);
    if (!project) return c.json({ error: "Not found" }, 404);
    return c.json(project);
  })
  // DELETE /api/admin/projects/:id
  .delete("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    await ProjectsData.remove(ctx.db, id);
    return c.json({ success: true });
  });

export default adminProjectsRoute;
