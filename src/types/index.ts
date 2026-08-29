export type TaskCategory = 
  | 'bug_fixing'
  | 'security_hardening'
  | 'concurrency_race'
  | 'memory_leak'
  | 'resource_exhaustion'
  | 'feature_implementation'
  | 'refactoring_performance'
  | 'dependency_abi'
  | 'sql_database';

export type TaskDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Codex-Core';
export type DifficultyLevel = TaskDifficulty;

export type Language = 
  | 'Python' 
  | 'Rust' 
  | 'TypeScript' 
  | 'JavaScript'
  | 'Go' 
  | 'C++' 
  | 'C' 
  | 'Java' 
  | 'Kotlin' 
  | 'Swift' 
  | 'C#' 
  | 'Ruby' 
  | 'PHP' 
  | 'Scala' 
  | 'Elixir' 
  | 'SQL' 
  | 'Shell';

export const ALL_LANGUAGES: Language[] = [
  'Python',
  'Rust',
  'TypeScript',
  'JavaScript',
  'Go',
  'C++',
  'C',
  'Java',
  'Kotlin',
  'Swift',
  'C#',
  'Ruby',
  'PHP',
  'Scala',
  'Elixir',
  'SQL',
  'Shell'
];

export type FailureTaxonomy = 
  | 'compilation_error'
  | 'dependency_error'
  | 'runtime_error'
  | 'test_failure'
  | 'timeout_deadlock'
  | 'resource_exhaustion'
  | 'security_violation'
  | 'memory_leak'
  | 'logic_flaw';

export type StepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped' | 'mitigated';

export interface HarnessStep {
  id: string;
  name: string;
  stage: 
    | 'planning' 
    | 'coding' 
    | 'tool_dispatch' 
    | 'sandbox_exec' 
    | 'test_run' 
    | 'failure_analysis' 
    | 'root_cause' 
    | 'patch_synthesis' 
    | 'retest' 
    | 'regression_suite' 
    | 'memory_indexing' 
    | 'policy_update';
  description: string;
  status: StepStatus;
  durationMs?: number;
  tokensUsed?: number;
  details?: {
    terminalOutput?: string;
    codeDiff?: string;
    astTrace?: string;
    rootCauseAnalysis?: string;
    confidenceScore?: number;
    failureCategory?: FailureTaxonomy;
    sandboxTelemetry?: {
      cpuQuotaUsedPercent: number;
      ramMbUsed: number;
      syscallsIntercepted: number;
      securityRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK';
      actionTaken: 'ALLOW' | 'RESTRICT' | 'REQUIRE_APPROVAL' | 'BLOCK';
    };
    regressionResults?: {
      reproPass: boolean;
      invariantPass: boolean;
      adversarialPass: boolean;
      performancePass: boolean;
    };
  };
}

export interface AegisBenchTask {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  language: Language;
  description: string;
  reproCommand: string;
  initialCode: string;
  failingTrace: string;
  expectedRootCause: string;
  fixedCode: string;
  patchDiff: string;
  regressionSuiteDescription: string;
  baselinePassRate: number;
  aegisPassRate: number;
  tokensAvg: number;
  latencySeconds: number;
}

export type BenchmarkTask = AegisBenchTask;

export interface FailureMemoryItem {
  id: string;
  taskTitle: string;
  language: Language;
  failureCategory: FailureTaxonomy;
  errorTrace: string;
  rootCause: string;
  fixDiff: string;
  regressionTestSummary: string;
  retrievalCount: number;
  similarityScore?: number;
  timestamp: string;
  tags: string[];
}

export interface SandboxConfig {
  cpuLimitPercent: number;
  ramLimitMb: number;
  timeoutSeconds: number;
  processLimit: number;
  syscallIsolation: 'strict_seccomp' | 'moderate_bpf' | 'permissive';
  networkPolicy: 'deny_all' | 'allow_dns_only' | 'allowlist_strictly' | 'open';
  readOnlyBaseFs: boolean;
  tmpWorkspaceOverlay: boolean;
  autoCleanup: boolean;
  riskPolicyThreshold: 'strict_approval' | 'auto_quarantine' | 'adaptive_block';
}

export interface CommandRiskAnalysis {
  command: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCK';
  action: 'ALLOW' | 'RESTRICT' | 'REQUIRE_APPROVAL' | 'BLOCK';
  reason: string;
  syscallRiskVector: string[];
  suggestedAction: string;
}

export interface AgentVersion {
  id: string;
  name: string;
  tag: string;
  solveRate: number;
  passAt1: number;
  passAt3: number;
  avgLatencySec: number;
  tokensAvg: number;
  costPerTask: number;
  totalFailures: number;
  status: 'STABLE' | 'IMPROVED' | 'EXPERIMENTAL' | 'DEPRECATED';
  improvementNotes: string;
  failureDistribution: {
    compilation: number;
    dependency: number;
    runtime: number;
    testFailure: number;
    timeout: number;
    resource: number;
    security: number;
    logicFlaw: number;
  };
}

export interface WorkerNode {
  id: string;
  name: string;
  engine: 'Python Sandbox' | 'Rust Native Super' | 'Isolated K8s Pod';
  status: 'IDLE' | 'EXECUTING' | 'SANDBOXING' | 'EVALUATING' | 'OFFLINE';
  cpuUsage: number;
  ramUsageMb: number;
  ramMaxMb: number;
  tasksProcessed: number;
  currentTaskTitle?: string;
  uptimeHours: number;
  errorRatePercent: number;
}

export interface FleetQueueState {
  pendingJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  throughputPerMin: number;
  avgQueueWaitMs: number;
}

export interface SelfImprovementExperiment {
  id: string;
  title: string;
  sourceFailurePattern: string;
  proposedPolicy: string;
  baselinePassRate: number;
  experimentalPassRate: number;
  deltaSolveRate: number;
  deltaLatency: number;
  status: 'PROMOTED' | 'EVALUATING' | 'REJECTED';
  date: string;
}
