import { Hono } from "hono";
import { z } from "zod";
import * as PhotosData from "@/features/photos/data/photos.data";

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

const adminPhotosRoute = new Hono<{ Bindings: Env }>()
  // GET /api/admin/photos
  .get("/", async (c) => {
    const album = c.req.query("album");
    const db = c.get("db");
    const photos = await PhotosData.getAll(db, album || undefined);
    return c.json(photos);
  })
  // POST /api/admin/photos
  .post("/", async (c) => {
    const body = await c.req.json();
    const parsed = photoCreateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }
    const db = c.get("db");
    const photo = await PhotosData.create(db, parsed.data);
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
    const db = c.get("db");
    const photo = await PhotosData.update(db, id, parsed.data);
    if (!photo) return c.json({ error: "Not found" }, 404);
    return c.json(photo);
  })
  // DELETE /api/admin/photos/:id
  .delete("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const db = c.get("db");
    await PhotosData.remove(db, id);
    return c.json({ success: true });
  });

export default adminPhotosRoute;
