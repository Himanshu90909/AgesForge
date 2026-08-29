import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  BarChart3, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export const PerformanceLabView: React.FC = () => {
  const { 
    agentVersions, 
    selectedVersionId, 
    setSelectedVersionId, 
    ablationSettings, 
    setAblationSettings 
  } = useAegis();

  const [activeMetricTab, setActiveMetricTab] = useState<'solve_rate' | 'latency_tokens' | 'failures' | 'ablations'>('solve_rate');

  const chartData = agentVersions.map(v => ({
    name: v.id.toUpperCase(),
    fullName: v.name,
    solveRate: v.solveRate,
    passAt1: v.passAt1,
    passAt3: v.passAt3,
    latency: v.avgLatencySec,
    tokensK: Number((v.tokensAvg / 1000).toFixed(1)),
    costCents: Number((v.costPerTask * 100).toFixed(1)),
    failures: v.totalFailures
  }));

  const failurePieData = [
    { name: 'Logic Flaw', value: 38, color: '#a855f7' },
    { name: 'Runtime Panic', value: 24, color: '#f43f5e' },
    { name: 'Test Failure', value: 20, color: '#fb923c' },
    { name: 'Compilation', value: 12, color: '#38bdf8' },
    { name: 'Security Violation', value: 6, color: '#eab308' }
  ];

  // Dynamic calculated ablation score
  const computedAblationSolveRate = (
    88.6 
    - (!ablationSettings.failureMemory ? 14.2 : 0)
    - (!ablationSettings.regressionGate ? 11.5 : 0)
    - (!ablationSettings.taskPlanner ? 8.4 : 0)
    - (!ablationSettings.seccompSyscall ? 5.1 : 0)
  ).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-bold">
                05_EVALUATION_HARNESS
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-mono">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>AGENT PERFORMANCE LAB & AUTOMATIC REGRESSION DETECTION</span>
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Rigorous comparative benchmarking across agent versions with automatic regression analysis, latency-token tradeoffs, and ablation studies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-green-400 uppercase tracking-wider font-bold">
              PROD RELEASE: V3.2.0-EVOLVED
            </span>
          </div>
        </div>
      </div>

      {/* Automatic Regression Detection Status Card */}
      <div className="p-4 bg-[#0C0C0E] border border-[#27272A]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-green-500 text-black uppercase tracking-wider">
                STATUS: IMPROVED (PROMOTED)
              </span>
              <span className="text-xs text-[#71717A] uppercase">DELTA VS V2.1 BASELINE:</span>
            </div>
            <p className="text-xs text-[#71717A]">
              Evaluated over 500 AegisBench software engineering tasks with automated statistical significance.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto font-mono text-center">
            <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
              <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Solve Rate</span>
              <span className="text-xs font-bold text-green-400 flex items-center justify-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +20.8%
              </span>
            </div>
            <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
              <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Median Latency</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -26.7%
              </span>
            </div>
            <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
              <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Token Usage</span>
              <span className="text-xs font-bold text-cyan-400 flex items-center justify-center gap-0.5">
                <ArrowDownRight className="w-3.5 h-3.5" /> -28.7%
              </span>
            </div>
            <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
              <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Reliability (Pass@3)</span>
              <span className="text-xs font-bold text-green-400 flex items-center justify-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> +28.5%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Matrix Table */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2 border-b border-[#27272A] pb-2">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Agent Version Benchmark Matrix (Codex Evals Reference)</span>
        </h3>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#27272A] text-[9px] text-[#71717A] bg-black uppercase tracking-widest">
                <th className="py-2.5 px-3">AGENT VERSION</th>
                <th className="py-2.5 px-3">SOLVE RATE</th>
                <th className="py-2.5 px-3">PASS@1</th>
                <th className="py-2.5 px-3">PASS@3</th>
                <th className="py-2.5 px-3">AVG LATENCY</th>
                <th className="py-2.5 px-3">TOKENS</th>
                <th className="py-2.5 px-3">COST / TASK</th>
                <th className="py-2.5 px-3">FAILURES</th>
                <th className="py-2.5 px-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-[11px]">
              {agentVersions.map((v) => {
                const isSelected = selectedVersionId === v.id;
                return (
                  <tr 
                    key={v.id}
                    onClick={() => setSelectedVersionId(v.id)}
                    className={`cursor-pointer transition ${
                      isSelected ? 'bg-cyan-500/10 text-white' : 'hover:bg-[#18181B] text-[#E4E4E7]'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-cyan-400" />
                      {v.name} ({v.tag})
                    </td>
                    <td className="py-2.5 px-3 font-bold text-green-400">{v.solveRate}%</td>
                    <td className="py-2.5 px-3 text-[#E4E4E7]">{v.passAt1}%</td>
                    <td className="py-2.5 px-3 text-[#E4E4E7]">{v.passAt3}%</td>
                    <td className="py-2.5 px-3 text-cyan-400">{v.avgLatencySec}s</td>
                    <td className="py-2.5 px-3 text-[#71717A]">{(v.tokensAvg / 1000).toFixed(1)}K</td>
                    <td className="py-2.5 px-3 text-[#71717A]">${v.costPerTask.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-red-400 font-bold">{v.totalFailures}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        v.status === 'IMPROVED'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : v.status === 'STABLE'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharts Analytics & Ablation Studies */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 7: Visual Recharts Graphs */}
        <div className="lg:col-span-7 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono">
                Performance Evaluation Charts
              </h3>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <button
                onClick={() => setActiveMetricTab('solve_rate')}
                className={`px-2.5 py-1 transition uppercase tracking-wider cursor-pointer ${
                  activeMetricTab === 'solve_rate' ? 'bg-cyan-500 text-black font-bold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                Solve Rate
              </button>
              <button
                onClick={() => setActiveMetricTab('latency_tokens')}
                className={`px-2.5 py-1 transition uppercase tracking-wider cursor-pointer ${
                  activeMetricTab === 'latency_tokens' ? 'bg-cyan-500 text-black font-bold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                Latency/Tokens
              </button>
            </div>
          </div>

          <div className="h-[260px] w-full">
            {activeMetricTab === 'solve_rate' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <Bar dataKey="solveRate" name="Solve Rate %" fill="#06b6d4" />
                  <Bar dataKey="passAt1" name="Pass@1 %" fill="#3b82f6" />
                  <Bar dataKey="passAt3" name="Pass@3 %" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
                  <XAxis dataKey="name" stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#71717A" fontSize={10} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#09090B', borderColor: '#27272A', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="latency" name="Latency (s)" stroke="#eab308" strokeWidth={2} />
                  <Line type="monotone" dataKey="tokensK" name="Tokens (k)" stroke="#06b6d4" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right 5: Interactive Ablation Studies Controller */}
        <div className="lg:col-span-5 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              <span>Ablation Studies Laboratory</span>
            </h3>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Live Impact</span>
          </div>

          <p className="text-xs text-[#71717A] leading-relaxed">
            Toggle individual architectural components to test performance ablations and quantify exact solve-rate contribution.
          </p>

          <div className="space-y-2 font-mono text-xs">
            <label className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] cursor-pointer">
              <span className="text-[#E4E4E7] text-[11px]">1. Episodic Failure Memory (+14.2%):</span>
              <input
                type="checkbox"
                checked={ablationSettings.failureMemory}
                onChange={(e) => setAblationSettings(prev => ({ ...prev, failureMemory: e.target.checked }))}
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] cursor-pointer">
              <span className="text-[#E4E4E7] text-[11px]">2. 4-Tier Automated Regression Gate (+11.5%):</span>
              <input
                type="checkbox"
                checked={ablationSettings.regressionGate}
                onChange={(e) => setAblationSettings(prev => ({ ...prev, regressionGate: e.target.checked }))}
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] cursor-pointer">
              <span className="text-[#E4E4E7] text-[11px]">3. Invariant Task Planner (+8.4%):</span>
              <input
                type="checkbox"
                checked={ablationSettings.taskPlanner}
                onChange={(e) => setAblationSettings(prev => ({ ...prev, taskPlanner: e.target.checked }))}
                className="accent-cyan-400"
              />
            </label>

            <label className="flex items-center justify-between p-2 bg-[#18181B] border border-[#27272A] cursor-pointer">
              <span className="text-[#E4E4E7] text-[11px]">4. Seccomp Syscall Sandbox (+5.1%):</span>
              <input
                type="checkbox"
                checked={ablationSettings.seccompSyscall}
                onChange={(e) => setAblationSettings(prev => ({ ...prev, seccompSyscall: e.target.checked }))}
                className="accent-cyan-400"
              />
            </label>
          </div>

          <div className="p-3 bg-[#18181B] border border-cyan-500/40 flex items-center justify-between font-mono">
            <span className="text-xs text-[#71717A] uppercase tracking-wider">Ablated Solve Rate:</span>
            <span className="text-base font-bold text-white">{computedAblationSolveRate}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
