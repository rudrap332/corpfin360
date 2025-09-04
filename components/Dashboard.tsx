
import React from 'react';
import Card from './common/Card';
import { View } from '../types';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const toolCards = [
  {
    id: 'healthCheck',
    title: 'Financial Health Check',
    description: 'Get an AI-powered analysis of your company\'s financial strengths, weaknesses, and key recommendations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'marketAnalysis',
    title: 'Market Trend Analysis',
    description: 'Receive a concise report on market trends, opportunities, and threats relevant to your industry.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'documentAnalysis',
    title: 'Business Report Analysis',
    description: 'Upload a business document (.txt) to have an AI analyze, summarize, or extract key insights.',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'fundraising',
    title: 'Fundraising Advisor',
    description: 'Chat with an AI mentor to get practical advice on your startup\'s fundraising journey.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
      </svg>
    ),
  },
  {
    id: 'valuation',
    title: 'Valuation Estimator',
    description: 'Get a data-driven valuation estimate for your business based on key metrics and industry benchmarks.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
   {
    id: 'videoGenerator',
    title: 'AI Video Generation',
    description: 'Create a short, high-quality video from a text description. Ideal for marketing, social media, and presentations.',
    icon: (
       <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
    ),
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-brand-dark sm:text-5xl">
          Corporate Finance Intelligence Platform
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-600">
          AI-powered tools for SMEs and Startups to navigate the complexities of corporate finance with confidence.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toolCards.map((tool) => (
          <Card key={tool.id} onClick={() => onNavigate(tool.id as View)}>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">{tool.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-brand-dark">{tool.title}</h3>
                <p className="mt-1 text-slate-500">{tool.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;