import type { VercelRequest, VercelResponse } from "@vercel/node";

const tools = [
  { name: "aegis_health", description: "Return the health and capabilities of the AegisForge agent operating system.", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "run_agent_step", description: "Run one controlled AegisForge workflow step: planning, code_generation, failure_analysis, patch_synthesis, or regression_generation.", inputSchema: { type: "object", properties: { stepType: { type: "string", enum: ["planning", "code_generation", "failure_analysis", "patch_synthesis", "regression_generation"] }, task: { type: "string" }, currentCode: { type: "string" }, errorTrace: { type: "string" }, previousSteps: { type: "array" } }, required: ["stepType", "task"], additionalProperties: false } },
  { name: "classify_failure", description: "Classify an execution failure and return a root-cause hypothesis plus a repair strategy.", inputSchema: { type: "object", properties: { errorTrace: { type: "string" }, task: { type: "string" }, currentCode: { type: "string" } }, required: ["errorTrace"], additionalProperties: false } },
];

const json = (value: unknown) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });

function simulatedStep(stepType: string, task: string, errorTrace = "") {
  if (stepType === "planning") return { stepType, task, planSteps: ["Isolate workspace and verify dependency graph", "Build a reproducing test harness", "Synthesize the smallest safe patch", "Run the strict sandbox test suite", "Execute adversarial and regression gates", "Write the failure-memory record"], sandboxPolicy: "RESTRICT_NETWORK · SECCOMP_BPF · 512MB_CGROUP", estimatedComplexity: "O(N) compute · O(1) memory" };
  if (stepType === "failure_analysis") return { category: errorTrace.toLowerCase().includes("timeout") ? "timeout" : errorTrace.toLowerCase().includes("import") ? "dependency_error" : "logic_flaw", severity: "HIGH", rootCause: "The failing invariant is not covered at the boundary where the state transition occurs.", confidenceScore: 0.94, repairStrategy: "Add a focused boundary assertion, patch the smallest affected branch, and generate a regression test before re-running the full suite." };
  if (stepType === "patch_synthesis") return { patchSummary: `Prepared a minimal guarded patch for: ${task}`, unifiedDiff: "@@ agent patch @@\n+ add invariant guard\n+ add regression case\n+ preserve existing public contract" };
  if (stepType === "regression_generation") return { reproPass: true, invariantPass: true, adversarialPass: true, performancePass: true, suiteSummary: "4/4 test tiers passed · 0 regressions · execution budget respected" };
  return { status: "success", detail: `Step ${stepType} prepared for ${task}`, next: "Execute inside the configured sandbox and attach the trace." };
}

async function handleTool(name: string, args: Record<string, any>) {
  if (name === "aegis_health") return { status: "ok", service: "AegisForge Agent OS", version: "3.2.0-core", capabilities: ["failure-intelligence", "adaptive-sandbox", "evaluation", "experience-memory"], simulated: true };
  if (name === "classify_failure") return simulatedStep("failure_analysis", args.task || "unknown task", args.errorTrace || "");
  if (name === "run_agent_step") return simulatedStep(args.stepType, args.task, args.errorTrace);
  throw new Error(`Unknown tool: ${name}`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Mcp-Session-Id, Mcp-Protocol-Version");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "MCP endpoint accepts POST requests only" });

  const request = req.body || {};
  const id = request.id ?? null;
  try {
    if (request.method === "initialize") return res.status(200).json({ jsonrpc: "2.0", id, result: { protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "aegisforge", version: "0.1.0" } } });
    if (request.method === "notifications/initialized" || request.method === "ping") return res.status(200).json({ jsonrpc: "2.0", id, result: {} });
    if (request.method === "tools/list") return res.status(200).json({ jsonrpc: "2.0", id, result: { tools } });
    if (request.method === "tools/call") {
      const result = await handleTool(request.params?.name, request.params?.arguments || {});
      return res.status(200).json({ jsonrpc: "2.0", id, result: json(result) });
    }
    return res.status(200).json({ jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${request.method}` } });
  } catch (error: any) {
    return res.status(200).json({ jsonrpc: "2.0", id, result: { isError: true, ...json({ error: error?.message || "MCP tool failed" }) } });
  }
}
