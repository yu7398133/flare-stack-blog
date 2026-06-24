import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as PhotosData from "@/features/photos/data/photos.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpPhotoDeleteInputSchema,
  McpPhotoDeleteOutputSchema,
} from "../schema/mcp-photos.schema";

const PHOTOS_DELETE_REQUIRED_SCOPES: OAuthScopeRequest = {
  media: ["write"],
};

export const photosDeleteTool = defineMcpTool({
  name: "photos_delete",
  description:
    "Delete a photo from the photo wall permanently. Use with care because this removes the photo from the CMS.",
  requiredScopes: PHOTOS_DELETE_REQUIRED_SCOPES,
  inputSchema: McpPhotoDeleteInputSchema,
  outputSchema: McpPhotoDeleteOutputSchema,
  async handler(args, context) {
    const photo = await PhotosData.getById(context.db, args.id);
    if (!photo) {
      return {
        content: [
          {
            type: "text",
            text: `Photo ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }

    await PhotosData.remove(context.db, args.id);

    const result = {
      deleted: true as const,
      id: photo.id,
      title: photo.title,
    };

    return {
      content: [
        {
          type: "text",
          text: `Deleted photo ${photo.id} (${photo.title})`,
        },
      ],
      structuredContent: result,
    };
  },
});
