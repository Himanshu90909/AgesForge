import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AegisBenchTask,
  HarnessStep,
  SandboxConfig,
  CommandRiskAnalysis,
  FailureMemoryItem,
  WorkerNode,
  FleetQueueState,
  AgentVersion,
  SelfImprovementExperiment,
  FailureTaxonomy
} from '../types';
import { AEGIS_BENCH_TASKS } from '../data/benchmarks';
import { INITIAL_FAILURE_MEMORIES } from '../data/failureMemorySeed';
import { AGENT_VERSIONS, SELF_IMPROVEMENT_EXPERIMENTS } from '../data/versionsSeed';
import { INITIAL_WORKER_NODES, INITIAL_FLEET_QUEUE } from '../data/fleetWorkersSeed';
import { DEFAULT_SANDBOX_CONFIG, evaluateCommandRisk } from '../utils/sandboxEngine';
import confetti from 'canvas-confetti';

export type ActiveTab = 
  | 'harness'
  | 'failure_intel'
  | 'sandbox'
  | 'rust_engine'
  | 'performance_lab'
  | 'episodic_memory'
  | 'regression_lab'
  | 'self_improvement'
  | 'distributed_fleet'
  | 'benchmark_suite';

interface AegisContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeTask: AegisBenchTask;
  setActiveTask: (task: AegisBenchTask) => void;
  steps: HarnessStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  executionMode: 'fast' | 'live_gemini' | 'step_by_step';
  setExecutionMode: (mode: 'fast' | 'live_gemini' | 'step_by_step') => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  runHarness: (task?: AegisBenchTask) => Promise<void>;
  pauseHarness: () => void;
  resumeHarness: () => void;
  stepForward: () => void;
  resetHarness: () => void;
  terminalLogs: string[];
  geminiLiveEnabled: boolean;
  
  // Sandbox State
  sandboxConfig: SandboxConfig;
  setSandboxConfig: React.Dispatch<React.SetStateAction<SandboxConfig>>;
  commandHistory: CommandRiskAnalysis[];
  testCommand: (cmd: string) => CommandRiskAnalysis;
  
  // Memory State
  memoryItems: FailureMemoryItem[];
  searchMemory: (query: string) => FailureMemoryItem[];
  addMemoryRecord: (item: FailureMemoryItem) => void;
  
  // Fleet State
  workerNodes: WorkerNode[];
  fleetQueue: FleetQueueState;
  
  // Performance & Versions
  agentVersions: AgentVersion[];
  selectedVersionId: string;
  setSelectedVersionId: (id: string) => void;
  ablationSettings: {
    failureMemory: boolean;
    seccompSyscall: boolean;
    regressionGate: boolean;
    taskPlanner: boolean;
  };
  setAblationSettings: React.Dispatch<React.SetStateAction<{
    failureMemory: boolean;
    seccompSyscall: boolean;
    regressionGate: boolean;
    taskPlanner: boolean;
  }>>;
  experiments: SelfImprovementExperiment[];
  
  // Modals
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  isResumeModalOpen: boolean;
  setIsResumeModalOpen: (open: boolean) => void;
}

const AegisContext = createContext<AegisContextType | undefined>(undefined);

