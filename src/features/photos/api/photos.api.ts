import { createServerFn } from "@tanstack/react-start";
import * as PhotosData from "@/features/photos/data/photos.data";
import { dbMiddleware } from "@/lib/middlewares";

export const getAllPhotosFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return await PhotosData.getAll(context.db);
  });
