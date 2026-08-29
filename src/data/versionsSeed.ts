import { AgentVersion, SelfImprovementExperiment } from '../types';

export const AGENT_VERSIONS: AgentVersion[] = [
  {
    id: 'v1',
    name: 'Vanilla Baseline Agent',
    tag: 'v1.0.0-legacy',
    solveRate: 54.2,
    passAt1: 42.1,
    passAt3: 61.5,
    avgLatencySec: 8.2,
    tokensAvg: 12400,
    costPerTask: 0.082,
    totalFailures: 46,
    status: 'DEPRECATED',
    improvementNotes: 'Single prompt loop without failure intelligence or regression synthesis. Frequent regressions on re-try.',
    failureDistribution: {
      compilation: 14,
      dependency: 6,
      runtime: 12,
      testFailure: 8,
      timeout: 3,
      resource: 1,
      security: 1,
      logicFlaw: 1,
    }
  },
  {
    id: 'v2',
    name: 'Multi-Agent Harness',
    tag: 'v2.1.0-harness',
    solveRate: 67.8,
    passAt1: 58.4,
    passAt3: 73.2,
    avgLatencySec: 7.1,
    tokensAvg: 10100,
    costPerTask: 0.061,
    totalFailures: 33,
    status: 'STABLE',
    improvementNotes: 'Added isolated planner, coding agent, and test runner with basic retry loop.',
    failureDistribution: {
      compilation: 7,
      dependency: 3,
      runtime: 9,
      testFailure: 6,
      timeout: 2,
      resource: 1,
      security: 2,
      logicFlaw: 3,
    }
  },
  {
    id: 'v3',
    name: 'AegisForge Core OS',
    tag: 'v3.0.0-failure-intel',
    solveRate: 78.4,
    passAt1: 71.6,
    passAt3: 84.8,
    avgLatencySec: 6.8,
    tokensAvg: 8900,
    costPerTask: 0.049,
    totalFailures: 21,
    status: 'STABLE',
    improvementNotes: 'Failure Intelligence Engine (Taxonomy Classifier + Root-Cause Agent + Patch Agent) + Adaptive Sandbox.',
    failureDistribution: {
      compilation: 2,
      dependency: 1,
      runtime: 4,
      testFailure: 4,
      timeout: 2,
      resource: 1,
      security: 1,
      logicFlaw: 6,
    }
  },
  {
    id: 'v3.2',
    name: 'AegisForge Self-Evolving',
    tag: 'v3.2.0-evolved-prod',
    solveRate: 88.6,
    passAt1: 82.3,
    passAt3: 94.1,
    avgLatencySec: 5.2,
    tokensAvg: 7200,
    costPerTask: 0.038,
    totalFailures: 11,
    status: 'IMPROVED',
    improvementNotes: 'Full Failure Memory retrieval graph + 4-Tier Automated Regression Lab + Rust native execution supervisor.',
    failureDistribution: {
      compilation: 0,
      dependency: 0,
      runtime: 2,
      testFailure: 2,
      timeout: 1,
      resource: 0,
      security: 0,
      logicFlaw: 6,
    }
  }
];

export const SELF_IMPROVEMENT_EXPERIMENTS: SelfImprovementExperiment[] = [
  {
    id: 'exp-001',
    title: 'AST Root-Cause Prompt Specialization for Concurrency Data Races',
    sourceFailurePattern: 'Frequent non-atomic get/check/update cycles under async coroutines (18 failures in v2)',
    proposedPolicy: 'Inject atomic Lua/transaction invariant constraints during Planning stage when redis/async keywords are detected.',
    baselinePassRate: 67.8,
    experimentalPassRate: 84.2,
    deltaSolveRate: 16.4,
    deltaLatency: -1.2,
    status: 'PROMOTED',
    date: '2026-08-27'
  },
  {
    id: 'exp-002',
    title: 'Adversarial Security Fuzzing Policy Gate before Patch Approval',
    sourceFailurePattern: 'Patches introduced subtle SSRF and DNS rebinding bypasses when fixing URL formatting (6 failures)',
    proposedPolicy: 'Mandate Tier-3 Adversarial Test execution against CIDR private ranges and DNS fast-rebind IP payloads.',
    baselinePassRate: 74.5,
    experimentalPassRate: 88.6,
    deltaSolveRate: 14.1,
    deltaLatency: 0.4,
    status: 'PROMOTED',
    date: '2026-08-28'
  },
  {
    id: 'exp-003',
    title: 'Zero-Copy RingBuffer Atomic Ordering Heuristics in Rust',
    sourceFailurePattern: 'Relaxed ordering panics during concurrent wraparound in Rust multithreading benchmarks',
    proposedPolicy: 'Automatically recommend CAS loop with AcqRel ordering and power-of-two bitwise masks for lock-free structures.',
    baselinePassRate: 78.0,
    experimentalPassRate: 91.5,
    deltaSolveRate: 13.5,
    deltaLatency: -0.8,
    status: 'PROMOTED',
    date: '2026-08-28'
  }
];
