/**
 * MCP Server Implementation — Linker
 *
 * Spec: §19 MCP Contract
 *
 * Rules:
 *   - Thin authenticated interface over Linker Core (§19)
 *   - MCP clients authenticate via Bearer token verified against mcp_clients table
 *   - All policy, autonomy rules, and RLS are enforced in Linker Core; MCP cannot bypass them (§19)
 *   - Exposes standard Model Context Protocol tools
 */

import { createSupabaseServiceClient } from "@/lib/db/supabase-server";
import { BrainStore } from "@/lib/brain/store";
import { OpportunityService } from "@/lib/opportunities/service";
import { ContentService } from "@/lib/content/service";
import { AgentStateMachine } from "@/lib/agent/state-machine";
import { logAudit } from "@/lib/audit/logger";

export interface McpRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export const MCP_TOOLS = [
  {
    name: "linker_get_brain_context",
    description: "Retrieves the structured Professional Brain context (identity, expertise, goals, voice) for the authenticated account.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "linker_list_opportunities",
    description: "Lists active strategic and content opportunities detected by the Opportunity Engine.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["detected", "evaluated", "presented", "accepted", "all"] },
      },
    },
  },
  {
    name: "linker_create_draft",
    description: "Creates a new thought leadership content draft with automated anti-AI heuristic scoring.",
    inputSchema: {
      type: "object",
      required: ["title", "body"],
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        ideaId: { type: "string" },
      },
    },
  },
  {
    name: "linker_get_draft",
    description: "Retrieves a draft and its automated multi-criteria critique.",
    inputSchema: {
      type: "object",
      required: ["draftId"],
      properties: {
        draftId: { type: "string" },
      },
    },
  },
  {
    name: "linker_get_agent_status",
    description: "Inspects Linker agent loop operational state, autonomy mode, and queue counters.",
    inputSchema: { type: "object", properties: {} },
  },
];

export async function authenticateMcpClient(clientId: string): Promise<string | null> {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("mcp_clients")
    .select("account_id, revoked_at")
    .eq("client_id", clientId)
    .single();

  if (error || !data || data.revoked_at) {
    return null;
  }

  return data.account_id;
}

export async function handleMcpRpc(
  accountId: string,
  request: McpRpcRequest
): Promise<McpRpcResponse> {
  const { id, method, params } = request;

  // 1. tools/list
  if (method === "tools/list") {
    return {
      jsonrpc: "2.0",
      id,
      result: { tools: MCP_TOOLS },
    };
  }

  // 2. tools/call
  if (method === "tools/call") {
    const toolName = params?.name as string;
    const args = (params?.arguments as Record<string, unknown>) || {};

    try {
      let toolResult: unknown;

      switch (toolName) {
        case "linker_get_brain_context": {
          const brain = new BrainStore(accountId);
          toolResult = await brain.assembleContext();
          break;
        }

        case "linker_list_opportunities": {
          const oppService = new OpportunityService(accountId);
          const status =
            args.status === "all" || !args.status
              ? undefined
              : (args.status as import("@/lib/db/types").OpportunityLifecycleStatus);
          toolResult = await oppService.listOpportunities(status);
          break;
        }

        case "linker_create_draft": {
          const contentService = new ContentService(accountId);
          const draftId = await contentService.createDraft({
            title: String(args.title),
            body: String(args.body),
            ideaId: args.ideaId ? String(args.ideaId) : undefined,
          });
          toolResult = { draftId, message: "Draft created successfully with anti-AI verification." };
          break;
        }

        case "linker_get_draft": {
          const contentService = new ContentService(accountId);
          toolResult = await contentService.getDraft(String(args.draftId));
          break;
        }

        case "linker_get_agent_status": {
          const stateMachine = new AgentStateMachine(accountId);
          toolResult = await stateMachine.getStatus();
          break;
        }

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Tool '${toolName}' not found.` },
          };
      }

      await logAudit({
        accountId,
        actorType: "mcp_client",
        actorId: "mcp_rpc",
        action: `mcp.tool_called.${toolName}`,
        resourceType: "mcp_tool",
        resourceId: toolName,
        result: "success",
        status: "success",
      });

      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(toolResult, null, 2) }] },
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message },
      };
    }
  }

  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method '${method}' not found.` },
  };
}
