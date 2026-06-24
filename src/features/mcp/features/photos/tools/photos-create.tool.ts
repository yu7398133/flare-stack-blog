import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as PhotosData from "@/features/photos/data/photos.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpPhotoCreateInputSchema,
  McpPhotoCreateOutputSchema,
} from "../schema/mcp-photos.schema";
import { toPhotoInsertInput } from "../service/mcp-photos.service";

const PHOTOS_CREATE_REQUIRED_SCOPES: OAuthScopeRequest = {
  media: ["write"],
};

export const photosCreateTool = defineMcpTool({
  name: "photos_create",
  description: "Create a new photo in the photo wall.",
  requiredScopes: PHOTOS_CREATE_REQUIRED_SCOPES,
  inputSchema: McpPhotoCreateInputSchema,
  outputSchema: McpPhotoCreateOutputSchema,
  async handler(args, context) {
    const photo = await PhotosData.create(context.db, toPhotoInsertInput(args));

    return {
      content: [
        {
          type: "text",
          text: `Created photo ${photo.id} (${photo.title})`,
        },
      ],
      structuredContent: { id: photo.id },
    };
  },
});
