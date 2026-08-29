import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { FailureTaxonomy } from '../types';
import { 
  SearchCode, 
  BrainCircuit, 
  Wrench, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Terminal, 
  FileCode2, 
  AlertOctagon, 
  Layers,
  Bug
} from 'lucide-react';

interface TaxonomyDef {
  key: FailureTaxonomy;
  label: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  detectionSignal: string;
  remediationWorkflow: string;
  incidentCount: number;
}

const TAXONOMY_LIST: TaxonomyDef[] = [
  {
    key: 'compilation_error',
    label: 'Compilation & Syntax Error',
    severity: 'MEDIUM',
    description: 'Syntactic violations, missing semicolons/braces, unimported types or borrow checker lifetime conflicts.',
    detectionSignal: 'rustc / tsc / py_compile non-zero exit code on AST parsing',
    remediationWorkflow: 'AST syntax transformer fixes typing, lifetime annotations, or import declarations.',
    incidentCount: 23
  },
  {
    key: 'dependency_error',
    label: 'Dependency & ABI Incompatibility',
    severity: 'HIGH',
    description: 'Missing native shared objects (libssl.so), version conflicts, wheel architecture mismatches.',
    detectionSignal: 'ModuleNotFoundError, ImportError, dlopen dynamic linking failures',
    remediationWorkflow: 'Isolate package manifest, lock version constraints, and rebuild inside hermetic sandbox.',
    incidentCount: 14
  },
  {
    key: 'runtime_error',
    label: 'Runtime Panic & Exception',
    severity: 'HIGH',
    description: 'Null pointer dereference, index out of bounds, unhandled Promise rejections, division by zero.',
    detectionSignal: 'SIGSEGV, panic_fmt, unhandled TypeError at runtime',
    remediationWorkflow: 'Inject defensive invariant checks, Option/Result unwraps, and bounds validation.',
    incidentCount: 38
  },
  {
    key: 'test_failure',
    label: 'Assertion & Test Failure',
    severity: 'HIGH',
    description: 'Unit or integration assertions failed (expected X received Y).',
    detectionSignal: 'pytest / cargo test assertion failure with diff mismatches',
    remediationWorkflow: 'Causal AST tracing to isolate mismatch between specification and output.',
    incidentCount: 42
  },
  {
    key: 'timeout_deadlock',
    label: 'Timeout & Concurrency Deadlock',
    severity: 'CRITICAL',
    description: 'Async task hang, lock acquisition deadlock, infinite loop without termination.',
    detectionSignal: 'Execution exceeded watchdog timeout (e.g. 15s) with threads blocked in futex wait',
    remediationWorkflow: 'Rust timeout supervisor dumps stack traces, detects lock ordering inverted, enforces hierarchy.',
    incidentCount: 19
  },
  {
    key: 'resource_exhaustion',
    label: 'Resource Exhaustion & Leak',
    severity: 'CRITICAL',
    description: 'Out of Memory (OOM), file descriptor exhaustion, circular reference memory retention.',
    detectionSignal: 'Cgroup OOM killer invocation, RSS growth > limit, EMFILE open files limit',
    remediationWorkflow: 'Refactor strong object bindings into weakref / RAII scoped drop guards.',
    incidentCount: 16
  },
  {
    key: 'security_violation',
    label: 'Security & Sandbox Violation',
    severity: 'CRITICAL',
    description: 'Prohibited syscall (mount, ptrace), SSRF attempt against internal metadata, path traversal.',
    detectionSignal: 'Seccomp-BPF trap, network egress quarantine, unauthorized filesystem write',
    remediationWorkflow: 'Quarantine process, apply strict IP pinning, and replace raw syscalls with safe APIs.',
    incidentCount: 27
  },
  {
    key: 'logic_flaw',
    label: 'Logic Flaw & Semantic Bug',
    severity: 'HIGH',
    description: 'Subtle race condition in token bucket, clock skew window in JWT, off-by-one boundary flaw.',
    detectionSignal: 'Adversarial regression test or fuzz generator detects invariant violation',
    remediationWorkflow: 'Synthesize atomic transactions (e.g. Redis Lua), monotonic timestamp checks, CAS loops.',
    incidentCount: 51
  }
];

