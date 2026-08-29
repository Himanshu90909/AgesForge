import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createRun, listRuns, riskForCommand, unavailableSandbox } from "./lib/core";

const tools = [
  { name: "aegis_health", description: "Return service health and explicitly report which execution capabilities are available.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "create_agent_run", description: "Create an observable agent run record for a software task. Execution remains queued until a configured worker backend is available.", inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"], additionalProperties: false } },
  { name: "list_agent_runs", description: "List agent run records created in this deployment instance.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "score_command_risk", description: "Score a proposed command and return an explainable ALLOW, RESTRICT, REQUIRE_APPROVAL, or BLOCK decision.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"], additionalProperties: false } },
  { name: "execute_in_sandbox", description: "Request sandbox execution. This deployment refuses host execution when a Docker backend is not configured.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"], additionalProperties: false } },
];
const text = (value: unknown) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });

async function callTool(name: string, args: Record<string, any>) {
  switch (name) {
    case "aegis_health": return { status: "ok", service: "AegisForge Agent OS", version: "3.2.0-core", capabilities: { agentApi: "available", riskScoring: "available", sandboxExecution: "unavailable", persistentStorage: "unavailable", liveLLM: Boolean(process.env.GEMINI_API_KEY) }, executionPolicy: "Never execute arbitrary code on the Vercel host." };
    case "create_agent_run": return { run: createRun(String(args.task || "")) };
    case "list_agent_runs": return { runs: listRuns(), source: "ephemeral-deployment-memory" };
    case "score_command_risk": return riskForCommand(String(args.command || ""));
    case "execute_in_sandbox": return unavailableSandbox(String(args.command || ""));
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json({ service: "AegisForge MCP Server", status: "online", endpoint: "/mcp", transport: "JSON-RPC 2.0 over POST", tools: tools.map((tool) => tool.name), note: "Sandbox execution is explicitly unavailable until a Docker worker is configured." });
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST with a JSON-RPC MCP request, or GET for server status." });
  const request = req.body || {};
  const id = request.id ?? null;
  try {
    if (request.method === "initialize") return res.status(200).json({ jsonrpc: "2.0", id, result: { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "aegisforge", version: "0.2.0" } } });
    if (request.method === "notifications/initialized" || request.method === "ping") return res.status(200).json({ jsonrpc: "2.0", id, result: {} });
    if (request.method === "tools/list") return res.status(200).json({ jsonrpc: "2.0", id, result: { tools } });
    if (request.method === "tools/call") return res.status(200).json({ jsonrpc: "2.0", id, result: text(await callTool(request.params?.name, request.params?.arguments || {})) });
    return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${request.method}` } });
  } catch (error: any) {
    return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32000, message: error?.message || "MCP tool failed" } });
  }
}
