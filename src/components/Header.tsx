import React from 'react';
import { useAegis } from '../context/AegisContext';
import { 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Play, 
  FileCode2, 
  RotateCcw, 
  Briefcase,
  Activity
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeTask, 
    isRunning, 
    runHarness, 
    resetHarness, 
    geminiLiveEnabled, 
    setIsTaskModalOpen,
    setIsResumeModalOpen
  } = useAegis();

  return (
    <header className="border-b border-[#27272A] bg-[#0C0C0E] sticky top-0 z-40 px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Engine Identity */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center shrink-0">
              <span className="text-black font-black text-xs font-mono">AF</span>
            </div>
            <div>
              <div className="flex items-center">
                <h1 className="text-lg font-bold tracking-tighter uppercase text-white">
                  AegisForge
                </h1>
                <span className="text-cyan-500 font-mono text-xs ml-2 tracking-wide font-semibold">
                  v3.2.0-STABLE
                </span>
              </div>
              <p className="text-[10px] text-[#71717A] font-mono uppercase tracking-wider hidden sm:block">
                Autonomous Coding Agent OS & Execution Harness
              </p>
            </div>
          </div>

          {/* Dual Engine Status Readout */}
          <div className="hidden lg:flex items-center space-x-4 text-[10px] font-mono tracking-widest text-[#71717A]">
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              <span>ENGINE: RUST_NATIVE_04</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2"></span>
              <span>ORCHESTRATOR: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Center: Active Task Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-xs max-w-md truncate">
          <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-[10px] font-mono uppercase text-[#71717A] shrink-0">TASK:</span>
          <span className="text-xs font-medium text-white truncate" title={activeTask.title}>
            {activeTask.title}
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#27272A] text-[#E4E4E7] uppercase shrink-0">
            {activeTask.difficulty}
          </span>
        </div>

        {/* Right: Actions & Modals */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Gemini Mode Status */}
          <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider border ${
            geminiLiveEnabled 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-[#18181B] border-[#27272A] text-[#71717A]'
          }`}>
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{geminiLiveEnabled ? 'GEMINI 3.7 LIVE' : 'DETERMINISTIC'}</span>
          </div>

          {/* New Custom Task button */}
          <button
            id="btn-custom-task"
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] text-[10px] font-mono uppercase tracking-wider transition cursor-pointer"
            title="Create custom coding task"
          >
            <FileCode2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Resume Artifact Generator */}
          <button
            id="btn-resume-artifact"
            onClick={() => setIsResumeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-[#27272A] border border-amber-500/40 text-amber-300 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer"
            title="View Codex Core Agents resume summary & metrics"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-400" />
            <span>Codex Portfolio</span>
          </button>

          {/* Run Harness CTA */}
          <button
            id="btn-run-harness-header"
            onClick={() => {
              if (!isRunning) runHarness();
            }}
            disabled={isRunning}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-[10px] uppercase tracking-widest font-bold transition cursor-pointer ${
              isRunning 
                ? 'bg-[#18181B] text-cyan-400 border border-cyan-500/50 cursor-not-allowed'
                : 'bg-white text-black hover:bg-cyan-500 hover:text-black transition-colors'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Running Loop...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Run Harness</span>
              </>
            )}
          </button>

          <button
            id="btn-reset-harness"
            onClick={resetHarness}
            className="p-2 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#71717A] hover:text-white transition"
            title="Reset harness state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
