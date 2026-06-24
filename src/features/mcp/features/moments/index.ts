import type { McpToolDefinition } from "../../service/mcp-tool";
import { momentsListTool } from "./tools/moments-list.tool";
import { momentsCreateTool } from "./tools/moments-create.tool";
import { momentsDeleteTool } from "./tools/moments-delete.tool";

export const mcpMomentsTools: McpToolDefinition[] = [
  momentsListTool,
  momentsCreateTool,
  momentsDeleteTool,
];
