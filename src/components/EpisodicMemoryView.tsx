import React, { useState } from 'react';
import { useAegis } from '../context/AegisContext';
import { FailureMemoryItem } from '../types';
import { 
  BrainCircuit, 
  Search, 
  Plus, 
  Tag, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  FileCode2, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

export const EpisodicMemoryView: React.FC = () => {
  const { memoryItems, searchMemory, addMemoryRecord, setActiveTask } = useAegis();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMemory, setSelectedMemory] = useState<FailureMemoryItem>(memoryItems[0]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const filtered = searchMemory(searchTerm);

  const [newTitle, setNewTitle] = useState('');
  const [newTrace, setNewTrace] = useState('');
  const [newRootCause, setNewRootCause] = useState('');
  const [newFix, setNewFix] = useState('');

  const handleAddRecord = () => {
    if (!newTitle.trim()) return;
    const newItem: FailureMemoryItem = {
      id: `mem-${Date.now().toString().slice(-4)}`,
      taskTitle: newTitle,
      language: 'Python',
      failureCategory: 'logic_flaw',
      errorTrace: newTrace || 'Custom execution error trace',
      rootCause: newRootCause || 'Identified causal link in logic flow',
      fixDiff: newFix || '+ Applied verified patch diff',
      regressionTestSummary: 'PASSED (0 Regressions)',
      retrievalCount: 1,
      similarityScore: 0.95,
      timestamp: new Date().toISOString(),
      tags: ['custom-experience', 'self-evolving']
    };
    addMemoryRecord(newItem);
    setSelectedMemory(newItem);
    setShowAddModal(false);
    setNewTitle('');
    setNewTrace('');
    setNewRootCause('');
    setNewFix('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold">
                Experience Index
              </span>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <span>Episodic Failure Memory & Semantic Experience Graph</span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Structured Failure-to-Patch knowledge graph storing exact causal traces, AST root causes, unified diffs, and regression verification histories.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold font-mono transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Experience</span>
            </button>
          </div>
        </div>
      </div>

      {/* Semantic Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search failure memories by task symptom, error trace, keyword (e.g., 'jwt', 'redis race', 'ssrf', 'weakref')..."
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
        />
      </div>

      {/* Memory Explorer Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 5: Memory List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
          <div className="text-[11px] font-mono text-slate-400 px-1 flex justify-between">
            <span>INDEXED FAILURE NODES ({filtered.length})</span>
            <span>SIMILARITY RANKED</span>
          </div>

          {filtered.map((item) => {
            const isSelected = selectedMemory?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedMemory(item)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-md shadow-purple-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {item.language}
                  </span>
                  <span className="text-[10px] font-mono text-purple-300">
                    Retrieval Score: {((item.similarityScore || 0.95) * 100).toFixed(0)}%
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
                  {item.taskTitle}
                </h4>

                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {item.rootCause}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-purple-400" />
                    <span>{item.tags.join(', ')}</span>
                  </div>
                  <span>{item.retrievalCount} hits</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7: Deep Memory Node Inspector */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
          {selectedMemory ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    Memory Node: {selectedMemory.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-1">
                    {selectedMemory.taskTitle}
                  </h3>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Category: {selectedMemory.failureCategory}</span>
                </div>
              </div>

              {/* Memory Structure: Task -> Failure -> Root Cause -> Fix -> Test Result */}
              <div className="space-y-3 font-mono text-xs">
                {/* 1. Failure Trace */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-rose-400 font-bold uppercase text-[10.5px]">1. Historical Failure Trace:</span>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    {selectedMemory.errorTrace}
                  </p>
                </div>

                {/* 2. Isolated Root Cause */}
                <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/30 space-y-1">
                  <span className="text-amber-400 font-bold uppercase text-[10.5px]">2. Isolated Root Cause:</span>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    {selectedMemory.rootCause}
                  </p>
                </div>

                {/* 3. Applied Unified Diff */}
                <div className="p-3 bg-slate-950 rounded-lg border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 font-bold uppercase text-[10.5px]">3. Applied Patch Diff (Invariant Preserving):</span>
                  <div className="text-emerald-300 text-[11.5px] whitespace-pre-wrap">
                    {selectedMemory.fixDiff}
                  </div>
                </div>

                {/* 4. Regression Verification */}
                <div className="p-3 bg-slate-950 rounded-lg border border-cyan-500/30 space-y-1">
                  <span className="text-cyan-400 font-bold uppercase text-[10.5px]">4. Automated Regression Verification:</span>
                  <p className="text-slate-300 text-[11.5px]">
                    {selectedMemory.regressionTestSummary}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 font-mono text-xs">
              Select a memory node to inspect failure graph details.
            </div>
          )}
        </div>
      </div>

      {/* Ingest Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-lg w-full space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <span>Ingest New Experience Node</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Task Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Fix memory leak in async queue processor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Failure Trace / Error:</label>
                <textarea
                  value={newTrace}
                  onChange={(e) => setNewTrace(e.target.value)}
                  placeholder="Paste error logs..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Root Cause Explanation:</label>
                <textarea
                  value={newRootCause}
                  onChange={(e) => setNewRootCause(e.target.value)}
                  placeholder="Why did this failure occur?"
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Verified Patch Diff:</label>
                <textarea
                  value={newFix}
                  onChange={(e) => setNewFix(e.target.value)}
                  placeholder="+ Diff patch lines..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecord}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
              >
                Index Node
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
