
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FinancialHealthCheck from './components/FinancialHealthCheck';
import MarketTrendAnalysis from './components/MarketTrendAnalysis';
import FundraisingAdvisor from './components/FundraisingAdvisor';
import ValuationEstimator from './components/ValuationEstimator';
import DocumentAnalysis from './components/DocumentAnalysis';
import VideoGenerator from './components/VideoGenerator';
import { View } from './types';
import { BackendProvider } from './contexts/BackendContext';
import BackendStatus from './components/common/BackendStatus';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const handleNavigate = useCallback((view: View) => {
    setActiveView(view);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'healthCheck':
        return <FinancialHealthCheck />;
      case 'marketAnalysis':
        return <MarketTrendAnalysis />;
      case 'fundraising':
        return <FundraisingAdvisor />;
      case 'valuation':
        return <ValuationEstimator />;
      case 'documentAnalysis':
        return <DocumentAnalysis />;
      case 'videoGenerator':
        return <VideoGenerator />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <BackendProvider>
      <div className="min-h-screen bg-slate-50 font-sans text-brand-dark">
        <Header onNavigate={handleNavigate} activeView={activeView} />
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Backend Status Bar */}
            <div className="mb-6">
              <BackendStatus />
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </BackendProvider>
  );
};

export default App;