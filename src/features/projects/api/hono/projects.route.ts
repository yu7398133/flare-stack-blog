import { Hono } from "hono";
import * as ProjectsData from "@/features/projects/data/projects.data";

const projectsRoute = new Hono<{ Bindings: Env }>()
  // GET /api/projects - list projects
  .get("/", async (c) => {
    const status = c.req.query("status");
    const featured = c.req.query("featured") === "true" ? true : undefined;
    const db = c.get("db");
    const projects = await ProjectsData.getAll(db, { status: status || undefined, featured });
    return c.json(projects);
  })
  // GET /api/projects/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const db = c.get("db");
    const project = await ProjectsData.getById(db, id);
    if (!project) return c.json({ error: "Not found" }, 404);
    return c.json(project);
  });

export default projectsRoute;
