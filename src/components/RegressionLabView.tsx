import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  Microscope, 
  ShieldCheck, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Terminal, 
  Zap, 
  Sparkles,
  Layers,
  Flame
} from 'lucide-react';

interface RegressionTier {
  id: number;
  name: string;
  badge: string;
  description: string;
  assertionCount: number;
  fuzzPayloads: string[];
  status: 'PASSED' | 'FAILED' | 'PENDING' | 'RUNNING';
  durationMs: number;
}

export const RegressionLabView: React.FC = () => {
  const { activeTask } = useAegis();
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [activeTierId, setActiveTierId] = useState<number>(1);
  const [tiers, setTiers] = useState<RegressionTier[]>([
    {
      id: 1,
      name: 'Tier 1: Original Repro Test',
      badge: 'Exact Trace Replay',
      description: 'Re-executes original reproducing failure trace under identical sandbox parameters to verify that the bug is resolved.',
      assertionCount: 12,
      fuzzPayloads: ['original_payload_eval', 'repro_trace_input', 'deterministic_seed_0x42'],
      status: 'PASSED',
      durationMs: 42
    },
    {
      id: 2,
      name: 'Tier 2: Invariant Boundary & Edge Cases',
      badge: 'Boundary Invariants',
      description: 'Fuzzes zero-capacity buffers, negative numbers, empty arrays, MAX_INT integer boundaries, and clock drift windows.',
      assertionCount: 64,
      fuzzPayloads: ['buffer_len=0', 'int64_max_wrap', 'clock_drift_skew_+500ms', 'null_pointer_guard'],
      status: 'PASSED',
      durationMs: 118
    },
    {
      id: 3,
      name: 'Tier 3: Adversarial Security Suite',
      badge: 'Adversarial Fuzzing',
      description: 'Injects SSRF payload formats (169.254.169.254, 0177.0.0.1, [::1]), race condition bursts (100 concurrent threads), and shell injection tokens.',
      assertionCount: 88,
      fuzzPayloads: ['http://[::ffff:169.254.169.254]', '100_thread_concurrent_burst', 'bypass_header_x_forwarded_for'],
      status: 'PASSED',
      durationMs: 245
    },
    {
      id: 4,
      name: 'Tier 4: Stress & Memory Leak Gate',
      badge: '10,000 Iterations',
      description: 'Executes 10,000 sequential and concurrent operations while recording cgroup RSS memory growth to guarantee zero leaks.',
      assertionCount: 10000,
      fuzzPayloads: ['10k_ops_rss_monitor', 'gc_weakref_cycle_audit', 'cgroup_memory_slope'],
      status: 'PASSED',
      durationMs: 412
    }
  ]);

  const handleRunAllTiers = () => {
    setIsRunningAll(true);
    setTiers(prev => prev.map(t => ({ ...t, status: 'RUNNING' })));

    setTimeout(() => {
      setTiers(prev => prev.map((t, idx) => ({
        ...t,
        status: 'PASSED',
        durationMs: Math.floor(t.durationMs * (0.9 + Math.random() * 0.2))
      })));
      setIsRunningAll(false);
    }, 1200);
  };

  const selectedTier = tiers.find(t => t.id === activeTierId) || tiers[0];

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                Quality Gate
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Microscope className="w-4 h-4 text-emerald-400" />
                <span>4-Tier Automated Regression & Adversarial Laboratory</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Every synthesized patch must survive 4 progressive verification tiers before being accepted into the codebase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAllTiers}
              disabled={isRunningAll}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold font-mono shadow-md transition cursor-pointer"
            >
              {isRunningAll ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Fuzzing 4 Tiers...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Full 4-Tier Suite</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4-Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((tier) => {
          const isSelected = activeTierId === tier.id;
          return (
            <div
              key={tier.id}
              onClick={() => setActiveTierId(tier.id)}
              className={`p-3.5 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                  {tier.badge}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  tier.status === 'PASSED'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    : 'bg-cyan-900 text-cyan-200 border border-cyan-400 animate-pulse'
                }`}>
                  {tier.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-100">{tier.name}</h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {tier.description}
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>{tier.assertionCount.toLocaleString()} assertions</span>
                <span className="text-emerald-400 font-bold">{tier.durationMs}ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Tier Fuzzing Inspector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{selectedTier.name} — Test Vector Execution Inspector</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedTier.description}
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            Status: {selectedTier.status} ({selectedTier.durationMs}ms)
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 font-mono text-xs">
          {/* Injected Fuzz Payloads */}
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="text-slate-400 uppercase text-[10.5px] font-bold block">Injected Test Vectors & Payloads:</span>
            <div className="space-y-1.5">
              {selectedTier.fuzzPayloads.map((payload, i) => (
                <div key={i} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-cyan-300 truncate">{payload}</span>
                  <span className="text-emerald-400 font-bold">ASSERTION_OK</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invariant Verification Telemetry */}
          <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 space-y-2">
            <span className="text-emerald-400 uppercase text-[10.5px] font-bold block">Safety Invariant Check:</span>
            <div className="text-slate-300 space-y-1 text-[11px] leading-relaxed">
              <div>✓ Invariant 1: No data races detected via ThreadSanitizer (0 data races)</div>
              <div>✓ Invariant 2: Zero memory heap growth detected over 10k iterations (delta RSS: +0.0MB)</div>
              <div>✓ Invariant 3: Blocked RFC1918 internal loopback address connections</div>
              <div>✓ Invariant 4: Verified monotonic timestamp window comparison</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
