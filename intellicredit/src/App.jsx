import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import DashboardLayout from './components/Layout/DashboardLayout';

// Placeholder Imports
import DataIngestionEngine from './modules/DataIngestion/DataIngestionEngine';
import DocumentIntelligenceEngine from './modules/DocumentIntelligence/DocumentIntelligenceEngine';
import GstBankAnalysis from './modules/CrossAnalysis/GstBankAnalysis';
import ResearchAgent from './modules/ResearchAgent/ResearchAgent';
import DueDiligencePortal from './modules/DueDiligence/DueDiligencePortal';
import RiskScoringEngine from './modules/RiskScoring/RiskScoringEngine';
import RecommendationEngine from './modules/Recommendation/RecommendationEngine';
import CAMGenerator from './modules/CAMGenerator/CAMGenerator';
import RiskCommandCenter from './modules/CommandCenter/RiskCommandCenter';
import ExplainableAIPanel from './modules/ExplainableAI/ExplainableAIPanel';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DataIngestionEngine />} />
          <Route path="document-intelligence" element={<DocumentIntelligenceEngine />} />
          <Route path="cross-analysis" element={<GstBankAnalysis />} />
          <Route path="research-agent" element={<ResearchAgent />} />
          <Route path="due-diligence" element={<DueDiligencePortal />} />
          <Route path="risk-scoring" element={<RiskScoringEngine />} />
          <Route path="recommendation" element={<RecommendationEngine />} />
          <Route path="cam-generator" element={<CAMGenerator />} />
          <Route path="command-center" element={<RiskCommandCenter />} />
          <Route path="explainable-ai" element={<ExplainableAIPanel />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;
