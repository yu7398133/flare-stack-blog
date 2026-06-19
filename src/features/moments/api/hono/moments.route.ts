import { Hono } from "hono";
import * as MomentsData from "@/features/moments/data/moments.data";

const momentsRoute = new Hono<{ Bindings: Env }>()
  // GET /api/moments - list moments (public only for unauthenticated)
  .get("/", async (c) => {
    const limit = parseInt(c.req.query("limit") || "20");
    const offset = parseInt(c.req.query("offset") || "0");
    const db = c.get("db");
    const moments = await MomentsData.getAll(db, { visibility: "public", limit, offset });
    const total = await MomentsData.count(db, "public");
    return c.json({ items: moments, total });
  })
  // GET /api/moments/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const db = c.get("db");
    const moment = await MomentsData.getById(db, id);
    if (!moment) return c.json({ error: "Not found" }, 404);
    return c.json(moment);
  })
  // POST /api/moments/:id/like
  .post("/:id/like", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const db = c.get("db");
    await MomentsData.incrementLikes(db, id);
    return c.json({ success: true });
  });

export default momentsRoute;
