import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get fundraising recommendations
router.post('/recommendations', async (req, res) => {
  try {
    const { companyData, fundraisingGoal, industry, stage } = req.body;
    
    if (!companyData || !fundraisingGoal) {
      return res.status(400).json({
        success: false,
        error: 'Company data and fundraising goal are required'
      });
    }

    // Generate fundraising recommendations based on company profile
    const recommendations = generateFundraisingRecommendations(companyData, fundraisingGoal, industry, stage);
    
    res.json({
      success: true,
      data: {
        recommendations,
        timeline: generateFundraisingTimeline(fundraisingGoal, stage),
        investorTypes: getInvestorTypes(stage, industry),
        valuationRange: estimateValuationRange(companyData, stage),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Fundraising recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get investor matching
router.post('/investor-matching', async (req, res) => {
  try {
    const { companyProfile, investmentCriteria } = req.body;
    
    if (!companyProfile) {
      return res.status(400).json({
        success: false,
        error: 'Company profile is required'
      });
    }

    // Mock investor database - in production this would query a real database
    const investors = getMatchingInvestors(companyProfile, investmentCriteria);
    
    res.json({
      success: true,
      data: {
        investors,
        matchScore: calculateMatchScore(companyProfile, investmentCriteria),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Investor matching error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get fundraising strategy
router.post('/strategy', async (req, res) => {
  try {
    const { companyData, fundraisingGoal, timeline, marketConditions } = req.body;
    
    if (!companyData || !fundraisingGoal) {
      return res.status(400).json({
        success: false,
        error: 'Company data and fundraising goal are required'
      });
    }

    const strategy = generateFundraisingStrategy(companyData, fundraisingGoal, timeline, marketConditions);
    
    res.json({
      success: true,
      data: {
        strategy,
        milestones: generateMilestones(fundraisingGoal, timeline),
        risks: identifyRisks(companyData, marketConditions),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Fundraising strategy error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate fundraising recommendations
function generateFundraisingRecommendations(companyData, goal, industry, stage) {
  const recommendations = [];
  
  // Stage-based recommendations
  if (stage === 'seed') {
    recommendations.push({
      type: 'Funding Source',
      recommendation: 'Focus on angel investors and early-stage VCs',
      reasoning: 'Seed stage companies need patient capital and mentorship',
      priority: 'High'
    });
  } else if (stage === 'series-a') {
    recommendations.push({
      type: 'Funding Source',
      recommendation: 'Target Series A VCs with industry expertise',
      reasoning: 'Series A investors provide growth capital and strategic support',
      priority: 'High'
    });
  }
  
  // Industry-specific recommendations
  if (industry === 'fintech') {
    recommendations.push({
      type: 'Regulatory',
      recommendation: 'Ensure compliance with financial regulations',
      reasoning: 'Fintech companies face strict regulatory requirements',
      priority: 'Medium'
    });
  }
  
  // Goal-based recommendations
  if (goal > 10000000) { // $10M+
    recommendations.push({
      type: 'Timeline',
      recommendation: 'Plan for 6-12 month fundraising process',
      reasoning: 'Large rounds require extensive due diligence',
      priority: 'Medium'
    });
  }
  
  return recommendations;
}

// Generate fundraising timeline
function generateFundraisingTimeline(goal, stage) {
  const baseTimeline = {
    preparation: '2-4 weeks',
    investorOutreach: '4-8 weeks',
    dueDiligence: '4-12 weeks',
    negotiation: '2-4 weeks',
    closing: '2-4 weeks'
  };
  
  if (goal > 10000000) {
    baseTimeline.dueDiligence = '8-16 weeks';
  }
  
  if (stage === 'seed') {
    baseTimeline.dueDiligence = '2-6 weeks';
  }
  
  return baseTimeline;
}

// Get investor types
function getInvestorTypes(stage, industry) {
  const investorTypes = {
    seed: ['Angel Investors', 'Early-stage VCs', 'Incubators', 'Accelerators'],
    'series-a': ['Series A VCs', 'Growth Investors', 'Strategic Investors'],
    'series-b': ['Growth VCs', 'Private Equity', 'Strategic Investors', 'Hedge Funds'],
    'series-c': ['Late-stage VCs', 'Private Equity', 'Hedge Funds', 'Sovereign Wealth Funds']
  };
  
  return investorTypes[stage] || investorTypes.seed;
}

// Estimate valuation range
function estimateValuationRange(companyData, stage) {
  const baseMultipliers = {
    seed: { min: 2, max: 5 },
    'series-a': { min: 5, max: 15 },
    'series-b': { min: 10, max: 30 },
    'series-c': { min: 20, max: 50 }
  };
  
  const multiplier = baseMultipliers[stage] || baseMultipliers.seed;
  const revenue = companyData.revenue || 1000000;
  
  return {
    min: revenue * multiplier.min,
    max: revenue * multiplier.max,
    methodology: `Revenue multiple approach for ${stage} stage companies`
  };
}

// Get matching investors
function getMatchingInvestors(companyProfile, criteria) {
  // Mock investor database
  const investors = [
    {
      name: 'TechVentures Capital',
      type: 'VC',
      focus: ['fintech', 'saas', 'ai'],
      investmentRange: { min: 1000000, max: 10000000 },
      stage: ['seed', 'series-a'],
      location: 'San Francisco',
      matchScore: 0.92
    },
    {
      name: 'Growth Partners Fund',
      type: 'Growth Equity',
      focus: ['b2b', 'enterprise'],
      investmentRange: { min: 5000000, max: 50000000 },
      stage: ['series-a', 'series-b'],
      location: 'New York',
      matchScore: 0.87
    }
  ];
  
  return investors.filter(investor => 
    investor.stage.includes(companyProfile.stage) &&
    investor.focus.some(focus => 
      companyProfile.industry.toLowerCase().includes(focus)
    )
  );
}

// Calculate match score
function calculateMatchScore(companyProfile, criteria) {
  // Simple scoring algorithm
  let score = 0.5; // Base score
  
  if (criteria.stage && companyProfile.stage === criteria.stage) {
    score += 0.2;
  }
  
  if (criteria.industry && companyProfile.industry === criteria.industry) {
    score += 0.2;
  }
  
  if (criteria.location && companyProfile.location === criteria.location) {
    score += 0.1;
  }
  
  return Math.min(score, 1.0);
}

// Generate fundraising strategy
function generateFundraisingStrategy(companyData, goal, timeline, marketConditions) {
  const strategy = {
    approach: 'Hybrid approach combining multiple funding sources',
    keyMessages: [
      'Strong market opportunity in growing industry',
      'Experienced team with proven track record',
      'Clear path to profitability and exit'
    ],
    fundingSources: ['VC Investment', 'Strategic Partnerships', 'Debt Financing'],
    successMetrics: [
      'Achieve funding goal within timeline',
      'Secure strategic investors',
      'Maintain company valuation'
    ]
  };
  
  if (marketConditions === 'bull') {
    strategy.approach = 'Aggressive approach with premium valuation';
  } else if (marketConditions === 'bear') {
    strategy.approach = 'Conservative approach with realistic valuation';
  }
  
  return strategy;
}

// Generate milestones
function generateMilestones(goal, timeline) {
  const milestones = [
    {
      phase: 'Preparation',
      duration: '2-4 weeks',
      deliverables: ['Financial model', 'Pitch deck', 'Data room']
    },
    {
      phase: 'Investor Outreach',
      duration: '4-8 weeks',
      deliverables: ['Investor list', 'Initial meetings', 'Term sheets']
    },
    {
      phase: 'Due Diligence',
      duration: '4-12 weeks',
      deliverables: ['Legal review', 'Financial audit', 'Market validation']
    },
    {
      phase: 'Closing',
      duration: '2-4 weeks',
      deliverables: ['Final agreements', 'Funds transfer', 'Board setup']
    }
  ];
  
  return milestones;
}

// Identify risks
function identifyRisks(companyData, marketConditions) {
  const risks = [
    {
      category: 'Market Risk',
      description: 'Market downturn affecting investor appetite',
      mitigation: 'Diversify funding sources and maintain strong fundamentals'
    },
    {
      category: 'Execution Risk',
      description: 'Failure to meet growth targets',
      mitigation: 'Set realistic milestones and maintain transparency'
    },
    {
      category: 'Competition Risk',
      description: 'New competitors entering the market',
      mitigation: 'Differentiate product and build strong moats'
    }
  ];
  
  if (marketConditions === 'bear') {
    risks.push({
      category: 'Funding Risk',
      description: 'Reduced investor appetite for risk',
      mitigation: 'Focus on profitability and unit economics'
    });
  }
  
  return risks;
}

export default router;
