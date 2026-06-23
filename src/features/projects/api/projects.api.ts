import { createServerFn } from "@tanstack/react-start";
import * as ProjectsData from "@/features/projects/data/projects.data";
import { dbMiddleware } from "@/lib/middlewares";

export const getAllProjectsFn = createServerFn()
  .middleware([dbMiddleware])
  .handler(async ({ context }) => {
    return await ProjectsData.getAll(context.db);
  });
