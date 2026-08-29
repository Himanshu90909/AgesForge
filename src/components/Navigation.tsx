import React from 'react';
import { useAegis, ActiveTab } from '../context/AegisContext';
import { 
  GitBranch, 
  SearchCode, 
  ShieldAlert, 
  Cpu, 
  BarChart3, 
  BrainCircuit, 
  Microscope, 
  RefreshCw, 
  Network, 
  Trophy 
} from 'lucide-react';

interface TabItem {
  id: ActiveTab;
  label: string;
  badge?: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: 'harness', label: '01_HARNESS_DAG', badge: 'RUN', icon: GitBranch },
  { id: 'failure_intel', label: '02_FAILURE_INTEL', badge: 'AST', icon: SearchCode },
  { id: 'sandbox', label: '03_ADAPTIVE_SANDBOX', badge: 'RISK', icon: ShieldAlert },
  { id: 'rust_engine', label: '04_RUST_CORE', badge: '0.18ms', icon: Cpu },
  { id: 'performance_lab', label: '05_PERF_EVALS', badge: '88.6%', icon: BarChart3 },
  { id: 'episodic_memory', label: '06_EXPERIENCE_GRAPH', badge: 'MEM', icon: BrainCircuit },
  { id: 'regression_lab', label: '07_REGRESSION_GATE', badge: '4-TIER', icon: Microscope },
  { id: 'self_improvement', label: '08_SELF_EVOLUTION', badge: 'A/B', icon: RefreshCw },
  { id: 'distributed_fleet', label: '09_AGENT_FLEET', badge: 'CLUSTER', icon: Network },
  { id: 'benchmark_suite', label: '10_AEGIS_BENCH', badge: '500+', icon: Trophy },
];

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab } = useAegis();

  return (
    <nav className="border-b border-[#27272A] bg-[#09090B] px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest whitespace-nowrap transition cursor-pointer relative ${
                isActive
                  ? 'bg-[#18181B] text-cyan-400 border border-[#27272A] border-b-cyan-500 font-semibold'
                  : 'text-[#71717A] hover:text-[#E4E4E7] hover:bg-[#121215] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-[#71717A]'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] font-mono px-1 py-0.2 ${
                  isActive 
                    ? 'bg-cyan-500 text-black font-bold' 
                    : 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
