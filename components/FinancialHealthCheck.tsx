
import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { FinancialMetrics, FinancialAnalysis } from '../types';
import { analyzeFinancialHealth, FinancialHealthRequest, FinancialHealthResponse } from '../services/backendService';
import { useBackendState } from '../contexts/BackendContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinancialHealthCheck: React.FC = () => {
  const { isConnected } = useBackendState();
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    revenue: 500000,
    profitMargin: 15,
    growthRate: 20,
    debtToEquity: 0.5,
    cashRunway: 12,
  });
  const [analysis, setAnalysis] = useState<FinancialHealthResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setMetrics({ ...metrics, [name]: parseFloat(value) });
  };

  const handleSubmit = async () => {
    if (!isConnected) {
      setError('Backend is not connected. Please check your connection and try again.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const request: FinancialHealthRequest = {
        companyData: {
          revenue: metrics.revenue,
          net_income: (metrics.revenue * metrics.profitMargin) / 100,
          revenue_growth: metrics.growthRate,
          profit_growth: metrics.growthRate,
          // Add more comprehensive data for ML model
          total_assets: metrics.revenue * 2, // Estimate
          total_liabilities: (metrics.revenue * 2) * (metrics.debtToEquity / (1 + metrics.debtToEquity)),
          current_assets: metrics.revenue * 0.8, // Estimate
          current_liabilities: metrics.revenue * 0.4, // Estimate
          cash: metrics.revenue * (metrics.cashRunway / 12) * 0.1, // Estimate
        }
      };

      const result = await analyzeFinancialHealth(request);
      
      if (result.success) {
        setAnalysis(result.data);
      } else {
        setError('Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  const chartData = [
      { name: 'Profit Margin (%)', value: metrics.profitMargin },
      { name: 'Growth Rate (%)', value: metrics.growthRate },
      { name: 'Debt/Equity Ratio', value: metrics.debtToEquity },
      { name: 'Cash Runway (m)', value: metrics.cashRunway }
  ];



  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-brand-dark mb-4">Financial Health Check</h2>
              <p className="text-slate-600 mb-6">Enter your company's key financial metrics to receive an AI-driven health analysis.</p>
              <div className="space-y-4">
                  <Input label="Annual Revenue ($)" id="revenue" name="revenue" type="number" value={metrics.revenue} onChange={handleInputChange} />
                  <Input label="Net Profit Margin (%)" id="profitMargin" name="profitMargin" type="number" value={metrics.profitMargin} onChange={handleInputChange} />
                  <Input label="Year-over-Year Growth (%)" id="growthRate" name="growthRate" type="number" value={metrics.growthRate} onChange={handleInputChange} />
                  <Input label="Debt-to-Equity Ratio" id="debtToEquity" name="debtToEquity" type="number" step="0.1" value={metrics.debtToEquity} onChange={handleInputChange} />
                  <Input label="Cash Runway (Months)" id="cashRunway" name="cashRunway" type="number" value={metrics.cashRunway} onChange={handleInputChange} />
              </div>
              <Button onClick={handleSubmit} disabled={loading} className="mt-6 w-full">
                  {loading ? <><LoadingSpinner className="mr-2" /> Analyzing...</> : 'Analyze Financial Health'}
              </Button>
            </div>
            <div className="flex flex-col justify-center">
                 <h3 className="text-xl font-semibold text-center mb-4 text-brand-dark">Metrics Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#1d4ed8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </Card>

      {error && <Card><p className="text-red-600 text-center">{error}</p></Card>}
      
      {analysis && (
        <Card>
          <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">ML-Powered Financial Health Analysis</h2>
          
          {/* Health Score and Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border">
              <div className="text-4xl font-bold text-green-600 mb-2">{analysis.health_score.toFixed(1)}</div>
              <div className="text-lg font-semibold text-green-700 mb-1">Health Score</div>
              <div className="text-sm text-green-600">{analysis.health_category}</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border">
              <div className="text-4xl font-bold text-red-600 mb-2">{analysis.risk_score.toFixed(1)}</div>
              <div className="text-lg font-semibold text-red-700 mb-1">Risk Score</div>
              <div className="text-sm text-red-600">{analysis.risk_category}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-brand-dark">AI Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'border-red-500 bg-red-50' :
                  rec.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{rec.category}</div>
                      <div className="text-gray-700 mt-1">{rec.description}</div>
                      <div className="text-sm text-gray-500 mt-2">Action: {rec.action}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timestamp */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Analysis completed at: {new Date(analysis.timestamp).toLocaleString()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinancialHealthCheck;
