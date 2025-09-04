import express from 'express';
import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get business valuation
router.post('/estimate', async (req, res) => {
  try {
    const { companyData, confidenceLevel = 0.95 } = req.body;
    
    if (!companyData) {
      return res.status(400).json({
        success: false,
        error: 'Company data is required'
      });
    }

    // Call Python ML model
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/valuation_model.py'),
      '--predict',
      JSON.stringify(companyData),
      '--confidence',
      confidenceLevel.toString()
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error('Python valuation error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to estimate valuation'
        });
      }

      try {
        const valuation = JSON.parse(result);
        
        // Generate additional insights
        const insights = generateValuationInsights(valuation, companyData);
        
        res.json({
          success: true,
          data: {
            ...valuation,
            insights,
            timestamp: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse valuation results:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse valuation results'
        });
      }
    });

  } catch (error) {
    logger.error('Valuation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Train valuation model
router.post('/train', async (req, res) => {
  try {
    const { trainingData } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'Training data array is required'
      });
    }

    // Call Python training script
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/valuation_model.py'),
      '--train',
      JSON.stringify(trainingData)
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        logger.error('Python training error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to train valuation model'
        });
      }

      try {
        const trainingResults = JSON.parse(result);
        
        res.json({
          success: true,
          data: trainingResults
        });
      } catch (parseError) {
        logger.error('Failed to parse training results:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse training results'
        });
      }
    });

  } catch (error) {
    logger.error('Model training error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get valuation comparison
router.post('/compare', async (req, res) => {
  try {
    const { companies } = req.body;
    
    if (!companies || !Array.isArray(companies) || companies.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 companies required for comparison'
      });
    }

    const comparisons = [];
    
    for (const company of companies) {
      try {
        const pythonProcess = spawn('python', [
          path.join(__dirname, '../../ml/models/valuation_model.py'),
          '--predict',
          JSON.stringify(company.data)
        ]);

        let result = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        await new Promise((resolve, reject) => {
          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(error));
            } else {
              try {
                const valuation = JSON.parse(result);
                comparisons.push({
                  company: company.name,
                  valuation: valuation.valuation,
                  range: valuation.valuation_range,
                  methodology: valuation.methodology
                });
                resolve();
              } catch (parseError) {
                reject(parseError);
              }
            }
          });
        });

      } catch (error) {
        logger.error(`Failed to value company ${company.name}:`, error);
        comparisons.push({
          company: company.name,
          error: 'Failed to calculate valuation'
        });
      }
    }

    // Generate comparison insights
    const insights = generateComparisonInsights(comparisons);
    
    res.json({
      success: true,
      data: {
        comparisons,
        insights,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Valuation comparison error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get valuation methodology
router.get('/methodology', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        approaches: [
          {
            name: 'Discounted Cash Flow (DCF)',
            description: 'Values company based on future cash flows discounted to present value',
            useCase: 'Companies with predictable cash flows'
          },
          {
            name: 'Comparable Company Analysis',
            description: 'Compares company to similar publicly traded companies',
            useCase: 'Companies in established industries with public peers'
          },
          {
            name: 'Asset-Based Valuation',
            description: 'Values company based on its net asset value',
            useCase: 'Asset-heavy companies or liquidation scenarios'
          },
          {
            name: 'ML Ensemble Model',
            description: 'Uses multiple ML algorithms to predict valuation',
            useCase: 'All company types with sufficient data'
          }
        ],
        factors: [
          'Revenue and growth rates',
          'Profitability metrics',
          'Market conditions',
          'Industry benchmarks',
          'Company age and maturity',
          'Economic indicators'
        ]
      }
    });
  } catch (error) {
    logger.error('Methodology error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate valuation insights
function generateValuationInsights(valuation, companyData) {
  const insights = [];
  
  // Valuation range analysis
  const range = valuation.valuation_range;
  const rangeWidth = (range.max - range.min) / range.min;
  
  if (rangeWidth > 0.5) {
    insights.push({
      type: 'warning',
      message: 'High valuation uncertainty - consider gathering more data',
      action: 'Review data quality and completeness'
    });
  }
  
  // Growth analysis
  if (companyData.revenue_growth > 0.2) {
    insights.push({
      type: 'positive',
      message: 'High growth rate supports premium valuation',
      action: 'Consider growth sustainability factors'
    });
  }
  
  // Profitability analysis
  if (companyData.net_income && companyData.revenue) {
    const margin = companyData.net_income / companyData.revenue;
    if (margin > 0.2) {
      insights.push({
        type: 'positive',
        message: 'Strong profitability supports valuation',
        action: 'Monitor margin sustainability'
      });
    }
  }
  
  return insights;
}

// Generate comparison insights
function generateComparisonInsights(comparisons) {
  const insights = [];
  
  if (comparisons.length < 2) return insights;
  
  // Find highest and lowest valuations
  const validComparisons = comparisons.filter(c => !c.error);
  if (validComparisons.length < 2) return insights;
  
  const valuations = validComparisons.map(c => c.valuation);
  const maxVal = Math.max(...valuations);
  const minVal = Math.min(...valuations);
  const maxCompany = validComparisons.find(c => c.valuation === maxVal);
  const minCompany = validComparisons.find(c => c.valuation === minVal);
  
  if (maxVal / minVal > 3) {
    insights.push({
      type: 'analysis',
      message: `Significant valuation gap between ${maxCompany.company} and ${minCompany.company}`,
      action: 'Review underlying business fundamentals and market positioning'
    });
  }
  
  return insights;
}

export default router;
