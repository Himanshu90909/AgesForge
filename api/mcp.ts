type Req = { method?: string; body?: any; query?: Record<string, string> };
type Res = { setHeader(name: string, value: string): void; status(code: number): Res; json(value: unknown): Res; end(): void };

type Run = { id: string; task: string; status: string; capabilityMode: string; createdAt: string; evidence: string[] };
const runs: Run[] = [];
const tools = [
  { name: "aegis_health", description: "Return service health and explicitly report available execution capabilities.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "create_agent_run", description: "Create an observable agent run record. Execution remains queued until a worker backend is configured.", inputSchema: { type: "object", properties: { task: { type: "string" } }, required: ["task"], additionalProperties: false } },
  { name: "list_agent_runs", description: "List agent run records created in this deployment instance.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "score_command_risk", description: "Score a command with an explainable security decision.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"], additionalProperties: false } },
  { name: "execute_in_sandbox", description: "Request sandbox execution. Refuses host execution when Docker is not configured.", inputSchema: { type: "object", properties: { command: { type: "string" } }, required: ["command"], additionalProperties: false } },
];
const text = (value: unknown) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
function risk(command: string) {
  const v = command.trim().toLowerCase();
  if (/(rm\s+-rf\s+\/|mkfs|dd\s+if=|\/etc\/shadow|:\(\)\{)/.test(v)) return { score: 99, level: "BLOCK", decision: "BLOCK", reason: "Destructive host-level operation or escape payload detected." };
  if (/^(curl|wget|ssh|nc|ncat|socat)\b|\|\s*(sh|bash)\b|\b(sudo|chroot)\b/.test(v)) return { score: 71, level: "HIGH", decision: "REQUIRE_APPROVAL", reason: "Network egress, privileged operation, or unverified binary execution detected." };
  if (/^(pip|npm|pnpm|yarn|cargo)\s+install\b|^(apt|apt-get|yum)\b|^git\s+clone\b/.test(v)) return { score: 42, level: "MEDIUM", decision: "RESTRICT", reason: "Environment mutation or external dependency installation requested." };
  return { score: 10, level: "LOW", decision: "ALLOW", reason: "Read, test, or local build operation; still requires sandbox enforcement." };
}
function callTool(name: string, args: any) {
  if (name === "aegis_health") return { status: "ok", service: "AegisForge Agent OS", version: "3.2.0-core", capabilities: { agentApi: "available", riskScoring: "available", sandboxExecution: "unavailable", persistentStorage: "unavailable", liveLLM: "unavailable" }, executionPolicy: "Never execute arbitrary code on the Vercel host." };
  if (name === "create_agent_run") { const run: Run = { id: `run_${Date.now().toString(36)}`, task: String(args.task || ""), status: "QUEUED", capabilityMode: "unavailable", createdAt: new Date().toISOString(), evidence: ["No execution evidence recorded; worker backend unavailable."] }; runs.unshift(run); return { run }; }
  if (name === "list_agent_runs") return { runs, source: "ephemeral-deployment-memory" };
  if (name === "score_command_risk") return risk(String(args.command || ""));
  if (name === "execute_in_sandbox") return { available: false, status: "UNAVAILABLE", reason: "Docker sandbox backend is not configured on this deployment; command was not executed on the Vercel host.", risk: risk(String(args.command || "")), evidence: [] };
  throw new Error(`Unknown tool: ${name}`);
}

export default async function handler(req: Req, res: Res) {
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
    if (request.method === "tools/call") return res.status(200).json({ jsonrpc: "2.0", id, result: text(callTool(request.params?.name, request.params?.arguments || {})) });
    return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${request.method}` } });
  } catch (error: any) { return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32000, message: error?.message || "MCP tool failed" } }); }
}
