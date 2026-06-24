import type { Moment } from "@/lib/db/schema/moments.table";

export function serializeMcpMoment(m: Moment) {
  return {
    id: m.id,
    content: m.content,
    images: m.images ?? null,
    mood: m.mood ?? null,
    location: m.location ?? null,
    visibility: m.visibility,
    likes: m.likes,
    createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
    updatedAt: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : String(m.updatedAt),
  };
}
