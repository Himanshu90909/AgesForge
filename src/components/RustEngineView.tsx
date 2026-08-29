import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Terminal, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Layers, 
  HardDrive, 
  Clock, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface SimulatedProcess {
  pid: number;
  name: string;
  state: 'RUNNING' | 'SLEEPING' | 'ZOMBIE_REAPED';
  cpuPercent: number;
  rssMb: number;
  spawnLatencyUs: number;
  syscallRate: number;
}

export const RustEngineView: React.FC = () => {
  const [processes, setProcesses] = useState<SimulatedProcess[]>([
    { pid: 4820, name: 'aegis-exec::supervisor', state: 'RUNNING', cpuPercent: 1.2, rssMb: 14.8, spawnLatencyUs: 182, syscallRate: 420 },
    { pid: 4821, name: 'cgroup::memory_watcher', state: 'SLEEPING', cpuPercent: 0.1, rssMb: 4.2, spawnLatencyUs: 94, syscallRate: 45 },
    { pid: 4824, name: 'sandbox::worker_pytest', state: 'RUNNING', cpuPercent: 28.4, rssMb: 94.6, spawnLatencyUs: 210, syscallRate: 1840 },
    { pid: 4827, name: 'ebpf::seccomp_filter', state: 'RUNNING', cpuPercent: 0.4, rssMb: 8.1, spawnLatencyUs: 110, syscallRate: 3100 },
    { pid: 4830, name: 'ipc::ring_buffer_bridge', state: 'RUNNING', cpuPercent: 0.8, rssMb: 6.4, spawnLatencyUs: 130, syscallRate: 980 }
  ]);

  const [benchmarkMetric, setBenchmarkMetric] = useState({
    rustSpawnUs: 185,
    pythonSpawnUs: 14200,
    speedup: '76.7x faster',
    ipcLatencyNs: 42,
    cgroupOverhead: '<0.05%'
  });

  // Minor live pulse to telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpuPercent: Math.max(0.1, Number((p.cpuPercent + (Math.random() * 0.6 - 0.3)).toFixed(1))),
        syscallRate: Math.max(10, Math.floor(p.syscallRate + (Math.random() * 40 - 20)))
      })));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-orange-500/10 border border-orange-500/40 text-orange-400 font-bold">
                04_NATIVE_SYSTEMS_LAYER
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4 text-orange-400" />
                <span>RUST NATIVE EXECUTION ENGINE (`AEGIS-EXEC` / `LIBAEGIS_CORE`)</span>
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              High-performance systems layer pairing Python agent intelligence with sub-millisecond Rust process supervisors, cgroups v2 resource accounting, and zero-copy IPC.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-orange-400 uppercase tracking-wider">
              BINARY: X86_64-LINUX-MUSL
            </span>
          </div>
        </div>
      </div>

      {/* Dual Architecture Split (Python vs Rust Responsibilities) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Python Agent Layer */}
        <div className="bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-yellow-500 font-mono flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-yellow-500" />
              <span>Python Layer (Reasoning & Orchestration)</span>
            </h3>
            <span className="text-[9px] font-mono text-[#71717A] uppercase tracking-wider">High-Level Policy</span>
          </div>
          <ul className="space-y-2 text-xs text-[#E4E4E7] font-mono">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">▶</span>
              <span><strong>Task Planner:</strong> Decomposes task requirements and invariant bounds.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">▶</span>
              <span><strong>Coding Agent & Patch Synthesizer:</strong> LLM prompt chains and AST diff generators.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">▶</span>
              <span><strong>Failure Memory Vector Index:</strong> Semantic retrieval of prior bug resolutions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 font-bold">▶</span>
              <span><strong>Evaluation Harness & REST APIs:</strong> Benchmark metric collection and A/B gates.</span>
            </li>
          </ul>
        </div>

        {/* Rust Execution Core */}
        <div className="bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-orange-400 font-mono flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span>Rust Core (`aegis-exec` Systems Engine)</span>
            </h3>
            <span className="text-[9px] font-mono text-[#71717A] uppercase tracking-wider">Sub-Millisecond Native</span>
          </div>
          <ul className="space-y-2 text-xs text-[#E4E4E7] font-mono">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">▶</span>
              <span><strong>Process Supervisor:</strong> Sub-millisecond process spawning via `clone3` & PID namespaces.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">▶</span>
              <span><strong>Cgroups v2 Resource Accounting:</strong> Microsecond CPU throttling and OOM watchdog.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">▶</span>
              <span><strong>eBPF / Seccomp Syscall Trap:</strong> Zero-overhead security violation interception.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 font-bold">▶</span>
              <span><strong>Zero-Copy Shared Memory IPC:</strong> Lock-free ring buffer exchanging stdout/stderr logs.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Systems Benchmark & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 5: Systems Benchmark Comparison */}
        <div className="lg:col-span-5 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2 border-b border-[#27272A] pb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Process Spawn & IPC Latency Benchmark</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-[#18181B] border border-[#27272A] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#71717A] uppercase">Rust `aegis-exec` Spawn:</span>
                <span className="text-green-400 font-bold">{benchmarkMetric.rustSpawnUs} µs (0.18 ms)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#71717A] uppercase">Python `subprocess`:</span>
                <span className="text-red-400 font-bold">{benchmarkMetric.pythonSpawnUs} µs (14.2 ms)</span>
              </div>
              <div className="pt-2 border-t border-[#27272A] flex justify-between items-center">
                <span className="text-[#E4E4E7] font-bold uppercase text-[10px]">Speedup Multiplier:</span>
                <span className="text-black font-bold px-2 py-0.5 bg-cyan-400 text-[10px] tracking-wider uppercase">
                  {benchmarkMetric.speedup}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
                <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">IPC RingBuffer Latency</span>
                <span className="text-sm font-bold text-orange-400 font-mono">{benchmarkMetric.ipcLatencyNs} ns</span>
              </div>
              <div className="p-2.5 bg-[#18181B] border border-[#27272A]">
                <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Cgroup Supervisor Cost</span>
                <span className="text-sm font-bold text-green-400 font-mono">{benchmarkMetric.cgroupOverhead}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7: Live Process Supervisor Table */}
        <div className="lg:col-span-7 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              <span>Live Supervisor Process Table (Rust Engine PID Table)</span>
            </h3>
            <span className="text-[9px] font-mono text-green-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />
              5 Active PIDs
            </span>
          </div>

          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#27272A] text-[9px] text-[#71717A] uppercase tracking-widest">
                  <th className="py-2 px-2">PID</th>
                  <th className="py-2 px-2">PROCESS NAME</th>
                  <th className="py-2 px-2">STATE</th>
                  <th className="py-2 px-2">CPU</th>
                  <th className="py-2 px-2">RSS RAM</th>
                  <th className="py-2 px-2">SYSCALLS/S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A] text-[11px]">
                {processes.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-[#18181B] transition">
                    <td className="py-2 px-2 font-bold text-cyan-400">{proc.pid}</td>
                    <td className="py-2 px-2 text-[#E4E4E7]">{proc.name}</td>
                    <td className="py-2 px-2">
                      <span className="px-1.5 py-0.5 text-[9px] font-mono bg-green-500/10 text-green-400 border border-green-500/30">
                        {proc.state}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-[#E4E4E7]">{proc.cpuPercent}%</td>
                    <td className="py-2 px-2 text-[#E4E4E7]">{proc.rssMb} MB</td>
                    <td className="py-2 px-2 text-[#71717A]">{proc.syscallRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
