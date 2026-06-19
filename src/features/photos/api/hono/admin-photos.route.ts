import { Hono } from "hono";
import { z } from "zod";
import * as PhotosData from "@/features/photos/data/photos.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const photoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  album: z.string().max(100).optional(),
  tags: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const photoUpdateSchema = photoCreateSchema.partial();

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const adminPhotosRoute = app
  // GET /api/admin/photos
  .get("/", async (c) => {
    const album = c.req.query("album");
    const ctx = getServiceContext(c);
    const photos = await PhotosData.getAll(ctx.db, album || undefined);
    return c.json(photos);
  })
  // POST /api/admin/photos
  .post("/", async (c) => {
    const body = await c.req.json();
    const parsed = photoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const photo = await PhotosData.create(ctx.db, parsed.data);
    return c.json(photo, 201);
  })
  // PATCH /api/admin/photos/:id
  .patch("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const body = await c.req.json();
    const parsed = photoUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const ctx = getServiceContext(c);
    const photo = await PhotosData.update(ctx.db, id, parsed.data);
    if (!photo) return c.json({ error: "Not found" }, 404);
    return c.json(photo);
  })
  // DELETE /api/admin/photos/:id
  .delete("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    await PhotosData.remove(ctx.db, id);
    return c.json({ success: true });
  });

export default adminPhotosRoute;
