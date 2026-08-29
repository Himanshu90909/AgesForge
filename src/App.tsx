import React from 'react';
import { AegisProvider, useAegis } from './context/AegisContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AgentHarnessView } from './components/AgentHarnessView';
import { FailureIntelligenceView } from './components/FailureIntelligenceView';
import { AdaptiveSandboxView } from './components/AdaptiveSandboxView';
import { RustEngineView } from './components/RustEngineView';
import { PerformanceLabView } from './components/PerformanceLabView';
import { EpisodicMemoryView } from './components/EpisodicMemoryView';
import { RegressionLabView } from './components/RegressionLabView';
import { SelfImprovementLoopView } from './components/SelfImprovementLoopView';
import { DistributedFleetView } from './components/DistributedFleetView';
import { AegisBenchView } from './components/AegisBenchView';
import { TaskModal } from './components/TaskModal';
import { ResumeArtifactModal } from './components/ResumeArtifactModal';

const MainContent: React.FC = () => {
  const { activeTab } = useAegis();

  return (
    <main className="max-w-7xl mx-auto px-4 py-5 flex-grow">
      {activeTab === 'harness' && <AgentHarnessView />}
      {activeTab === 'failure_intel' && <FailureIntelligenceView />}
      {activeTab === 'sandbox' && <AdaptiveSandboxView />}
      {activeTab === 'rust_engine' && <RustEngineView />}
      {activeTab === 'performance_lab' && <PerformanceLabView />}
      {activeTab === 'episodic_memory' && <EpisodicMemoryView />}
      {activeTab === 'regression_lab' && <RegressionLabView />}
      {activeTab === 'self_improvement' && <SelfImprovementLoopView />}
      {activeTab === 'distributed_fleet' && <DistributedFleetView />}
      {activeTab === 'benchmark_suite' && <AegisBenchView />}
    </main>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="px-6 py-2.5 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-[#71717A] bg-[#09090B] mt-8 gap-2">
      <div className="flex items-center space-x-3 tracking-wider">
        <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>NODE: PROD-NORTH-01</span>
        <span className="text-[#3F3F46]">//</span>
        <span>K8S: ACTIVE</span>
        <span className="text-[#3F3F46]">//</span>
        <span>CLUSTER: US-EAST-1</span>
      </div>
      <div className="flex items-center space-x-3 tracking-wider">
        <span className="text-[#A1A1AA]">AEGIS_OS_RELIABILITY_SCORE: <span className="text-cyan-400 font-semibold">99.982%</span></span>
        <span className="text-[#3F3F46]">//</span>
        <span className="text-[#71717A]">CGROUPS_V2: ENFORCED</span>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <AegisProvider>
      <div className="min-h-screen bg-[#09090B] text-[#E4E4E7] font-sans selection:bg-cyan-500 selection:text-black flex flex-col">
        <Header />
        <Navigation />
        <MainContent />
        <Footer />
        <TaskModal />
        <ResumeArtifactModal />
      </div>
    </AegisProvider>
  );
}
