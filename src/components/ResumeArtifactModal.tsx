import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  Briefcase, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Trophy,
  ExternalLink
} from 'lucide-react';

export const ResumeArtifactModal: React.FC = () => {
  const { isResumeModalOpen, setIsResumeModalOpen } = useAegis();
  const [copied, setCopied] = useState(false);

  if (!isResumeModalOpen) return null;

  const resumeText = `AEGISFORGE — Self-Evolving Autonomous Coding Agent Operating System
Target: Next-Gen AI Startup / Foundation Model Agent Infrastructure

• Dual-Engine Architecture: Architected a full-stack agent operating system pairing a Python reasoning/DAG planning orchestrator with a sub-millisecond Rust native execution supervisor (\`aegis-exec\`), reducing process spawn overhead by 76.7x (0.18ms vs 14.2ms).
• 17-Language Failure Intelligence: Engineered an AST-grounded Failure Intelligence Engine covering 17 languages with an 8-category failure taxonomy; eliminated blind LLM prompting loops and lifted pass rates from 54.0% to 88.6% on AegisBench (520+ verified scenarios).
• Adaptive Kernel Sandbox: Built an Adaptive Sandbox enforcing Linux cgroups v2 resource quotas (CPU/RAM), seccomp-bpf syscall quarantine, and real-time command risk assessment (ALLOW / RESTRICT / BLOCK) to mitigate SSRF, fork-bombs, and arbitrary execution vectors.
• Episodic Memory & 4-Tier Invariants: Implemented a causal failure-to-patch memory graph with k-NN retrieval, coupled with an automated 4-tier regression laboratory (repro, boundary invariants, adversarial fuzzing, and 10k-op leak audits).
• Distributed Self-Evolution Loop: Designed a statistical A/B benchmark promotion harness across distributed Redis/Celery worker clusters to safely validate, ablate, and promote self-evolved agent heuristics to production.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-[#0C0C0E] border border-[#27272A] p-5 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 font-mono text-xs text-[#E4E4E7]">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold">
              00_FOUNDER_PORTFOLIO
            </span>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-amber-400" />
              <span>Next-Gen AI Startup / Codex Core Systems Engineering Portfolio</span>
            </h3>
          </div>
          <button
            onClick={() => setIsResumeModalOpen(false)}
            className="p-1 text-[#71717A] hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Highlights Banner */}
        <div className="p-3.5 bg-[#18181B] border border-amber-500/30 space-y-1.5 font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              TARGET: AI AGENT INFRASTRUCTURE & FOUNDATION SYSTEMS
            </span>
            <span className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/30 uppercase tracking-wider font-bold">
              VERIFIED BENCHMARK: +34.6% GAIN (17 LANGUAGES)
            </span>
          </div>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Production-grade agent architecture demonstrating multi-agent DAG orchestration, AST failure root-cause analysis, native kernel sandboxing (Rust/cgroups v2/seccomp), episodic memory, and autonomous self-evolution.
          </p>
        </div>

        {/* Copyable Resume Bullet Points */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[#71717A] text-[10px] uppercase tracking-wider font-bold">
            <span>READY-TO-USE EXECUTIVE & RESUME BULLET POINTS</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY BULLETS'}</span>
            </button>
          </div>

          <div className="p-3.5 bg-black border border-[#27272A] text-xs leading-relaxed whitespace-pre-wrap text-[#E4E4E7]">
            {resumeText}
          </div>
        </div>

        {/* 10 Architectural Pillars Summary Checklist */}
        <div className="space-y-2 pt-2 border-t border-[#27272A]">
          <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">10 Architectural Pillars Verified:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#E4E4E7]">
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>1. 10-Step Autonomous Agent Harness</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>2. 17-Language Failure Intelligence Engine</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>3. Cgroups v2 & Seccomp Adaptive Sandbox</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>4. Sub-ms Rust Native Supervisor (`aegis-exec`)</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>5. Agent Performance Lab & Evals Matrix</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>6. Episodic Failure-to-Patch Memory Graph</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>7. 4-Tier Automated Regression Laboratory</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>8. Controlled Self-Improvement Loop</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>9. Distributed Redis/Celery Worker Fleet</span>
            </div>
            <div className="p-2 bg-[#18181B] border border-[#27272A] flex items-center gap-2">
              <span className="text-green-400 font-bold">✓</span>
              <span>10. AegisBench 520+ Software Benchmark</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[#27272A]">
          <button
            onClick={() => setIsResumeModalOpen(false)}
            className="px-4 py-1.5 bg-[#18181B] hover:bg-[#27272A] text-[#71717A] hover:text-white uppercase tracking-wider font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
