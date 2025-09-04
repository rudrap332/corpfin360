import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Analyze financial documents
router.post('/analyze', async (req, res) => {
  try {
    const { documentType, content, metadata } = req.body;
    
    if (!documentType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Document type and content are required'
      });
    }

    // Analyze document based on type
    const analysis = await analyzeDocument(documentType, content, metadata);
    
    res.json({
      success: true,
      data: {
        ...analysis,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Document analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Extract financial data from documents
router.post('/extract', async (req, res) => {
  try {
    const { documentType, content, extractionFields } = req.body;
    
    if (!documentType || !content) {
      return res.status(400).json({
        success: false,
        error: 'Document type and content are required'
      });
    }

    // Extract specific fields from document
    const extractedData = await extractFinancialData(documentType, content, extractionFields);
    
    res.json({
      success: true,
      data: {
        extractedData,
        confidence: calculateExtractionConfidence(extractedData),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Data extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Compare documents
router.post('/compare', async (req, res) => {
  try {
    const { documents, comparisonType } = req.body;
    
    if (!documents || !Array.isArray(documents) || documents.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 documents are required for comparison'
      });
    }

    // Compare documents
    const comparison = await compareDocuments(documents, comparisonType);
    
    res.json({
      success: true,
      data: {
        comparison,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Document comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get document templates
router.get('/templates/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    const templates = getDocumentTemplates(type);
    
    res.json({
      success: true,
      data: {
        type,
        templates,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Analyze document content
async function analyzeDocument(documentType, content, metadata) {
  const analysis = {
    documentType,
    keyMetrics: {},
    insights: [],
    risks: [],
    recommendations: []
  };

  switch (documentType) {
    case 'financial_statement':
      analysis.keyMetrics = analyzeFinancialStatement(content);
      analysis.insights = generateFinancialInsights(analysis.keyMetrics);
      analysis.risks = identifyFinancialRisks(analysis.keyMetrics);
      break;
      
    case 'business_plan':
      analysis.keyMetrics = analyzeBusinessPlan(content);
      analysis.insights = generateBusinessInsights(analysis.keyMetrics);
      analysis.risks = identifyBusinessRisks(analysis.keyMetrics);
      break;
      
    case 'contract':
      analysis.keyMetrics = analyzeContract(content);
      analysis.insights = generateContractInsights(analysis.keyMetrics);
      analysis.risks = identifyContractRisks(analysis.keyMetrics);
      break;
      
    default:
      analysis.keyMetrics = analyzeGenericDocument(content);
      analysis.insights = generateGenericInsights(analysis.keyMetrics);
  }

  analysis.recommendations = generateRecommendations(analysis);
  
  return analysis;
}

// Analyze financial statement
function analyzeFinancialStatement(content) {
  // Mock analysis - in production this would use NLP/ML
  const metrics = {
    revenue: extractNumericValue(content, 'revenue'),
    profit: extractNumericValue(content, 'profit'),
    assets: extractNumericValue(content, 'assets'),
    liabilities: extractNumericValue(content, 'liabilities'),
    cashFlow: extractNumericValue(content, 'cash flow'),
    growthRate: calculateGrowthRate(content)
  };

  return metrics;
}

// Analyze business plan
function analyzeBusinessPlan(content) {
  const metrics = {
    marketSize: extractMarketSize(content),
    competitiveAdvantage: extractCompetitiveAdvantage(content),
    revenueProjections: extractRevenueProjections(content),
    fundingNeeds: extractFundingNeeds(content),
    timeline: extractTimeline(content)
  };

  return metrics;
}

// Analyze contract
function analyzeContract(content) {
  const metrics = {
    contractValue: extractContractValue(content),
    duration: extractContractDuration(content),
    obligations: extractObligations(content),
    penalties: extractPenalties(content),
    terminationClauses: extractTerminationClauses(content)
  };

  return metrics;
}

// Extract financial data
async function extractFinancialData(documentType, content, extractionFields) {
  const extractedData = {};
  
  for (const field of extractionFields) {
    switch (field) {
      case 'revenue':
        extractedData.revenue = extractNumericValue(content, 'revenue');
        break;
      case 'profit':
        extractedData.profit = extractNumericValue(content, 'profit');
        break;
      case 'assets':
        extractedData.assets = extractNumericValue(content, 'assets');
        break;
      case 'liabilities':
        extractedData.liabilities = extractNumericValue(content, 'liabilities');
        break;
      case 'cash_flow':
        extractedData.cashFlow = extractNumericValue(content, 'cash flow');
        break;
      case 'growth_rate':
        extractedData.growthRate = calculateGrowthRate(content);
        break;
      default:
        extractedData[field] = extractGenericField(content, field);
    }
  }
  
  return extractedData;
}

// Compare documents
async function compareDocuments(documents, comparisonType) {
  const comparison = {
    type: comparisonType,
    similarities: [],
    differences: [],
    summary: ''
  };

  if (comparisonType === 'financial') {
    comparison.similarities = findFinancialSimilarities(documents);
    comparison.differences = findFinancialDifferences(documents);
  } else if (comparisonType === 'structure') {
    comparison.similarities = findStructuralSimilarities(documents);
    comparison.differences = findStructuralDifferences(documents);
  }

  comparison.summary = generateComparisonSummary(comparison);
  
  return comparison;
}

// Get document templates
function getDocumentTemplates(type) {
  const templates = {
    financial_statement: [
      {
        name: 'Income Statement Template',
        description: 'Standard income statement format',
        fields: ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Net Income']
      },
      {
        name: 'Balance Sheet Template',
        description: 'Standard balance sheet format',
        fields: ['Assets', 'Liabilities', 'Equity']
      }
    ],
    business_plan: [
      {
        name: 'Executive Summary Template',
        description: 'Business plan executive summary',
        fields: ['Problem Statement', 'Solution', 'Market Opportunity', 'Business Model', 'Financial Projections']
      }
    ],
    contract: [
      {
        name: 'Service Agreement Template',
        description: 'Standard service agreement',
        fields: ['Parties', 'Services', 'Payment Terms', 'Termination', 'Liability']
      }
    ]
  };

  return templates[type] || [];
}

// Helper functions
function extractNumericValue(content, field) {
  // Mock extraction - in production this would use regex/NLP
  const patterns = {
    revenue: /revenue[:\s]*\$?([\d,]+)/i,
    profit: /profit[:\s]*\$?([\d,]+)/i,
    assets: /assets[:\s]*\$?([\d,]+)/i,
    liabilities: /liabilities[:\s]*\$?([\d,]+)/i,
    'cash flow': /cash\s*flow[:\s]*\$?([\d,]+)/i
  };

  const pattern = patterns[field];
  if (pattern) {
    const match = content.match(pattern);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }
  
  return null;
}

function calculateGrowthRate(content) {
  // Mock calculation
  return Math.random() * 0.5; // 0-50% growth
}

function extractMarketSize(content) {
  // Mock extraction
  return Math.random() * 1000000000; // 0-1B market size
}

function extractCompetitiveAdvantage(content) {
  // Mock extraction
  const advantages = ['Technology', 'Network Effects', 'Brand', 'Cost Structure'];
  return advantages[Math.floor(Math.random() * advantages.length)];
}

function extractRevenueProjections(content) {
  // Mock extraction
  return {
    year1: Math.random() * 1000000,
    year2: Math.random() * 2000000,
    year3: Math.random() * 5000000
  };
}

function extractFundingNeeds(content) {
  // Mock extraction
  return Math.random() * 10000000;
}

function extractTimeline(content) {
  // Mock extraction
  return Math.floor(Math.random() * 24) + 6; // 6-30 months
}

function extractContractValue(content) {
  // Mock extraction
  return Math.random() * 1000000;
}

function extractContractDuration(content) {
  // Mock extraction
  return Math.floor(Math.random() * 60) + 12; // 12-72 months
}

function extractObligations(content) {
  // Mock extraction
  return ['Deliverables', 'Timeline', 'Quality Standards'];
}

function extractPenalties(content) {
  // Mock extraction
  return Math.random() * 100000;
}

function extractTerminationClauses(content) {
  // Mock extraction
  return ['30-day notice', 'Immediate for cause', 'Payment of outstanding amounts'];
}

function extractGenericField(content, field) {
  // Generic field extraction
  return content.includes(field) ? 'Found' : 'Not found';
}

function findFinancialSimilarities(documents) {
  // Mock similarity analysis
  return ['Revenue structure', 'Cost structure', 'Profit margins'];
}

function findFinancialDifferences(documents) {
  // Mock difference analysis
  return ['Growth rates', 'Market positioning', 'Risk profiles'];
}

function findStructuralSimilarities(documents) {
  // Mock structural analysis
  return ['Document format', 'Section organization', 'Key metrics'];
}

function findStructuralDifferences(documents) {
  // Mock structural analysis
  return ['Detail level', 'Presentation style', 'Information depth'];
}

function generateComparisonSummary(comparison) {
  return `Analysis found ${comparison.similarities.length} similarities and ${comparison.differences.length} differences between the documents.`;
}

function generateFinancialInsights(metrics) {
  const insights = [];
  
  if (metrics.revenue && metrics.profit) {
    const margin = metrics.profit / metrics.revenue;
    if (margin > 0.2) {
      insights.push('Strong profitability with high profit margins');
    } else if (margin < 0.05) {
      insights.push('Low profit margins indicate need for cost optimization');
    }
  }
  
  if (metrics.growthRate > 0.3) {
    insights.push('High growth rate suggests strong market demand');
  }
  
  return insights;
}

function generateBusinessInsights(metrics) {
  const insights = [];
  
  if (metrics.marketSize > 1000000000) {
    insights.push('Large market opportunity with significant growth potential');
  }
  
  if (metrics.competitiveAdvantage) {
    insights.push(`Strong competitive advantage in ${metrics.competitiveAdvantage}`);
  }
  
  return insights;
}

function generateContractInsights(metrics) {
  const insights = [];
  
  if (metrics.contractValue > 500000) {
    insights.push('High-value contract with significant revenue impact');
  }
  
  if (metrics.penalties > 100000) {
    insights.push('High penalty clauses require careful risk management');
  }
  
  return insights;
}

function generateGenericInsights(metrics) {
  return ['Document contains relevant information', 'Key metrics identified'];
}

function identifyFinancialRisks(metrics) {
  const risks = [];
  
  if (metrics.liabilities > metrics.assets * 0.8) {
    risks.push('High debt-to-asset ratio indicates financial risk');
  }
  
  if (metrics.cashFlow < 0) {
    risks.push('Negative cash flow requires immediate attention');
  }
  
  return risks;
}

function identifyBusinessRisks(metrics) {
  const risks = [];
  
  if (metrics.fundingNeeds > 5000000) {
    risks.push('High funding requirements may limit growth options');
  }
  
  return risks;
}

function identifyContractRisks(metrics) {
  const risks = [];
  
  if (metrics.penalties > metrics.contractValue * 0.2) {
    risks.push('High penalty clauses relative to contract value');
  }
  
  return risks;
}

function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.risks.length > 0) {
    recommendations.push({
      type: 'Risk Mitigation',
      action: 'Address identified risks promptly',
      priority: 'High'
    });
  }
  
  if (analysis.insights.length > 0) {
    recommendations.push({
      type: 'Opportunity',
      action: 'Leverage positive insights for strategic planning',
      priority: 'Medium'
    });
  }
  
  return recommendations;
}

function calculateExtractionConfidence(extractedData) {
  // Mock confidence calculation
  const confidence = Object.values(extractedData).filter(v => v !== null).length / Object.keys(extractedData).length;
  return Math.round(confidence * 100);
}

export default router;
