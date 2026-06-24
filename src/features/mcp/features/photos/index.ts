import type { McpToolDefinition } from "../../service/mcp-tool";
import { photosCreateTool } from "./tools/photos-create.tool";
import { photosDeleteTool } from "./tools/photos-delete.tool";
import { photosListTool } from "./tools/photos-list.tool";

export const mcpPhotosTools: McpToolDefinition[] = [
  photosListTool,
  photosCreateTool,
  photosDeleteTool,
];
