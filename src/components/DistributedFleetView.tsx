import React, { useState, useEffect } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  Network, 
  Cpu, 
  Server, 
  Activity, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  HardDrive,
  RefreshCw
} from 'lucide-react';

export const DistributedFleetView: React.FC = () => {
  const { workers, queueStats } = useAegis();
  const [liveWorkers, setLiveWorkers] = useState(workers);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveWorkers(prev => prev.map(w => ({
        ...w,
        cpuUsagePercent: Math.min(95, Math.max(5, Math.floor(w.cpuUsagePercent + (Math.random() * 10 - 5)))),
        tasksProcessed: w.status === 'BUSY' ? w.tasksProcessed + 1 : w.tasksProcessed
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">
                Distributed Systems
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <span>Distributed Agent Fleet & Async Job Queue (Redis + Celery)</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Scalable worker cluster distributing agent synthesis tasks, sandboxed compilation runs, and adversarial regression suites across heterogeneous nodes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Fleet Status: Healthy (5 Nodes)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Queue State Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase block">Pending Jobs</span>
          <span className="text-lg font-bold text-amber-400">{queueStats.pendingJobs}</span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase block">Active Processing</span>
          <span className="text-lg font-bold text-cyan-400">{queueStats.activeJobs}</span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase block">Completed Tasks</span>
          <span className="text-lg font-bold text-emerald-400">{queueStats.completedJobs.toLocaleString()}</span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase block">Failed Retries</span>
          <span className="text-lg font-bold text-rose-400">{queueStats.failedJobs}</span>
        </div>
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
          <span className="text-[10px] text-slate-400 uppercase block">Cluster Throughput</span>
          <span className="text-lg font-bold text-purple-400">{queueStats.throughputRps} rps</span>
        </div>
      </div>

      {/* Worker Nodes Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Worker Fleet Node Topology & Load Distribution</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Cluster Load: Balanced (Round-Robin with Affinity)
          </span>
        </div>

        <div className="overflow-x-auto font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3">WORKER ID</th>
                <th className="py-2.5 px-3">NODE TYPE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3">ACTIVE TASK</th>
                <th className="py-2.5 px-3">CPU LOAD</th>
                <th className="py-2.5 px-3">RAM USAGE</th>
                <th className="py-2.5 px-3">PROCESSED</th>
                <th className="py-2.5 px-3">UPTIME</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-[11.5px]">
              {liveWorkers.map((w) => (
                <tr key={w.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold text-cyan-300 flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-slate-400" />
                    {w.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <span className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-[10px]">
                      {w.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      w.status === 'BUSY'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200 truncate max-w-[200px]" title={w.currentTask || 'Idle'}>
                    {w.currentTask || '—'}
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full ${w.cpuUsagePercent > 80 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                          style={{ width: `${w.cpuUsagePercent}%` }}
                        />
                      </div>
                      <span>{w.cpuUsagePercent}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{w.memoryUsageMb} MB</td>
                  <td className="py-3 px-3 font-bold text-slate-100">{w.tasksProcessed.toLocaleString()}</td>
                  <td className="py-3 px-3 text-slate-400">{w.uptime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
