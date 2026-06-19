import { Hono } from "hono";
import * as ProjectsData from "@/features/projects/data/projects.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const projectsRoute = app
  // GET /api/projects - list projects
  .get("/", async (c) => {
    const status = c.req.query("status");
    const featured = c.req.query("featured") === "true" ? true : undefined;
    const ctx = getServiceContext(c);
    const projects = await ProjectsData.getAll(ctx.db, { status: status || undefined, featured });
    return c.json(projects);
  })
  // GET /api/projects/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    const project = await ProjectsData.getById(ctx.db, id);
    if (!project) return c.json({ error: "Not found" }, 404);
    return c.json(project);
  });

export default projectsRoute;
