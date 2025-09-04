
export type View = 'dashboard' | 'healthCheck' | 'marketAnalysis' | 'fundraising' | 'valuation' | 'documentAnalysis' | 'videoGenerator';

export interface FinancialMetrics {
  revenue: number;
  profitMargin: number;
  growthRate: number;
  debtToEquity: number;
  cashRunway: number;
}

export interface FinancialAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface BusinessValuation {
  valuationMin: number;
  valuationMax: number;
  methodology: string;
  commentary: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}