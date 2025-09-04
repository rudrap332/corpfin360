
import React, { useState } from 'react';
import Card from './common/Card';
import Select from './common/Select';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { getMarketTrendReport } from '../services/geminiService';
import { INDUSTRIES } from '../constants';

const MarketTrendAnalysis: React.FC = () => {
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!industry) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await getMarketTrendReport(industry);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  // A simple markdown to HTML converter
  const renderMarkdown = (text: string) => {
    const html = text
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/(\r\n|\n\r|\r|\n){2,}/g, '<br/><br/>'); // Preserve paragraphs
      
    // Wrap bullet points in a <ul>
    const listWrappedHtml = html.replace(/(<li.*<\/li>)+/gs, (match) => `<ul class="list-disc list-inside space-y-1">${match}</ul>`);

    return { __html: listWrappedHtml };
  };


  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Market Trend Analysis</h2>
        <p className="text-slate-600 mb-6">Select an industry to generate an AI-powered report on the latest market trends, opportunities, and threats.</p>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="w-full">
            <Select 
              label="Industry" 
              id="industry" 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
            >
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto flex-shrink-0">
            {loading ? <><LoadingSpinner className="mr-2" /> Generating...</> : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {error && <Card><p className="text-red-600 text-center">{error}</p></Card>}

      {report && (
        <Card>
          <h2 className="text-2xl font-bold text-brand-dark mb-4">Market Report: <span className="text-brand-primary">{industry}</span></h2>
          <div className="prose max-w-none text-slate-700" dangerouslySetInnerHTML={renderMarkdown(report)} />
        </Card>
      )}
    </div>
  );
};

export default MarketTrendAnalysis;
