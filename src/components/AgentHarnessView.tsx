import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { AEGIS_BENCH_TASKS } from '../data/benchmarks';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  StepForward, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  FileDiff, 
  Cpu, 
  ShieldCheck, 
  Layers, 
  BrainCircuit, 
  ArrowRight
} from 'lucide-react';

export const AgentHarnessView: React.FC = () => {
  const {
    activeTask,
    setActiveTask,
    steps,
    currentStepIndex,
    isRunning,
    isPaused,
    runHarness,
    pauseHarness,
    resumeHarness,
    stepForward,
    resetHarness,
    playbackSpeed,
    setPlaybackSpeed,
    terminalLogs,
    setActiveTab
  } = useAegis();

  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'diff' | 'ast' | 'regression'>('diff');

  return (
    <div className="space-y-4">
      {/* Top Banner: Task Switcher & Control Panel */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono tracking-widest uppercase">
              <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold">
                01_ORCHESTRATION_HARNESS
              </span>
              <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
                LANG: {activeTask.language}
              </span>
              <span className="px-2 py-0.5 bg-[#18181B] border border-[#27272A] text-[#71717A]">
                CATEGORY: {activeTask.category}
              </span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {activeTask.title}
            </h2>
            <p className="text-xs text-[#71717A]">
              {activeTask.description}
            </p>
          </div>

          {/* Execution Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            {/* Task dropdown selector */}
            <select
              id="select-benchmark-task"
              value={activeTask.id}
              onChange={(e) => {
                const found = AEGIS_BENCH_TASKS.find(t => t.id === e.target.value);
                if (found) setActiveTask(found);
              }}
              disabled={isRunning}
              aria-label="Select benchmark task"
              className="bg-[#18181B] border border-[#27272A] text-[#E4E4E7] text-xs px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {AEGIS_BENCH_TASKS.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.difficulty}] {t.title}
                </option>
              ))}
            </select>

            {/* Speed Controller */}
            <div className="flex items-center bg-[#18181B] border border-[#27272A] text-xs font-mono">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 text-[10px] font-mono transition ${
                    playbackSpeed === speed
                      ? 'bg-cyan-500 text-black font-bold'
                      : 'text-[#71717A] hover:text-[#E4E4E7]'
                  }`}
                >
                  {speed}X
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            {!isRunning ? (
              <button
                id="btn-play-harness"
                onClick={() => runHarness()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-cyan-500 text-[10px] font-mono uppercase tracking-widest font-bold transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Start Harness Loop</span>
              </button>
            ) : isPaused ? (
              <button
                id="btn-resume-harness"
                onClick={resumeHarness}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-black text-[10px] font-mono uppercase tracking-widest font-bold transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                id="btn-pause-harness"
                onClick={pauseHarness}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#18181B] hover:bg-[#27272A] text-white text-[10px] font-mono uppercase tracking-widest font-bold border border-[#27272A] transition cursor-pointer"
              >
                <Pause className="w-3 h-3" />
                <span>Pause</span>
              </button>
            )}

            {/* Step Forward */}
            <button
              id="btn-step-forward"
              onClick={stepForward}
              disabled={isRunning && !isPaused}
              className="p-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white disabled:opacity-30 transition cursor-pointer"
              title="Execute Single Step Next"
            >
              <StepForward className="w-3.5 h-3.5" />
            </button>

            {/* Reset */}
            <button
              id="btn-reset-main"
              onClick={resetHarness}
              className="p-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition cursor-pointer"
              title="Reset Execution State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Execution DAG: Multi-Layer Agent Harness Flow */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex items-center justify-between mb-3 border-b border-[#27272A] pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="text-[10px] font-bold font-mono uppercase tracking-widest text-[#71717A]">
              AUTONOMOUS EXECUTION DAG // 10-STAGE PIPELINE
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#71717A]">
            {currentStepIndex >= 0 ? `ACTIVE_STAGE: [0${currentStepIndex + 1}/10]` : 'STATUS: IDLE'}
          </span>
        </div>

        {/* Step Nodes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {steps.map((step, idx) => {
            const isCurrent = currentStepIndex === idx;
            const isDone = step.status === 'success';
            const isExecuting = step.status === 'running';

            return (
              <div
                key={step.id}
                className={`p-2.5 border transition-all ${
                  isCurrent || isExecuting
                    ? 'bg-cyan-500/10 border-cyan-500/80 text-white'
                    : isDone
                    ? 'bg-[#18181B] border-[#27272A] text-[#E4E4E7]'
                    : 'bg-[#09090B] border-[#27272A] text-[#52525B]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-mono font-bold px-1 py-0.2 ${
                    isDone 
                      ? 'bg-green-500 text-black'
                      : isExecuting
                      ? 'bg-cyan-500 text-black animate-pulse'
                      : 'bg-[#27272A] text-[#71717A]'
                  }`}>
                    {idx + 1}. {step.stage.replace('_', ' ').toUpperCase()}
                  </span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                  {isExecuting && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>

                <h4 className="text-[11px] font-semibold text-white truncate">
                  {step.name}
                </h4>
                <p className="text-[10px] text-[#71717A] mt-1 line-clamp-2 leading-tight font-mono">
                  {step.description}
                </p>

                {step.durationMs && (
                  <div className="mt-2 pt-1 border-t border-[#27272A] flex items-center justify-between text-[9px] font-mono text-[#71717A]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      {step.durationMs}ms
                    </span>
                    {step.tokensUsed && (
                      <span>
                        {step.tokensUsed} tok
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split-Workspace: Code Diff / Live Terminal / AST State */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 7 Columns: Interactive Workspace Views */}
        <div className="lg:col-span-7 bg-[#0C0C0E] border border-[#27272A] flex flex-col">
          {/* Sub-tabs header */}
          <div className="flex items-center justify-between border-b border-[#27272A] bg-[#09090B] px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                id="tab-btn-diff"
                onClick={() => setActiveSubTab('diff')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  activeSubTab === 'diff'
                    ? 'bg-[#18181B] text-cyan-400 border border-[#27272A] font-bold'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                <FileDiff className="w-3 h-3 text-cyan-400" />
                <span>Unified Patch Diff</span>
              </button>

              <button
                id="tab-btn-terminal"
                onClick={() => setActiveSubTab('terminal')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  activeSubTab === 'terminal'
                    ? 'bg-[#18181B] text-cyan-400 border border-[#27272A] font-bold'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                <Terminal className="w-3 h-3 text-green-400" />
                <span>Live Terminal Stream</span>
              </button>

              <button
                id="tab-btn-ast"
                onClick={() => setActiveSubTab('ast')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  activeSubTab === 'ast'
                    ? 'bg-[#18181B] text-cyan-400 border border-[#27272A] font-bold'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                <BrainCircuit className="w-3 h-3 text-purple-400" />
                <span>AST & State Dump</span>
              </button>

              <button
                id="tab-btn-regression"
                onClick={() => setActiveSubTab('regression')}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer ${
                  activeSubTab === 'regression'
                    ? 'bg-[#18181B] text-cyan-400 border border-[#27272A] font-bold'
                    : 'text-[#71717A] hover:text-[#E4E4E7]'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>4-Tier Matrix</span>
              </button>
            </div>

            <span className="text-[9px] font-mono text-[#52525B] hidden sm:inline">
              WORKSPACE: /SANDBOX/OVERLAY/SRC
            </span>
          </div>

          {/* View Content */}
          <div className="p-4 min-h-[380px] max-h-[460px] overflow-y-auto font-mono text-xs bg-black text-[#E4E4E7]">
            {activeSubTab === 'diff' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-[#71717A] font-mono uppercase pb-2 border-b border-[#27272A]">
                  <span className="text-[#A1A1AA]">FILE: src/implementation.{activeTask.language === 'Python' ? 'py' : activeTask.language === 'Rust' ? 'rs' : 'ts'}</span>
                  <span className="text-green-400 font-semibold">ZERO_REGRESSION_VERIFIED</span>
                </div>
                <div className="bg-[#0C0C0E] p-3 border border-[#27272A] space-y-1 whitespace-pre-wrap leading-relaxed overflow-x-auto text-[11px]">
                  {currentStepIndex >= 6 ? (
                    <div>
                      <div className="text-[#71717A] pb-2 font-bold">// APPLIED INVARIANT PATCH (UNIFIED DIFF):</div>
                      <div className="text-green-400 bg-green-950/20 p-2 border border-green-900/40">
                        {activeTask.patchDiff}
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#27272A] text-[#E4E4E7]">
                        <div className="text-[#71717A] font-bold mb-1">// COMPLETE RESOLVED IMPLEMENTATION:</div>
                        <div className="text-cyan-200">
                          {activeTask.fixedCode}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-amber-400 pb-2 font-bold">// CURRENT FAULTY IMPLEMENTATION:</div>
                      <div className="text-[#A1A1AA]">
                        {activeTask.initialCode}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === 'terminal' && (
              <div className="space-y-1 font-mono text-[11px] leading-relaxed">
                {terminalLogs.map((log, i) => (
                  <div key={i}>
                    {log.startsWith('>>>') ? (
                      <span className="text-cyan-400 font-bold">{log}</span>
                    ) : log.includes('PASS') || log.includes('passed') ? (
                      <span className="text-green-400 font-semibold">{log}</span>
                    ) : log.includes('Error') || log.includes('AssertionError') || log.includes('panicked') ? (
                      <span className="text-red-400 font-semibold">{log}</span>
                    ) : (
                      <span className="text-[#71717A]">{log}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeSubTab === 'ast' && (
              <div className="space-y-3 font-mono">
                <div className="text-white text-xs font-bold border-b border-[#27272A] pb-2 flex items-center justify-between">
                  <span>AST_CAUSAL_ANALYSIS & STATE_DUMP</span>
                  <span className="text-purple-400 text-[10px]">SPEC: AST_3.2_STRICT</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#0C0C0E] border border-[#27272A] space-y-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Failure Invariant:</span>
                    <p className="text-red-400 text-[11px]">{activeTask.failingTrace.slice(0, 140)}...</p>
                  </div>
                  <div className="p-3 bg-[#0C0C0E] border border-[#27272A] space-y-1">
                    <span className="text-[10px] text-[#71717A] uppercase font-bold">Root Cause Causal Link:</span>
                    <p className="text-amber-400 text-[11px]">{activeTask.expectedRootCause}</p>
                  </div>
                </div>
                <div className="p-3 bg-[#0C0C0E] border border-[#27272A]">
                  <span className="text-[10px] text-[#71717A] uppercase font-bold block mb-1">Sandbox Execution Boundary:</span>
                  <div className="text-[#A1A1AA] text-[10px] space-y-0.5">
                    <div>• Process Isolation: PID Namespace, Mount Namespace (OverlayFS)</div>
                    <div>• Syscall Policy: seccomp_bpf active (36 allowed, 0 egress)</div>
                    <div>• Memory Quota: 512MB Cgroup ceiling (Peak: 148MB)</div>
                    <div>• Rust Supervisor Exit Code: {currentStepIndex >= 7 ? '0 (CLEAN_EXIT)' : '1 (INVARIANT_ASSERTION_FAIL)'}</div>
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'regression' && (
              <div className="space-y-3 font-mono">
                <div className="text-white text-xs font-bold border-b border-[#27272A] pb-2 flex items-center justify-between">
                  <span>4-TIER AUTOMATED REGRESSION GATE</span>
                  <span className="text-green-400 text-[10px] font-semibold">
                    {currentStepIndex >= 8 ? '4 / 4 TIERS VERIFIED' : 'AWAITING VALIDATION'}
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { tier: '01_ORIGINAL_REPRO_TEST', desc: 'Replay original reproducing failing trace to verify fix.', status: currentStepIndex >= 8 ? 'PASS' : 'PENDING' },
                    { tier: '02_INVARIANT_BOUNDARY_TEST', desc: 'Test zero-capacity, integer wraparound, and concurrency thresholds.', status: currentStepIndex >= 8 ? 'PASS' : 'PENDING' },
                    { tier: '03_ADVERSARIAL_SECURITY_TEST', desc: 'Fuzz against SSRF payloads, clock skew, and race conditions.', status: currentStepIndex >= 8 ? 'PASS' : 'PENDING' },
                    { tier: '04_STRESS_MEMORY_LEAK_TEST', desc: 'Execute 10,000 throughput iterations verifying 0 RSS growth.', status: currentStepIndex >= 8 ? 'PASS' : 'PENDING' },
                  ].map((t, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-[#0C0C0E] border border-[#27272A]">
                      <div>
                        <span className="font-bold text-white text-xs">{t.tier}</span>
                        <p className="text-[10px] text-[#71717A]">{t.desc}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono ${
                        t.status === 'PASS'
                          ? 'bg-green-500 text-black'
                          : 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Failure Intelligence & Root-Cause Summary */}
        <div className="lg:col-span-5 space-y-4">
          {/* Failure Intelligence Card */}
          <div className="bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono">
                  FAILURE_INTELLIGENCE_ENGINE
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('failure_intel')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
              >
                <span>Deep View</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 bg-[#18181B] border border-[#27272A] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] uppercase">Taxonomy:</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
                  {activeTask.category.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] uppercase">Confidence:</span>
                <span className="text-[10px] text-green-400 font-bold">98.4% Match</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] uppercase">Memory Retrieval:</span>
                <span className="text-[10px] text-cyan-300">1 Incident Found</span>
              </div>
            </div>

            <div className="p-3 bg-[#18181B] border border-[#27272A] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block">Root-Cause Hypothesis:</span>
              <p className="text-xs text-[#E4E4E7] leading-relaxed">
                {activeTask.expectedRootCause}
              </p>
            </div>
          </div>

          {/* Performance & Safety Stats */}
          <div className="bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2 border-b border-[#27272A] pb-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>EXECUTION & BENCHMARK METRICS</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-3 bg-[#18181B] border border-[#27272A]">
                <span className="text-[9px] text-[#71717A] uppercase tracking-wider block mb-1">Baseline Pass</span>
                <span className="text-2xl font-light text-red-400">
                  {activeTask.baselinePassRate}<span className="text-xs text-[#71717A]">%</span>
                </span>
              </div>
              <div className="p-3 bg-[#18181B] border border-cyan-500/40">
                <span className="text-[9px] text-cyan-400 uppercase tracking-wider block mb-1">Aegis Pass Rate</span>
                <span className="text-2xl font-light text-white">
                  {activeTask.aegisPassRate}<span className="text-xs text-cyan-400">%</span>
                </span>
              </div>
              <div className="p-3 bg-[#18181B] border border-[#27272A]">
                <span className="text-[9px] text-[#71717A] uppercase tracking-wider block mb-1">Token Quota</span>
                <span className="text-sm font-medium text-[#E4E4E7]">
                  ~{activeTask.tokensAvg} tok
                </span>
              </div>
              <div className="p-3 bg-[#18181B] border border-[#27272A]">
                <span className="text-[9px] text-[#71717A] uppercase tracking-wider block mb-1">Avg Latency</span>
                <span className="text-sm font-medium text-cyan-400">
                  {activeTask.latencySeconds}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
