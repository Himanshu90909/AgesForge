import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sliders, 
  BrainCircuit, 
  TrendingUp, 
  Layers,
  FlaskConical,
  ShieldCheck
} from 'lucide-react';

interface EvolutionExperiment {
  id: string;
  name: string;
  proposedHeuristic: string;
  triggeredFailurePattern: string;
  baselineSolveRate: number;
  candidateSolveRate: number;
  deltaSolveRate: number;
  status: 'PROMOTED_TO_PRODUCTION' | 'DISCARDED_REGRESSION' | 'EVALUATING_BENCHMARK';
  evaluatedTasksCount: number;
}

export const SelfImprovementLoopView: React.FC = () => {
  const [experiments, setExperiments] = useState<EvolutionExperiment[]>([
    {
      id: 'EXP-804',
      name: 'Atomic State Transition Synthesis via Redis Lua',
      proposedHeuristic: 'When concurrency race conditions are classified in key-value operations, automatically synthesize single-turn Lua scripts instead of multi-step read-modify-writes.',
      triggeredFailurePattern: 'Token bucket concurrency race failures under 100-thread burst tests',
      baselineSolveRate: 78.4,
      candidateSolveRate: 88.6,
      deltaSolveRate: +10.2,
      status: 'PROMOTED_TO_PRODUCTION',
      evaluatedTasksCount: 500
    },
    {
      id: 'EXP-792',
      name: 'DNS Resolution Pinning for SSRF Defense',
      proposedHeuristic: 'Enforce pre-flight getaddrinfo() check against RFC1918 subnets before issuing socket connection requests.',
      triggeredFailurePattern: 'Adversarial AWS/GCP metadata URL escape vectors',
      baselineSolveRate: 74.0,
      candidateSolveRate: 78.4,
      deltaSolveRate: +4.4,
      status: 'PROMOTED_TO_PRODUCTION',
      evaluatedTasksCount: 500
    },
    {
      id: 'EXP-781',
      name: 'Aggressive 3-Retry Blind Prompt Loop',
      proposedHeuristic: 'Blindly retry code generation 3 times with higher temperature without isolating AST root cause.',
      triggeredFailurePattern: 'General syntax and typing errors',
      baselineSolveRate: 74.0,
      candidateSolveRate: 66.2,
      deltaSolveRate: -7.8,
      status: 'DISCARDED_REGRESSION',
      evaluatedTasksCount: 500
    }
  ]);

  const [isEvaluatingNew, setIsEvaluatingNew] = useState(false);

  const handleTriggerEvolutionRun = () => {
    setIsEvaluatingNew(true);
    setTimeout(() => {
      const newExp: EvolutionExperiment = {
        id: `EXP-${Math.floor(805 + Math.random() * 50)}`,
        name: 'Monotonic Clock Invariant for Token Expiration Checks',
        proposedHeuristic: 'Inject time.monotonic() / Instant::now() comparisons to prevent system clock step rollback vulnerabilities.',
        triggeredFailurePattern: 'Clock skew window in JWT authorization tokens',
        baselineSolveRate: 88.6,
        candidateSolveRate: 91.2,
        deltaSolveRate: +2.6,
        status: 'PROMOTED_TO_PRODUCTION',
        evaluatedTasksCount: 500
      };
      setExperiments(prev => [newExp, ...prev]);
      setIsEvaluatingNew(false);
    }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold">
                Controlled Policy Evolution
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>Self-Improvement Loop & A/B Benchmark Promotion Gate</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Zero-risk self-evolution: Failure patterns trigger heuristic candidates, which must strictly beat benchmark baselines across 500+ tasks before deployment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerEvolutionRun}
              disabled={isEvaluatingNew}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold font-mono shadow-md transition cursor-pointer"
            >
              {isEvaluatingNew ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Evaluating 500 Tasks...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>Propose & Evaluate Heuristic</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Controlled Evolution Flow Pipeline */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Controlled Self-Evolution Pipeline Flow</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-purple-400 font-bold text-[10px]">STAGE 1</span>
            <h4 className="font-bold text-slate-200">Failure Cluster</h4>
            <p className="text-[11px] text-slate-400">Groups 100+ failed runs into specific taxonomy patterns.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-bold text-[10px]">STAGE 2</span>
            <h4 className="font-bold text-slate-200">Strategy Synthesis</h4>
            <p className="text-[11px] text-slate-400">Synthesizes programmatic heuristic (e.g., AST bounds check).</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-bold text-[10px]">STAGE 3</span>
            <h4 className="font-bold text-slate-200">AegisBench Gate</h4>
            <p className="text-[11px] text-slate-400">Executes candidate against 500+ standard test suites.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-bold text-[10px]">STAGE 4</span>
            <h4 className="font-bold text-slate-200">Delta Validation</h4>
            <p className="text-[11px] text-slate-400">Verifies Solve Rate &gt; Baseline with zero regression.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/40 space-y-1">
            <span className="text-emerald-300 font-bold text-[10px]">STAGE 5</span>
            <h4 className="font-bold text-emerald-300">Production Release</h4>
            <p className="text-[11px] text-slate-300">Promotes candidate as official version (e.g. v3.2.0).</p>
          </div>
        </div>
      </div>

      {/* Experiments Ledger */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <span>Self-Improvement Experiment Ledger</span>
        </h3>

        <div className="space-y-3 font-mono text-xs">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className={`p-4 rounded-xl border space-y-3 ${
                exp.status === 'PROMOTED_TO_PRODUCTION'
                  ? 'bg-slate-950 border-emerald-500/40'
                  : 'bg-slate-950 border-rose-500/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-cyan-300 text-sm">{exp.id}:</span>
                  <span className="font-bold text-slate-100">{exp.name}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  exp.status === 'PROMOTED_TO_PRODUCTION'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                }`}>
                  {exp.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11.5px]">
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block font-bold mb-1">Triggering Failure Cluster:</span>
                  <p className="text-slate-300 leading-relaxed">{exp.triggeredFailurePattern}</p>
                </div>
                <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block font-bold mb-1">Proposed Strategy:</span>
                  <p className="text-slate-300 leading-relaxed">{exp.proposedHeuristic}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">
                  Evaluated Tasks: <strong>{exp.evaluatedTasksCount} tasks</strong>
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    Baseline: <span className="text-slate-200 font-bold">{exp.baselineSolveRate}%</span>
                  </span>
                  <span className="text-slate-400">
                    Candidate: <span className="text-slate-200 font-bold">{exp.candidateSolveRate}%</span>
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    exp.deltaSolveRate > 0 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                  }`}>
                    Delta: {exp.deltaSolveRate > 0 ? `+${exp.deltaSolveRate}%` : `${exp.deltaSolveRate}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
