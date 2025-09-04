import express from 'express';
import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get market trend analysis
router.post('/trends', async (req, res) => {
  try {
    const { marketData, newsData, predictionHorizon = 5 } = req.body;
    
    if (!marketData) {
      return res.status(400).json({
        success: false,
        error: 'Market data is required'
      });
    }

    // Call Python ML model
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/market_trend_model.py'),
      '--predict',
      JSON.stringify(marketData),
      '--news',
      JSON.stringify(newsData || []),
      '--horizon',
      predictionHorizon.toString()
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
        logger.error('Python market analysis error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to analyze market trends'
        });
      }

      try {
        const analysis = JSON.parse(result);
        
        // Generate trading recommendations
        const recommendations = generateTradingRecommendations(analysis, marketData);
        
        res.json({
          success: true,
          data: {
            ...analysis,
            recommendations,
            timestamp: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse market analysis:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse market analysis results'
        });
      }
    });

  } catch (error) {
    logger.error('Market analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Train market trend model
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
      path.join(__dirname, '../../ml/models/market_trend_model.py'),
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
          error: 'Failed to train market trend model'
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

// Get market sentiment analysis
router.post('/sentiment', async (req, res) => {
  try {
    const { newsData, socialMediaData } = req.body;
    
    if (!newsData && !socialMediaData) {
      return res.status(400).json({
        success: false,
        error: 'News or social media data is required'
      });
    }

    // Combine data sources
    const combinedData = {
      news: newsData || [],
      social: socialMediaData || []
    };

    // Call Python sentiment analysis
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/market_trend_model.py'),
      '--sentiment',
      JSON.stringify(combinedData)
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
        logger.error('Python sentiment analysis error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to analyze sentiment'
        });
      }

      try {
        const sentiment = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            ...sentiment,
            timestamp: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse sentiment results:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse sentiment results'
        });
      }
    });

  } catch (error) {
    logger.error('Sentiment analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get market volatility forecast
router.post('/volatility', async (req, res) => {
  try {
    const { marketData, timeHorizon = 30 } = req.body;
    
    if (!marketData) {
      return res.status(400).json({
        success: false,
        error: 'Market data is required'
      });
    }

    // Call Python volatility model
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/market_trend_model.py'),
      '--volatility',
      JSON.stringify(marketData),
      '--horizon',
      timeHorizon.toString()
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
        logger.error('Python volatility error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to forecast volatility'
        });
      }

      try {
        const volatility = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            ...volatility,
            timestamp: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse volatility results:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse volatility results'
        });
      }
    });

  } catch (error) {
    logger.error('Volatility forecast error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get market indicators
router.get('/indicators', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        technical: [
          {
            name: 'RSI (Relative Strength Index)',
            description: 'Measures momentum and overbought/oversold conditions',
            interpretation: 'RSI > 70: Overbought, RSI < 30: Oversold'
          },
          {
            name: 'MACD (Moving Average Convergence Divergence)',
            description: 'Shows relationship between two moving averages',
            interpretation: 'Positive MACD: Bullish momentum, Negative: Bearish'
          },
          {
            name: 'Bollinger Bands',
            description: 'Shows price volatility and potential reversal points',
            interpretation: 'Price near upper band: Overbought, near lower: Oversold'
          }
        ],
        fundamental: [
          {
            name: 'P/E Ratio',
            description: 'Price to earnings ratio',
            interpretation: 'High P/E: Growth expectations, Low P/E: Value'
          },
          {
            name: 'P/B Ratio',
            description: 'Price to book value ratio',
            interpretation: 'P/B < 1: Potentially undervalued'
          },
          {
            name: 'Debt-to-Equity',
            description: 'Financial leverage ratio',
            interpretation: 'High ratio: Higher risk, Lower ratio: Lower risk'
          }
        ],
        sentiment: [
          {
            name: 'VIX (Volatility Index)',
            description: 'Market fear and volatility indicator',
            interpretation: 'High VIX: Fear, Low VIX: Complacency'
          },
          {
            name: 'Fear & Greed Index',
            description: 'Market sentiment indicator',
            interpretation: '0-25: Extreme Fear, 75-100: Extreme Greed'
          }
        ]
      }
    });
  } catch (error) {
    logger.error('Indicators error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate trading recommendations
function generateTradingRecommendations(analysis, marketData) {
  const recommendations = [];
  
  // Trend-based recommendations
  if (analysis.trend_direction === 'bullish') {
    recommendations.push({
      type: 'buy',
      confidence: analysis.confidence_score,
      reason: 'Strong upward trend detected',
      action: 'Consider long positions or call options'
    });
  } else if (analysis.trend_direction === 'bearish') {
    recommendations.push({
      type: 'sell',
      confidence: analysis.confidence_score,
      reason: 'Downward trend detected',
      action: 'Consider short positions or put options'
    });
  }
  
  // Volatility-based recommendations
  if (analysis.volatility_predictions && analysis.volatility_predictions.length > 0) {
    const avgVolatility = analysis.volatility_predictions.reduce((sum, v) => sum + v.predicted_volatility, 0) / analysis.volatility_predictions.length;
    
    if (avgVolatility > 0.3) {
      recommendations.push({
        type: 'hedge',
        confidence: 0.7,
        reason: 'High volatility expected',
        action: 'Consider volatility hedging strategies'
      });
    }
  }
  
  // Sentiment-based recommendations
  if (analysis.sentiment_score !== undefined) {
    if (analysis.sentiment_score > 0.5) {
      recommendations.push({
        type: 'positive',
        confidence: 0.6,
        reason: 'Positive market sentiment',
        action: 'Monitor for confirmation signals'
      });
    } else if (analysis.sentiment_score < -0.5) {
      recommendations.push({
        type: 'caution',
        confidence: 0.6,
        reason: 'Negative market sentiment',
        action: 'Exercise caution and wait for reversal signals'
      });
    }
  }
  
  return recommendations;
}

export default router;
