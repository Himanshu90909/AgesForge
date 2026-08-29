import { WorkerNode, FleetQueueState } from '../types';

export const INITIAL_WORKER_NODES: WorkerNode[] = [
  {
    id: 'worker-node-01',
    name: 'aegis-worker-rust-01',
    engine: 'Rust Native Super',
    status: 'EXECUTING',
    cpuUsage: 42.5,
    ramUsageMb: 248,
    ramMaxMb: 2048,
    tasksProcessed: 148,
    currentTaskTitle: 'Fix Race Condition in Async Redis Token-Bucket',
    uptimeHours: 36.4,
    errorRatePercent: 0.02
  },
  {
    id: 'worker-node-02',
    name: 'aegis-worker-rust-02',
    engine: 'Rust Native Super',
    status: 'SANDBOXING',
    cpuUsage: 78.1,
    ramUsageMb: 512,
    ramMaxMb: 2048,
    tasksProcessed: 219,
    currentTaskTitle: 'Zero-Copy RingBuffer ThreadSanitizer Run',
    uptimeHours: 36.4,
    errorRatePercent: 0.01
  },
  {
    id: 'worker-node-03',
    name: 'aegis-worker-py-01',
    engine: 'Python Sandbox',
    status: 'EVALUATING',
    cpuUsage: 31.4,
    ramUsageMb: 380,
    ramMaxMb: 4096,
    tasksProcessed: 185,
    currentTaskTitle: '4-Tier Regression Suite Execution',
    uptimeHours: 24.1,
    errorRatePercent: 0.05
  },
  {
    id: 'worker-node-04',
    name: 'aegis-worker-py-02',
    engine: 'Python Sandbox',
    status: 'IDLE',
    cpuUsage: 4.2,
    ramUsageMb: 124,
    ramMaxMb: 4096,
    tasksProcessed: 162,
    uptimeHours: 24.1,
    errorRatePercent: 0.04
  },
  {
    id: 'worker-node-05',
    name: 'aegis-k8s-isolate-01',
    engine: 'Isolated K8s Pod',
    status: 'EXECUTING',
    cpuUsage: 64.9,
    ramUsageMb: 610,
    ramMaxMb: 4096,
    tasksProcessed: 310,
    currentTaskTitle: 'SSRF DNS Rebinding Adversarial Fuzzer',
    uptimeHours: 72.8,
    errorRatePercent: 0.00
  }
];

export const INITIAL_FLEET_QUEUE: FleetQueueState = {
  pendingJobs: 14,
  activeJobs: 3,
  completedJobs: 1024,
  failedJobs: 23,
  throughputPerMin: 48.6,
  avgQueueWaitMs: 34.2
};
