import { Hono } from "hono";
import { z } from "zod";
import * as PhotosData from "@/features/photos/data/photos.data";

const photosRoute = new Hono<{ Bindings: Env }>()
  // GET /api/photos - list all photos
  .get("/", async (c) => {
    const album = c.req.query("album");
    const db = c.get("db");
    const photos = await PhotosData.getAll(db, album || undefined);
    return c.json(photos);
  })
  // GET /api/photos/albums - list all albums
  .get("/albums", async (c) => {
    const db = c.get("db");
    const albums = await PhotosData.getAlbums(db);
    return c.json(albums);
  })
  // GET /api/photos/:id
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ error: "Invalid ID" }, 400);
    const db = c.get("db");
    const photo = await PhotosData.getById(db, id);
    if (!photo) return c.json({ error: "Not found" }, 404);
    return c.json(photo);
  });

export default photosRoute;
