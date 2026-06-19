import { Hono } from "hono";
import * as MomentsData from "@/features/moments/data/moments.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const momentsRoute = app
  // GET /api/moments - list moments (public only for unauthenticated)
  .get("/", async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");
    const ctx = getServiceContext(c);
    const moments = await MomentsData.getAll(ctx.db, { visibility: "public", limit, offset });
    const total = await MomentsData.count(ctx.db, "public");
    return c.json({ items: moments, total });
  })
  // GET /api/moments/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    const moment = await MomentsData.getById(ctx.db, id);
    if (!moment) return c.json({ error: "Not found" }, 404);
    return c.json(moment);
  })
  // POST /api/moments/:id/like
  .post("/:id/like", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    await MomentsData.incrementLikes(ctx.db, id);
    return c.json({ success: true });
  });

export default momentsRoute;
