import type { OAuthScopeRequest } from "@/features/oauth-provider/schema/oauth-provider.schema";
import * as PhotosData from "@/features/photos/data/photos.data";
import { defineMcpTool } from "../../../service/mcp-tool";
import {
  McpPhotosListInputSchema,
  McpPhotosListOutputSchema,
} from "../schema/mcp-photos.schema";
import { serializeMcpPhoto } from "../service/mcp-photos.service";

const PHOTOS_LIST_REQUIRED_SCOPES: OAuthScopeRequest = {
  media: ["read"],
};

export const photosListTool = defineMcpTool({
  name: "photos_list",
  description: "List photos from the photo wall with optional album filter.",
  requiredScopes: PHOTOS_LIST_REQUIRED_SCOPES,
  inputSchema: McpPhotosListInputSchema,
  outputSchema: McpPhotosListOutputSchema,
  async handler(args, context) {
    const allPhotos = await PhotosData.getAll(context.db, args.album);
    const offset = args.offset ?? 0;
    const limit = args.limit ?? allPhotos.length;
    const items = allPhotos.slice(offset, offset + limit).map(serializeMcpPhoto);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ items }, null, 2),
        },
      ],
      structuredContent: {
        items,
      },
    };
  },
});
