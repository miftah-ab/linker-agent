/**
 * MCP Route Handler — Linker
 *
 * Spec: §19 MCP Contract
 * Authenticated JSON-RPC 2.0 endpoint for external AI orchestrators / IDE agents.
 */

import { authenticateMcpClient, handleMcpRpc, type McpRpcRequest } from "@/lib/mcp/server";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32001, message: "Authentication required. Bearer MCP client token missing." },
      },
      { status: 401 }
    );
  }

  const clientId = authHeader.replace("Bearer ", "").trim();
  const accountId = await authenticateMcpClient(clientId);

  if (!accountId) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32002, message: "Invalid or revoked MCP credentials." },
      },
      { status: 403 }
    );
  }

  try {
    const body = (await request.json()) as McpRpcRequest;
    if (!body || body.jsonrpc !== "2.0" || !body.method) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body?.id ?? null,
          error: { code: -32600, message: "Invalid JSON-RPC 2.0 request." },
        },
        { status: 400 }
      );
    }

    const response = await handleMcpRpc(accountId, body);
    return NextResponse.json(response);
  } catch (err) {
    console.error("[MCP] Unexpected error in RPC execution:", err);
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32603, message: "Internal JSON-RPC execution error." },
      },
      { status: 500 }
    );
  }
}
