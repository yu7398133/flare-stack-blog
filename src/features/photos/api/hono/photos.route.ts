import { Hono } from "hono";
import { z } from "zod";
import * as PhotosData from "@/features/photos/data/photos.data";
import { getServiceContext } from "@/lib/hono/helper";
import { baseMiddleware } from "@/lib/hono/middlewares";

const app = new Hono<{ Bindings: Env }>();

app.use("*", baseMiddleware);

const photosRoute = app
  // GET /api/photos - list all photos
  .get("/", async (c) => {
    const album = c.req.query("album");
    const ctx = getServiceContext(c);
    const photos = await PhotosData.getAll(ctx.db, album || undefined);
    return c.json(photos);
  })
  // GET /api/photos/albums - list all albums
  .get("/albums", async (c) => {
    const ctx = getServiceContext(c);
    const albums = await PhotosData.getAlbums(ctx.db);
    return c.json(albums);
  })
  // GET /api/photos/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const ctx = getServiceContext(c);
    const photo = await PhotosData.getById(ctx.db, id);
    if (!photo) return c.json({ error: "Not found" }, 404);
    return c.json(photo);
  });

export default photosRoute;
