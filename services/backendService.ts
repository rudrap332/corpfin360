import { FinancialMetrics, BusinessValuation, FinancialAnalysis, ChatMessage } from '../types';

// Backend API configuration
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000; // 30 seconds

// Authentication token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('authToken', token);
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('authToken');
};

// Generic API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const url = `${BACKEND_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...config,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please try again');
      }
      throw error;
    }
    throw new Error('Network error - please check your connection');
  }
};

// Financial Health Analysis
export interface FinancialHealthRequest {
  companyData: {
    revenue?: number;
    net_income?: number;
    total_assets?: number;
    total_liabilities?: number;
    current_assets?: number;
    current_liabilities?: number;
    cash?: number;
    revenue_growth?: number;
    profit_growth?: number;
    market_cap?: number;
    pe_ratio?: number;
    industry_avg_pe?: number;
    [key: string]: any;
  };
}

export interface FinancialHealthResponse {
  success: boolean;
  data: {
    health_score: number;
    risk_score: number;
    health_category: string;
    risk_category: string;
    recommendations: Array<{
      category: string;
      action: string;
      priority: string;
      description: string;
    }>;
    timestamp: string;
  };
}

export const analyzeFinancialHealth = async (request: FinancialHealthRequest): Promise<FinancialHealthResponse> => {
  return apiRequest('/api/financial-health/assess', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Business Valuation
export interface ValuationRequest {
  companyData: {
    revenue?: number;
    ebitda?: number;
    net_income?: number;
    total_assets?: number;
    total_equity?: number;
    revenue_growth?: number;
    profit_growth?: number;
    asset_growth?: number;
    market_cap?: number;
    pe_ratio?: number;
    pb_ratio?: number;
    industry_multiple?: number;
    market_conditions?: number;
    company_age?: number;
    [key: string]: any;
  };
  confidenceLevel?: number;
}

export interface ValuationResponse {
  success: boolean;
  data: {
    valuation: number;
    confidence_interval: {
      lower: number;
      upper: number;
      confidence: number;
    };
    ensemble_mean: number;
    ensemble_std: number;
    best_model: string;
    methodology: string[];
    valuation_range: {
      min: number;
      max: number;
    };
    insights: Array<{
      type: string;
      message: string;
      action: string;
    }>;
    timestamp: string;
  };
}

export const estimateBusinessValuation = async (request: ValuationRequest): Promise<ValuationResponse> => {
  return apiRequest('/api/valuation/estimate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Market Trend Analysis
export interface MarketTrendRequest {
  marketData: {
    current_price?: number;
    price_change?: number;
    price_change_percent?: number;
    volume?: number;
    volume_change?: number;
    moving_average_20?: number;
    moving_average_50?: number;
    rsi?: number;
    macd?: number;
    bollinger_upper?: number;
    bollinger_lower?: number;
    fear_greed_index?: number;
    vix?: number;
    interest_rate?: number;
    inflation_rate?: number;
    gdp_growth?: number;
    unemployment_rate?: number;
    sector_performance?: number;
    industry_trend?: number;
    [key: string]: any;
  };
  newsData?: Array<{
    headline: string;
    content: string;
  }>;
  predictionHorizon?: number;
}

export interface MarketTrendResponse {
  success: boolean;
  data: {
    price_predictions: Array<{
      day: number;
      predicted_price: number;
      confidence: number;
    }>;
    volatility_predictions: Array<{
      day: number;
      predicted_volatility: number;
      risk_level: string;
    }>;
    trend_direction: string;
    confidence_score: number;
    key_factors: string[];
    recommendations: Array<{
      type: string;
      confidence: number;
      reason: string;
      action: string;
    }>;
    timestamp: string;
  };
}

export const analyzeMarketTrends = async (request: MarketTrendRequest): Promise<MarketTrendResponse> => {
  return apiRequest('/api/market-analysis/trends', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Market Sentiment Analysis
export interface SentimentRequest {
  newsData?: Array<{
    headline: string;
    content: string;
  }>;
  socialMediaData?: Array<{
    text: string;
    platform: string;
    timestamp: string;
  }>;
}

export interface SentimentResponse {
  success: boolean;
  data: {
    sentiment_score: number;
    sentiment_category: string;
    key_topics: string[];
    confidence: number;
    timestamp: string;
  };
}

export const analyzeMarketSentiment = async (request: SentimentRequest): Promise<SentimentResponse> => {
  return apiRequest('/api/market-analysis/sentiment', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Market Volatility Forecast
export interface VolatilityRequest {
  marketData: MarketTrendRequest['marketData'];
  timeHorizon?: number;
}

export interface VolatilityResponse {
  success: boolean;
  data: {
    volatility_forecast: Array<{
      day: number;
      predicted_volatility: number;
      confidence_interval: {
        lower: number;
        upper: number;
      };
    }>;
    risk_assessment: string;
    recommendations: string[];
    timestamp: string;
  };
}

export const forecastMarketVolatility = async (request: VolatilityRequest): Promise<VolatilityResponse> => {
  return apiRequest('/api/market-analysis/volatility', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Document Analysis
export interface DocumentAnalysisRequest {
  documentType: 'financial_statement' | 'business_plan' | 'contract' | 'generic';
  content: string;
  metadata?: Record<string, any>;
}

export interface DocumentAnalysisResponse {
  success: boolean;
  data: {
    documentType: string;
    keyMetrics: Record<string, any>;
    insights: string[];
    risks: string[];
    recommendations: Array<{
      type: string;
      action: string;
      priority: string;
    }>;
    timestamp: string;
  };
}

export const analyzeDocument = async (request: DocumentAnalysisRequest): Promise<DocumentAnalysisResponse> => {
  return apiRequest('/api/document-analysis/analyze', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Data Extraction
export interface DataExtractionRequest {
  documentType: string;
  content: string;
  extractionFields: string[];
}

export interface DataExtractionResponse {
  success: boolean;
  data: {
    extractedData: Record<string, any>;
    confidence: number;
    timestamp: string;
  };
}

export const extractFinancialData = async (request: DataExtractionRequest): Promise<DataExtractionResponse> => {
  return apiRequest('/api/document-analysis/extract', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Video Generation
export interface VideoGenerationRequest {
  analysisData: any;
  videoType: 'financial_health' | 'business_valuation' | 'market_trends' | 'quarterly_review';
  preferences?: {
    duration?: string;
    style?: string;
    voice?: string;
  };
}

export interface VideoGenerationResponse {
  success: boolean;
  data: {
    id: string;
    type: string;
    status: string;
    estimatedDuration: string;
    sections: Array<{
      name: string;
      duration: string;
      content: string;
      visuals: string[];
    }>;
    assets: Array<{
      type: string;
      name: string;
      description: string;
      format: string;
      duration: string;
    }>;
    script: {
      introduction: string;
      mainContent: string[];
      conclusion: string;
      callToAction: string;
    };
    narration: {
      voice: string;
      pace: string;
      tone: string;
      segments: Array<{
        text: string;
        duration: string;
        visuals: string[];
      }>;
    };
    timeline: {
      scriptWriting: string;
      assetCreation: string;
      voiceRecording: string;
      videoEditing: string;
      finalReview: string;
      totalEstimated: string;
    };
    timestamp: string;
  };
}

export const generateFinancialVideo = async (request: VideoGenerationRequest): Promise<VideoGenerationResponse> => {
  return apiRequest('/api/video-generator/generate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// Fundraising Advisor
export interface FundraisingRequest {
  companyData: {
    revenue?: number;
    growth_rate?: number;
    industry?: string;
    stage?: string;
    [key: string]: any;
  };
  fundraisingGoal: number;
  industry?: string;
  stage?: 'seed' | 'series-a' | 'series-b' | 'series-c';
}

export interface FundraisingResponse {
  success: boolean;
  data: {
    recommendations: Array<{
      type: string;
      recommendation: string;
      reasoning: string;
      priority: string;
    }>;
    timeline: {
      preparation: string;
      investorOutreach: string;
      dueDiligence: string;
      negotiation: string;
      closing: string;
    };
    investorTypes: string[];
    valuationRange: {
      min: number;
      max: number;
      methodology: string;
    };
    timestamp: string;
  };
}

export const getFundraisingRecommendations = async (request: FundraisingRequest): Promise<FundraisingResponse> => {
  return apiRequest('/api/fundraising/recommendations', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

// ML Model Management
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  status: string;
  lastTrained: string;
  accuracy: string;
  features: string[];
  endpoint: string;
}

export const getAvailableModels = async (): Promise<{ success: boolean; data: ModelInfo[] }> => {
  return apiRequest('/api/ml-models');
};

export const getModelDetails = async (modelId: string): Promise<any> => {
  return apiRequest(`/api/ml-models/${modelId}`);
};

export const retrainModel = async (modelId: string, trainingData: any[], parameters?: Record<string, any>): Promise<any> => {
  return apiRequest(`/api/ml-models/${modelId}/retrain`, {
    method: 'POST',
    body: JSON.stringify({ trainingData, parameters }),
  });
};

// Data Management
export const getDataSources = async (): Promise<any> => {
  return apiRequest('/api/data/sources');
};

export const getDataQualityMetrics = async (): Promise<any> => {
  return apiRequest('/api/data/quality');
};

export const getDataSchema = async (dataType: string): Promise<any> => {
  return apiRequest(`/api/data/schema/${dataType}`);
};

export const getDataStatistics = async (): Promise<any> => {
  return apiRequest('/api/data/statistics');
};

// Health Check
export const checkBackendHealth = async (): Promise<{ status: string; timestamp: string; service: string }> => {
  return apiRequest('/health');
};

// Error handling utilities
export class BackendError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'BackendError';
  }
}

// Rate limiting and retry logic
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Batch processing utilities
export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 5,
  delay: number = 100
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // Add delay between batches to avoid overwhelming the API
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return results;
};

// Export all services
export const BackendServices = {
  // Financial Analysis
  analyzeFinancialHealth,
  estimateBusinessValuation,
  
  // Market Analysis
  analyzeMarketTrends,
  analyzeMarketSentiment,
  forecastMarketVolatility,
  
  // Document Processing
  analyzeDocument,
  extractFinancialData,
  
  // Video Generation
  generateFinancialVideo,
  
  // Fundraising
  getFundraisingRecommendations,
  
  // Model Management
  getAvailableModels,
  getModelDetails,
  retrainModel,
  
  // Data Management
  getDataSources,
  getDataQualityMetrics,
  getDataSchema,
  getDataStatistics,
  
  // System
  checkBackendHealth,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  
  // Utilities
  withRetry,
  processBatch,
};