export const AegisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('harness');
  const [activeTask, setActiveTask] = useState<AegisBenchTask>(AEGIS_BENCH_TASKS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [executionMode, setExecutionMode] = useState<'fast' | 'live_gemini' | 'step_by_step'>('fast');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [geminiLiveEnabled, setGeminiLiveEnabled] = useState<boolean>(false);

  const [sandboxConfig, setSandboxConfig] = useState<SandboxConfig>(DEFAULT_SANDBOX_CONFIG);
  const [commandHistory, setCommandHistory] = useState<CommandRiskAnalysis[]>([
    evaluateCommandRisk('pytest tests/test_rate_limiter.py -n 4'),
    evaluateCommandRisk('pip install --upgrade redis-py'),
    evaluateCommandRisk('curl -s http://169.254.169.254/latest/meta-data/')
  ]);

  const [memoryItems, setMemoryItems] = useState<FailureMemoryItem[]>(INITIAL_FAILURE_MEMORIES);
  const [workerNodes, setWorkerNodes] = useState<WorkerNode[]>(INITIAL_WORKER_NODES);
  const [fleetQueue, setFleetQueue] = useState<FleetQueueState>(INITIAL_FLEET_QUEUE);
  const [agentVersions] = useState<AgentVersion[]>(AGENT_VERSIONS);
  const [selectedVersionId, setSelectedVersionId] = useState<string>('v3.2');
  const [experiments] = useState<SelfImprovementExperiment[]>(SELF_IMPROVEMENT_EXPERIMENTS);

  const [ablationSettings, setAblationSettings] = useState({
    failureMemory: true,
    seccompSyscall: true,
    regressionGate: true,
    taskPlanner: true
  });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);

  // Check health on load
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.geminiEnabled) {
          setGeminiLiveEnabled(true);
        }
      })
      .catch(() => {});
  }, []);

  const createInitialSteps = useCallback((task: AegisBenchTask): HarnessStep[] => {
    return [
      {
        id: 'step-1',
        name: 'Task Planning & Requirement Invariants',
        stage: 'planning',
        description: `Analyze task "${task.title}", decompose dependencies, and establish safety invariant test bounds.`,
        status: 'pending',
        details: {
          terminalOutput: `[Aegis-Planner] Parsing task definition...\n[Aegis-Planner] Target Language: ${task.language} | Category: ${task.category}\n[Aegis-Planner] Establishing Sandbox constraints: 512MB RAM, strict seccomp-bpf profile`,
        }
      },
      {
        id: 'step-2',
        name: 'Initial Code Generation & Tool Dispatch',
        stage: 'coding',
        description: 'Synthesize candidate implementation and dispatch file operations into temporary overlay workspace.',
        status: 'pending',
        details: {
          terminalOutput: `[ToolController] Writing src/module.${task.language === 'Python' ? 'py' : task.language === 'Rust' ? 'rs' : 'ts'}\n[ToolController] Applying base file structure...`,
          codeDiff: task.initialCode
        }
      },
      {
        id: 'step-3',
        name: 'Adaptive Sandbox Execution (Rust Supervisor)',
        stage: 'sandbox_exec',
        description: 'Execute compiled binaries and scripts inside isolated namespace with eBPF syscall telemetry.',
        status: 'pending',
        details: {
          terminalOutput: `[aegis-exec/rust] Spawning supervisor process PID 4820...\n[aegis-exec/rust] Cgroups v2 applied: cpu.max=80000/100000, memory.max=536870912\n[aegis-exec/rust] Seccomp filter active: 48 allowed syscalls, 0 network egress`,
          sandboxTelemetry: {
            cpuQuotaUsedPercent: 34.2,
            ramMbUsed: 128.4,
            syscallsIntercepted: 1420,
            securityRisk: 'LOW',
            actionTaken: 'ALLOW'
          }
        }
      },
      {
        id: 'step-4',
        name: 'Test Execution & Diagnostic Capture',
        stage: 'test_run',
        description: 'Run reproducing test suite against candidate code to verify correctness.',
        status: 'pending',
        details: {
          terminalOutput: `$ ${task.reproCommand}\n\n${task.failingTrace}`,
        }
      },
      {
        id: 'step-5',
        name: 'Failure Intelligence Taxonomy Classification',
        stage: 'failure_analysis',
        description: 'Classify failure taxonomy, parse AST backtrace, and query Episodic Failure Memory graph.',
        status: 'pending',
        details: {
          failureCategory: task.category === 'concurrency_race' ? 'logic_flaw' : task.category === 'security_hardening' ? 'security_violation' : 'runtime_error',
          terminalOutput: `[FailureEngine] Classifying error trace...\n[FailureEngine] Taxonomy Match: ${task.category.toUpperCase()}\n[FailureEngine] AST Node Identification: Complete\n[Memory] Querying episodic failure database... Found high-affinity pattern (Score: 0.98)`,
          astTrace: `AST Location: ${task.title.slice(0, 35)}\nSeverity: HIGH | Reproducibility: 100% | Taxonomy: ${task.category}`,
          confidenceScore: 0.97
        }
      },
      {
        id: 'step-6',
        name: 'Root Cause Hypothesis & Verification',
        stage: 'root_cause',
        description: 'Formulate causal hypothesis and verify invariant breakage mechanism.',
        status: 'pending',
        details: {
          rootCauseAnalysis: task.expectedRootCause,
          terminalOutput: `[RootCauseAgent] Hypothesis verified with high confidence (0.97).\n[RootCauseAgent] Causal chain: ${task.expectedRootCause.slice(0, 100)}...`,
          confidenceScore: 0.98
        }
      },
      {
        id: 'step-7',
        name: 'Targeted Patch Synthesis & Invariant Proof',
        stage: 'patch_synthesis',
        description: 'Synthesize minimal, zero-regression patch and apply unified diff to workspace files.',
        status: 'pending',
        details: {
          codeDiff: task.patchDiff,
          terminalOutput: `[PatchAgent] Synthesizing unified patch...\n[PatchAgent] AST verification passed (0 syntax/type errors).\n[PatchAgent] Applying patch to workspace...`,
        }
      },
      {
        id: 'step-8',
        name: 'Sandbox Re-Execution & Validation',
        stage: 'retest',
        description: 'Re-run initial test suite against patched implementation inside Rust execution sandbox.',
        status: 'pending',
        details: {
          terminalOutput: `$ ${task.reproCommand}\n\n========================= 1 passed in 0.42s =========================\n[aegis-exec/rust] Process completed with exit code 0. No memory leaks detected.`,
        }
      },
      {
        id: 'step-9',
        name: '4-Tier Automated Regression Laboratory',
        stage: 'regression_suite',
        description: 'Synthesize & run 4-tier suite: Repro Test, Invariant Boundary, Adversarial Security, and Stress Benchmark.',
        status: 'pending',
        details: {
          terminalOutput: `[RegressionLab] Running 4-tier validation suite...\n✓ Tier 1 (Repro Target): PASS (0.12s)\n✓ Tier 2 (Invariant Boundary): PASS (0.24s)\n✓ Tier 3 (Adversarial Security): PASS (0.48s)\n✓ Tier 4 (Stress & Memory Leak): PASS (0.85s)\n\n[RegressionLab] 4/4 TIERS PASSED. Zero regressions detected!`,
          regressionResults: {
            reproPass: true,
            invariantPass: true,
            adversarialPass: true,
            performancePass: true
          }
        }
      },
      {
        id: 'step-10',
        name: 'Episodic Failure Memory Indexing & Policy Evolution',
        stage: 'memory_indexing',
        description: 'Index failure trace, root cause, and successful patch into Experience Graph; update prompt/tool heuristics.',
        status: 'pending',
        details: {
          terminalOutput: `[MemoryGraph] Ingesting experience signature into vector graph...\n[MemoryGraph] Memory node created: mem-${Date.now().toString().slice(-4)}\n[PolicyEngine] Strategy heuristic reinforced. Overall solve rate updated to 88.6%.`,
        }
      }
    ];
  }, []);

  const [steps, setSteps] = useState<HarnessStep[]>(() => createInitialSteps(AEGIS_BENCH_TASKS[0]));

  // Reset steps when task changes
  useEffect(() => {
    setSteps(createInitialSteps(activeTask));
    setCurrentStepIndex(-1);
    setIsRunning(false);
    setIsPaused(false);
    setTerminalLogs([
      `[AegisForge Core OS v3.2.0-evolved initialized]`,
      `[Workspace] Ready. Selected Task: ${activeTask.title}`,
      `[Supervisor] Rust Execution Engine status: ACTIVE | cgroups v2 enabled`,
      `[Memory Graph] 5 indexed episodic failure nodes loaded.`
    ]);
  }, [activeTask, createInitialSteps]);

  const stepTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const executeStep = useCallback((stepIdx: number) => {
    setSteps(prev => prev.map((s, idx) => {
      if (idx === stepIdx) {
        return { ...s, status: 'running', durationMs: undefined };
      }
      return s;
    }));

    const step = steps[stepIdx] || createInitialSteps(activeTask)[stepIdx];
    if (step && step.details?.terminalOutput) {
      setTerminalLogs(prev => [
        ...prev,
        `>>> STEP [${stepIdx + 1}/10]: ${step.name}`,
        step.details?.terminalOutput || ''
      ]);
    }
  }, [steps, activeTask, createInitialSteps]);

  const completeStep = useCallback((stepIdx: number) => {
    setSteps(prev => prev.map((s, idx) => {
      if (idx === stepIdx) {
        return {
          ...s,
          status: 'success',
          durationMs: Math.floor(250 + Math.random() * 400),
          tokensUsed: Math.floor(400 + Math.random() * 800)
        };
      }
      return s;
    }));

    if (stepIdx === 9) {
      // Completed full cycle! Trigger celebration confetti!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTerminalLogs(prev => [
        ...prev,
        `\n[AEGISFORGE HARNESS] Task "${activeTask.title}" fully resolved with zero regressions!`,
        `[STATUS: PASS] All 10 execution layers verified.`
      ]);
      setIsRunning(false);
    }
  }, [activeTask]);

  const runHarness = async (taskToRun?: AegisBenchTask) => {
    const task = taskToRun || activeTask;
    if (taskToRun && taskToRun.id !== activeTask.id) {
      setActiveTask(taskToRun);
    }
    setIsRunning(true);
    setIsPaused(false);
    setTerminalLogs([
      `[AegisForge Core OS] Initiating multi-layer execution loop for: ${task.title}...`,
      `[Configuration] Engine: Rust aegis-exec | Sandbox: seccomp-bpf | Memory Graph: Active`
    ]);

    // Iterate through all 10 steps
    for (let i = 0; i < 10; i++) {
      setCurrentStepIndex(i);
      executeStep(i);

      // Delay based on playback speed
      const baseDelay = executionMode === 'fast' ? 700 : 1500;
      const delay = Math.max(150, baseDelay / playbackSpeed);

      await new Promise(resolve => {
        stepTimeoutRef.current = setTimeout(resolve, delay);
      });

      completeStep(i);
    }
  };

  const pauseHarness = () => {
    setIsPaused(true);
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
  };

  const resumeHarness = () => {
    setIsPaused(false);
    // Continue from next step
    if (currentStepIndex < 9) {
      runHarness();
    }
  };

  const stepForward = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < 10) {
      setCurrentStepIndex(nextIdx);
      executeStep(nextIdx);
      setTimeout(() => {
        completeStep(nextIdx);
      }, 300);
    }
  };

  const resetHarness = () => {
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setSteps(createInitialSteps(activeTask));
    setTerminalLogs([`[AegisForge] Harness state reset.`]);
  };

  const testCommand = (cmd: string): CommandRiskAnalysis => {
    const result = evaluateCommandRisk(cmd);
    setCommandHistory(prev => [result, ...prev.slice(0, 19)]);
    setTerminalLogs(prev => [
      ...prev,
      `[Sandbox Risk Guard] Command: "${cmd}" -> RISK: ${result.riskLevel} | ACTION: ${result.action}`,
      `[Reason] ${result.reason}`
    ]);
    return result;
  };

  const searchMemory = (query: string): FailureMemoryItem[] => {
    if (!query.trim()) return memoryItems;
    const q = query.toLowerCase();
    return memoryItems.filter(item => 
      item.taskTitle.toLowerCase().includes(q) ||
      item.rootCause.toLowerCase().includes(q) ||
      item.failureCategory.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  };

  const addMemoryRecord = (item: FailureMemoryItem) => {
    setMemoryItems(prev => [item, ...prev]);
  };

  return (
    <AegisContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeTask,
        setActiveTask,
        steps,
        currentStepIndex,
        isRunning,
        isPaused,
        executionMode,
        setExecutionMode,
        playbackSpeed,
        setPlaybackSpeed,
        runHarness,
        pauseHarness,
        resumeHarness,
        stepForward,
        resetHarness,
        terminalLogs,
        geminiLiveEnabled,
        sandboxConfig,
        setSandboxConfig,
        commandHistory,
        testCommand,
        memoryItems,
        searchMemory,
        addMemoryRecord,
        workerNodes,
        fleetQueue,
        agentVersions,
        selectedVersionId,
        setSelectedVersionId,
        ablationSettings,
        setAblationSettings,
        experiments,
        isTaskModalOpen,
        setIsTaskModalOpen,
        isResumeModalOpen,
        setIsResumeModalOpen
      }}
    >
      {children}
    </AegisContext.Provider>
  );
};

export const useAegis = () => {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error('useAegis must be used within an AegisProvider');
  }
  return context;
};
