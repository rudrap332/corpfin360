
import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Select from './common/Select';
import Button from './common/Button';
import LoadingSpinner from './common/LoadingSpinner';
import { getBusinessValuation } from '../services/geminiService';
import { INDUSTRIES } from '../constants';
import { BusinessValuation } from '../types';

const ValuationEstimator: React.FC = () => {
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [revenue, setRevenue] = useState<number>(1000000);
  const [growthRate, setGrowthRate] = useState<number>(50);
  const [valuation, setValuation] = useState<BusinessValuation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setValuation(null);
    try {
      const result = await getBusinessValuation(industry, revenue, growthRate);
      setValuation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Business Valuation Estimator</h2>
        <p className="text-slate-600 mb-6">Provide your key metrics to get an AI-driven pre-money valuation estimate for your startup.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Input 
            label="Annual Recurring Revenue ($)" 
            id="revenue" 
            type="number" 
            value={revenue} 
            onChange={(e) => setRevenue(parseFloat(e.target.value))} 
          />
          <Input 
            label="Year-over-Year Growth Rate (%)" 
            id="growthRate" 
            type="number" 
            value={growthRate} 
            onChange={(e) => setGrowthRate(parseFloat(e.target.value))} 
          />
          <div className="w-full">
            <Select 
              label="Industry" 
              id="industry-valuation" 
              value={industry} 
              onChange={(e) => setIndustry(e.target.value)}
            >
              {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? <><LoadingSpinner className="mr-2" /> Estimating...</> : 'Estimate Valuation'}
          </Button>
        </div>
      </Card>

      {error && <Card><p className="text-red-600 text-center">{error}</p></Card>}

      {valuation && (
        <Card>
            <div className="text-center">
                <h3 className="text-lg font-medium text-slate-500">Estimated Pre-Money Valuation</h3>
                <p className="text-4xl sm:text-5xl font-extrabold text-brand-primary my-2">
                    {formatCurrency(valuation.valuationMin)} - {formatCurrency(valuation.valuationMax)}
                </p>
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Methodology</h4>
                    <p className="text-slate-600">{valuation.methodology}</p>
                </div>
                 <div>
                    <h4 className="text-lg font-semibold text-brand-dark mb-2">Commentary</h4>
                    <p className="text-slate-600">{valuation.commentary}</p>
                </div>
            </div>
             <p className="text-center text-xs text-slate-400 mt-8">Disclaimer: This valuation is an estimate for informational purposes only and should not be considered financial advice.</p>
        </Card>
      )}
    </div>
  );
};

export default ValuationEstimator;
