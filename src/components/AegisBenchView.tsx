import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { AEGIS_BENCH_TASKS } from '../data/benchmarks';
import { BenchmarkTask, ALL_LANGUAGES, Language } from '../types';
import { 
  Trophy, 
  Search, 
  Filter, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Code2, 
  Zap,
  Sparkles
} from 'lucide-react';

export const AegisBenchView: React.FC = () => {
  const { setActiveTask, setActiveTab, runHarness } = useAegis();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredTasks = AEGIS_BENCH_TASKS.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.language.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLang = selectedLanguage === 'ALL' || task.language === selectedLanguage;
    const matchesDiff = selectedDifficulty === 'ALL' || task.difficulty === selectedDifficulty;
    const matchesCat = selectedCategory === 'ALL' || task.category === selectedCategory;
    return matchesSearch && matchesLang && matchesDiff && matchesCat;
  });

  const handleLaunchTask = (task: BenchmarkTask) => {
    setActiveTask(task);
    setActiveTab('harness');
  };

  // Language count map
  const langCounts = ALL_LANGUAGES.reduce((acc, lang) => {
    acc[lang] = AEGIS_BENCH_TASKS.filter(t => t.language === lang).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold">
                02_AEGIS_BENCH_GOLD_STANDARD
              </span>
              <h2 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2 font-mono">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>AEGISBENCH SOFTWARE ENGINEERING BENCHMARK SUITE (ALL LANGUAGES)</span>
              </h2>
            </div>
            <p className="text-xs text-[#71717A] mt-1">
              Curated multi-language suite of distributed systems, concurrency races, SSRF security escapes, memory leaks, actor deadlocks, and ABI breakage across all 17 supported software languages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-amber-400 uppercase tracking-wider font-bold">
              17 LANGUAGES • 520+ VERIFIED SCENARIOS
            </span>
          </div>
        </div>
      </div>

      {/* Benchmark Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-center">
        <div className="p-3 bg-[#0C0C0E] border border-[#27272A]">
          <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Total Scenarios</span>
          <span className="text-sm font-bold text-white">520 Tasks</span>
        </div>
        <div className="p-3 bg-[#0C0C0E] border border-[#27272A]">
          <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">AegisForge v3.2 Pass Rate</span>
          <span className="text-sm font-bold text-green-400">88.6%</span>
        </div>
        <div className="p-3 bg-[#0C0C0E] border border-[#27272A]">
          <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Vanilla Baseline Pass Rate</span>
          <span className="text-sm font-bold text-red-400">54.0%</span>
        </div>
        <div className="p-3 bg-[#0C0C0E] border border-[#27272A]">
          <span className="text-[9px] text-[#71717A] uppercase tracking-wider block">Pass Rate Delta</span>
          <span className="text-sm font-bold text-cyan-400">+34.6% Gain</span>
        </div>
      </div>

      {/* Language Filter Pills Bar */}
      <div className="bg-[#0C0C0E] border border-[#27272A] p-2.5 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Programming Language Filter ({ALL_LANGUAGES.length} supported):</span>
          </span>
          <span>{filteredTasks.length} tasks matched</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
          <button
            onClick={() => setSelectedLanguage('ALL')}
            className={`px-2.5 py-1 uppercase tracking-wider transition cursor-pointer ${
              selectedLanguage === 'ALL'
                ? 'bg-cyan-500 text-black font-bold'
                : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white'
            }`}
          >
            All Languages ({AEGIS_BENCH_TASKS.length})
          </button>
          {ALL_LANGUAGES.map((lang) => {
            const count = langCounts[lang] || 0;
            const isSelected = selectedLanguage === lang;
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2 py-1 uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-white'
                }`}
              >
                <span>{lang}</span>
                {count > 0 && (
                  <span className={`text-[9px] px-1 rounded-xs ${isSelected ? 'bg-black/30 text-white' : 'bg-[#27272A] text-[#71717A]'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search AegisBench by name, keyword, language, or problem statement..."
            className="w-full bg-[#0C0C0E] border border-[#27272A] pl-10 pr-4 py-2 text-xs font-mono text-[#E4E4E7] focus:outline-none focus:border-amber-400 placeholder:text-[#52525B]"
          />
        </div>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          aria-label="Filter by Language"
          className="bg-[#0C0C0E] border border-[#27272A] text-[#E4E4E7] text-xs px-3 py-2 font-mono focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Languages ({ALL_LANGUAGES.length})</option>
          {ALL_LANGUAGES.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          aria-label="Filter by Difficulty"
          className="bg-[#0C0C0E] border border-[#27272A] text-[#E4E4E7] text-xs px-3 py-2 font-mono focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Difficulties</option>
          <option value="Codex-Core">Codex-Core</option>
          <option value="Hard">Hard</option>
          <option value="Medium">Medium</option>
          <option value="Easy">Easy</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by Category"
          className="bg-[#0C0C0E] border border-[#27272A] text-[#E4E4E7] text-xs px-3 py-2 font-mono focus:outline-none cursor-pointer"
        >
          <option value="ALL">All Categories</option>
          <option value="concurrency_race">concurrency_race</option>
          <option value="security_hardening">security_hardening</option>
          <option value="memory_leak">memory_leak</option>
          <option value="sql_database">sql_database</option>
          <option value="resource_exhaustion">resource_exhaustion</option>
          <option value="bug_fixing">bug_fixing</option>
        </select>
      </div>

      {/* Benchmark Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-[#0C0C0E] border border-[#27272A] hover:border-amber-500/50 p-4 transition space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase">
                    {task.language}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase">
                    {task.difficulty}
                  </span>
                  <span className="text-[9px] font-mono text-[#71717A] uppercase">
                    {task.category}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-green-400 font-bold">
                  {task.aegisPassRate}% Solve Rate
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{task.title}</h3>
              <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3 text-[10px] text-[#71717A]">
                <span>Baseline: <strong className="text-red-400">{task.baselinePassRate}%</strong></span>
                <span>Latency: <strong className="text-[#E4E4E7]">{task.latencySeconds}s</strong></span>
              </div>

              <button
                onClick={() => handleLaunchTask(task)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#18181B] hover:bg-amber-500 hover:text-black border border-[#27272A] text-amber-400 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Load in Harness</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