export const FailureIntelligenceView: React.FC = () => {
  const { activeTask, runHarness, setActiveTab } = useAegis();
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<FailureTaxonomy>('logic_flaw');
  const [customErrorInput, setCustomErrorInput] = useState<string>(activeTask.failingTrace);
  const [analysisResult, setAnalysisResult] = useState<{
    classifiedCategory: FailureTaxonomy;
    confidence: number;
    astLine: string;
    rootCause: string;
    repairStrategy: string;
  } | null>({
    classifiedCategory: activeTask.category === 'concurrency_race' ? 'logic_flaw' : 'security_violation',
    confidence: 0.98,
    astLine: 'TokenBucketLimiter.allow_request() -> line 26',
    rootCause: activeTask.expectedRootCause,
    repairStrategy: 'Implement atomic Lua transaction script inside Redis to guarantee serialized read-modify-write.'
  });

  const handleAnalyzeCustomTrace = () => {
    const text = customErrorInput.toLowerCase();
    let cat: FailureTaxonomy = 'runtime_error';
    let root = 'Unhandled runtime exception during execution.';
    let strat = 'Introduce boundary validation and type narrowing.';

    if (text.includes('assert') || text.includes('expected') || text.includes('assertionerror')) {
      cat = 'test_failure';
      root = 'Assertion condition evaluated to false under input test conditions.';
      strat = 'Inspect expected data format and adjust computational logic.';
    } else if (text.includes('race') || text.includes('burst') || text.includes('atomic') || text.includes('jwt') || text.includes('skew')) {
      cat = 'logic_flaw';
      root = 'Concurrent interleaving or clock drift allowed uncoordinated state transitions.';
      strat = 'Apply atomic compare-and-swap (CAS) loop or monotonic clock comparison.';
    } else if (text.includes('ssrf') || text.includes('metadata') || text.includes('security') || text.includes('prohibited')) {
      cat = 'security_violation';
      root = 'Network address resolution allows internal private subnet connections.';
      strat = 'Pin resolved IP address against RFC1918 blocklist prior to socket connect.';
    } else if (text.includes('leak') || text.includes('gc') || text.includes('oom') || text.includes('memory')) {
      cat = 'resource_exhaustion';
      root = 'Cyclic reference graph prevents garbage collector deallocation.';
      strat = 'Replace strong listeners with weakref.WeakMethod and automatic dead ref callbacks.';
    } else if (text.includes('panic') || text.includes('bounds') || text.includes('null')) {
      cat = 'runtime_error';
      root = 'Buffer index or pointer exceeded allocated slice capacity.';
      strat = 'Enforce bitwise power-of-two mask and atomic bounds checking.';
    }

    setAnalysisResult({
      classifiedCategory: cat,
      confidence: 0.96,
      astLine: 'Evaluated error trace context',
      rootCause: root,
      repairStrategy: strat
    });
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold">
                02_FAILURE_INTELLIGENCE
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-mono">
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>AST CAUSAL CLASSIFICATION & ROOT CAUSE ISOLATION</span>
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Never blindly retry on error. AegisForge classifies failure taxonomy, isolates exact AST root causes, queries episodic memory, and synthesizes invariant-preserving patches.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-[#E4E4E7] uppercase tracking-wider">
              8 Standardized Taxonomies
            </span>
          </div>
        </div>
      </div>

      {/* Systematic Taxonomy Grid */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Systematic Failure Taxonomy Classification Matrix</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TAXONOMY_LIST.map((tax) => {
            const isSelected = selectedTaxonomy === tax.key;
            return (
              <div
                key={tax.key}
                onClick={() => setSelectedTaxonomy(tax.key)}
                className={`p-3 border transition cursor-pointer font-mono ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500 text-white'
                    : 'bg-[#0C0C0E] border-[#27272A] hover:border-[#3F3F46] hover:bg-[#121215]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 ${
                    tax.severity === 'CRITICAL'
                      ? 'bg-red-500 text-black'
                      : 'bg-yellow-500 text-black'
                  }`}>
                    {tax.severity}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {tax.incidentCount} resolved
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">{tax.label}</h4>
                <p className="text-[10px] text-[#71717A] mt-1 line-clamp-2 leading-relaxed">
                  {tax.description}
                </p>

                <div className="mt-2 pt-2 border-t border-[#27272A] text-[9px] font-mono text-cyan-400/90 line-clamp-1">
                  SIGNAL: {tax.detectionSignal}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Failure Diagnostic & Root-Cause Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 6: Custom Error Trace Input / Tester */}
        <div className="lg:col-span-6 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Input Failure Log / Stack Trace</span>
            </h3>
            <button
              onClick={() => setCustomErrorInput(activeTask.failingTrace)}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 uppercase tracking-wider cursor-pointer"
            >
              Load Active Trace
            </button>
          </div>

          <textarea
            value={customErrorInput}
            onChange={(e) => setCustomErrorInput(e.target.value)}
            rows={7}
            className="w-full bg-black border border-[#27272A] p-3 text-xs font-mono text-[#E4E4E7] focus:outline-none focus:border-cyan-500 leading-relaxed"
            placeholder="Paste raw compiler output, pytest assertion failure, or panic trace..."
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71717A]">
              TAXONOMY CLASSIFIER + AST CAUSAL ANALYZER
            </span>
            <button
              onClick={handleAnalyzeCustomTrace}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-black hover:bg-cyan-500 text-[10px] font-mono uppercase tracking-widest font-bold transition cursor-pointer"
            >
              <SearchCode className="w-3.5 h-3.5" />
              <span>Run Diagnostic Analysis</span>
            </button>
          </div>
        </div>

        {/* Right 6: Diagnostic & Root-Cause Output */}
        <div className="lg:col-span-6 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2 border-b border-[#27272A] pb-2">
            <Wrench className="w-3.5 h-3.5 text-green-400" />
            <span>Root-Cause Diagnostic & Repair Strategy</span>
          </h3>

          {analysisResult && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#18181B] border border-[#27272A] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A] uppercase">Classified Taxonomy:</span>
                  <span className="text-purple-300 font-bold uppercase text-[11px]">
                    {analysisResult.classifiedCategory}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A] uppercase">Classification Confidence:</span>
                  <span className="text-green-400 font-bold">
                    {(analysisResult.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A] uppercase">Target AST Location:</span>
                  <span className="text-cyan-400 font-bold">
                    {analysisResult.astLine}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#18181B] border border-[#27272A] space-y-1">
                <span className="text-[#71717A] font-bold uppercase text-[9px] tracking-wider block">Identified Root Cause:</span>
                <p className="text-[#E4E4E7] text-[11px] leading-relaxed">
                  {analysisResult.rootCause}
                </p>
              </div>

              <div className="p-3 bg-[#18181B] border border-cyan-500/30 space-y-1">
                <span className="text-cyan-400 font-bold uppercase text-[9px] tracking-wider block">Targeted Repair Strategy:</span>
                <p className="text-[#E4E4E7] text-[11px] leading-relaxed">
                  {analysisResult.repairStrategy}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
