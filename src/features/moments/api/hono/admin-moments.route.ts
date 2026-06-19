import { Hono } from "hono";
import { z } from "zod";
import * as MomentsData from "@/features/moments/data/moments.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const momentCreateSchema = z.object({
  content: z.string().min(1).max(5000),
  images: z.string().optional(),
  mood: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  visibility: z.enum(["public", "private"]).optional(),
});

const momentUpdateSchema = momentCreateSchema.partial();

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const adminMomentsRoute = app
  // GET /api/admin/moments
  .get("/", async (c) => {
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");
    const ctx = getServiceContext(c);
    const moments = await MomentsData.getAll(ctx.db, { limit, offset });
    const total = await MomentsData.count(ctx.db);
    return c.json({ items: moments, total });
  })
  // POST /api/admin/moments
  .post("/", async (c) => {
    const body = await c.req.json();
    const parsed = momentCreateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const moment = await MomentsData.create(ctx.db, parsed.data);
    return c.json(moment, 201);
  })
  // PATCH /api/admin/moments/:id
  .patch("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const body = await c.req.json();
    const parsed = momentUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const moment = await MomentsData.update(ctx.db, id, parsed.data);
    if (!moment) return c.json({ error: "Not found" }, 404);
    return c.json(moment);
  })
  // DELETE /api/admin/moments/:id
  .delete("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    await MomentsData.remove(ctx.db, id);
    return c.json({ success: true });
  });

export default adminMomentsRoute;
