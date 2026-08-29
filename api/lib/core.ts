export type RiskDecision = "ALLOW" | "RESTRICT" | "REQUIRE_APPROVAL" | "BLOCK";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "BLOCK";

export type ToolAudit = {
  timestamp: string;
  tool: string;
  arguments: Record<string, unknown>;
  durationMs: number;
  result: unknown;
  error: string | null;
  securityDecision: RiskDecision;
};

export type AgentRun = {
  id: string;
  task: string;
  status: "QUEUED" | "PLANNING" | "INSPECTING" | "CODING" | "EXECUTING" | "TESTING" | "ANALYZING" | "REPAIRING" | "REGRESSION" | "COMPLETED" | "FAILED";
  attempt: number;
  createdAt: string;
  updatedAt: string;
  capabilityMode: "unavailable" | "deterministic" | "live";
  steps: string[];
  toolCalls: ToolAudit[];
  evidence: string[];
  error?: string;
};

const runs = new Map<string, AgentRun>();

export function riskForCommand(command: string) {
  const value = command.trim().toLowerCase();
  if (/(rm\s+-rf\s+\/|mkfs|dd\s+if=|\/etc\/shadow|:\(\)\{)/.test(value)) return { score: 99, level: "BLOCK" as RiskLevel, decision: "BLOCK" as RiskDecision, reason: "Destructive host-level operation or escape payload detected." };
  if (/^(curl|wget|ssh|nc|ncat|socat)\b|\|\s*(sh|bash)\b|\b(sudo|chroot)\b/.test(value)) return { score: 71, level: "HIGH" as RiskLevel, decision: "REQUIRE_APPROVAL" as RiskDecision, reason: "Network egress, privileged operation, or unverified binary execution detected." };
  if (/^(pip|npm|pnpm|yarn|cargo)\s+install\b|^(apt|apt-get|yum)\b|^git\s+clone\b/.test(value)) return { score: 42, level: "MEDIUM" as RiskLevel, decision: "RESTRICT" as RiskDecision, reason: "Environment mutation or external dependency installation requested." };
  return { score: 10, level: "LOW" as RiskLevel, decision: "ALLOW" as RiskDecision, reason: "Read, test, or local build operation; still requires sandbox enforcement." };
}

export function createRun(task: string): AgentRun {
  const now = new Date().toISOString();
  const run: AgentRun = { id: `run_${crypto.randomUUID().slice(0, 8)}`, task, status: "QUEUED", attempt: 1, createdAt: now, updatedAt: now, capabilityMode: "unavailable", steps: ["Task analyzer", "Planner", "Repository inspector", "Coding agent", "Tool router", "Sandbox execution", "Test runner", "Result analyzer", "Evaluation", "Evidence report"], toolCalls: [], evidence: ["No execution evidence recorded yet."] };
  runs.set(run.id, run);
  return run;
}

export function getRun(id: string) { return runs.get(id); }
export function listRuns() { return Array.from(runs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

export function recordTool(run: AgentRun, tool: string, args: Record<string, unknown>, result: unknown, error: string | null, decision: RiskDecision) {
  const started = Date.now();
  run.toolCalls.push({ timestamp: new Date().toISOString(), tool, arguments: args, durationMs: Date.now() - started, result, error, securityDecision: decision });
  run.updatedAt = new Date().toISOString();
}

export function unavailableSandbox(command: string) {
  const risk = riskForCommand(command);
  return { available: false, status: "UNAVAILABLE", reason: "Docker sandbox backend is not configured on this deployment; arbitrary commands were not executed on the Vercel host.", risk, evidence: [] };
}
