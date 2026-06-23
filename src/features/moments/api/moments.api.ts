import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import * as MomentsData from "@/features/moments/data/moments.data";
import { dbMiddleware } from "@/lib/middlewares";

export const getRecentMomentsFn = createServerFn()
  .middleware([dbMiddleware])
  .inputValidator(
    z.object({
      limit: z.number().int().min(1).max(50).optional().default(5),
    }),
  )
  .handler(async ({ data, context }) => {
    const items = await MomentsData.getAll(context.db, {
      visibility: "public",
      limit: data.limit,
    });
    const total = await MomentsData.count(context.db, "public");
    return { items, total };
  });
