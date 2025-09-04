import express from 'express';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get data sources
router.get('/sources', async (req, res) => {
  try {
    const sources = getDataSources();
    
    res.json({
      success: true,
      data: {
        sources,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get data sources error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get data quality metrics
router.get('/quality', async (req, res) => {
  try {
    const qualityMetrics = await getDataQualityMetrics();
    
    res.json({
      success: true,
      data: {
        qualityMetrics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get data quality error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get data schema
router.get('/schema/:dataType', async (req, res) => {
  try {
    const { dataType } = req.params;
    
    const schema = getDataSchema(dataType);
    
    res.json({
      success: true,
      data: {
        dataType,
        schema,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get data schema error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get data statistics
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await getDataStatistics();
    
    res.json({
      success: true,
      data: {
        statistics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Get data statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get data sources
function getDataSources() {
  return [
    {
      id: 'financial_markets',
      name: 'Financial Markets Data',
      description: 'Real-time and historical market data',
      type: 'API',
      provider: 'Multiple (Yahoo Finance, Alpha Vantage, etc.)',
      updateFrequency: 'Real-time',
      coverage: 'Global markets, stocks, bonds, commodities',
      reliability: 'High',
      cost: 'Variable'
    },
    {
      id: 'company_financials',
      name: 'Company Financial Statements',
      description: 'Quarterly and annual financial reports',
      type: 'Database',
      provider: 'SEC, Company filings',
      updateFrequency: 'Quarterly',
      coverage: 'US public companies',
      reliability: 'High',
      cost: 'Free'
    },
    {
      id: 'economic_indicators',
      name: 'Economic Indicators',
      description: 'GDP, inflation, employment, interest rates',
      type: 'API',
      provider: 'Federal Reserve, BLS, BEA',
      updateFrequency: 'Monthly/Quarterly',
      coverage: 'US economy',
      reliability: 'High',
      cost: 'Free'
    },
    {
      id: 'news_sentiment',
      name: 'News and Social Media',
      description: 'Financial news and social media sentiment',
      type: 'API',
      provider: 'News APIs, Social media platforms',
      updateFrequency: 'Real-time',
      coverage: 'Global',
      reliability: 'Medium',
      cost: 'Variable'
    },
    {
      id: 'alternative_data',
      name: 'Alternative Data',
      description: 'Satellite imagery, credit card data, web traffic',
      type: 'API',
      provider: 'Specialized providers',
      updateFrequency: 'Daily/Weekly',
      coverage: 'Select companies/industries',
      reliability: 'Medium',
      cost: 'High'
    }
  ];
}

// Get data quality metrics
async function getDataQualityMetrics() {
  // Mock quality metrics - in production this would query actual data
  return {
    overall: {
      score: 87.5,
      grade: 'B+',
      lastUpdated: new Date().toISOString()
    },
    completeness: {
      score: 92.0,
      description: 'Data completeness across all sources',
      issues: ['Missing quarterly data for some small caps']
    },
    accuracy: {
      score: 89.0,
      description: 'Data accuracy and validation',
      issues: ['Some market data delays during high volatility']
    },
    consistency: {
      score: 85.0,
      description: 'Data consistency across sources',
      issues: ['Different reporting standards between sources']
    },
    timeliness: {
      score: 88.0,
      description: 'Data freshness and update frequency',
      issues: ['End-of-day data for some international markets']
    },
    reliability: {
      score: 90.0,
      description: 'Data source reliability and uptime',
      issues: ['Occasional API rate limiting']
    }
  };
}

// Get data schema
function getDataSchema(dataType) {
  const schemas = {
    financial_statement: {
      fields: [
        {
          name: 'company_id',
          type: 'string',
          description: 'Unique company identifier',
          required: true,
          example: 'AAPL'
        },
        {
          name: 'period',
          type: 'string',
          description: 'Financial period (Q1, Q2, Q3, Q4, Annual)',
          required: true,
          example: 'Q1'
        },
        {
          name: 'year',
          type: 'integer',
          description: 'Financial year',
          required: true,
          example: 2024
        },
        {
          name: 'revenue',
          type: 'number',
          description: 'Total revenue in USD',
          required: false,
          example: 119575000000
        },
        {
          name: 'net_income',
          type: 'number',
          description: 'Net income in USD',
          required: false,
          example: 33916000000
        },
        {
          name: 'total_assets',
          type: 'number',
          description: 'Total assets in USD',
          required: false,
          example: 352755000000
        },
        {
          name: 'total_liabilities',
          type: 'number',
          description: 'Total liabilities in USD',
          required: false,
          example: 287912000000
        }
      ],
      relationships: [
        {
          from: 'company_id',
          to: 'companies.id',
          type: 'foreign_key'
        }
      ]
    },
    market_data: {
      fields: [
        {
          name: 'symbol',
          type: 'string',
          description: 'Stock symbol',
          required: true,
          example: 'AAPL'
        },
        {
          name: 'timestamp',
          type: 'datetime',
          description: 'Data timestamp',
          required: true,
          example: '2024-01-15T16:00:00Z'
        },
        {
          name: 'open',
          type: 'number',
          description: 'Opening price',
          required: true,
          example: 185.59
        },
        {
          name: 'high',
          type: 'number',
          description: 'High price',
          required: true,
          example: 186.12
        },
        {
          name: 'low',
          type: 'number',
          description: 'Low price',
          required: true,
          example: 184.93
        },
        {
          name: 'close',
          type: 'number',
          description: 'Closing price',
          required: true,
          example: 185.14
        },
        {
          name: 'volume',
          type: 'integer',
          description: 'Trading volume',
          required: true,
          example: 52345678
        }
      ],
      relationships: [
        {
          from: 'symbol',
          to: 'companies.symbol',
          type: 'foreign_key'
        }
      ]
    },
    economic_indicator: {
      fields: [
        {
          name: 'indicator_id',
          type: 'string',
          description: 'Economic indicator identifier',
          required: true,
          example: 'GDP'
        },
        {
          name: 'date',
          type: 'date',
          description: 'Indicator date',
          required: true,
          example: '2024-01-01'
        },
        {
          name: 'value',
          type: 'number',
          description: 'Indicator value',
          required: true,
          example: 2.1
        },
        {
          name: 'unit',
          type: 'string',
          description: 'Value unit',
          required: true,
          example: 'percent'
        },
        {
          name: 'frequency',
          type: 'string',
          description: 'Update frequency',
          required: true,
          example: 'quarterly'
        }
      ]
    }
  };

  return schemas[dataType] || { error: 'Schema not found for this data type' };
}

// Get data statistics
async function getDataStatistics() {
  // Mock statistics - in production this would query actual data
  return {
    totalRecords: {
      financial_statements: 1250000,
      market_data: 45000000,
      economic_indicators: 15000,
      news_articles: 250000,
      company_profiles: 15000
    },
    dataVolume: {
      total: '2.3 TB',
      dailyGrowth: '15 GB',
      monthlyGrowth: '450 GB'
    },
    coverage: {
      companies: '15,000+',
      countries: '45+',
      markets: '100+',
      timeRange: '1990-2024'
    },
    updateFrequency: {
      realTime: 'Market data, news',
      daily: 'Company profiles, economic indicators',
      quarterly: 'Financial statements',
      annually: 'Regulatory filings'
    },
    dataQuality: {
      completeness: '92%',
      accuracy: '89%',
      consistency: '85%',
      timeliness: '88%'
    }
  };
}

export default router;
