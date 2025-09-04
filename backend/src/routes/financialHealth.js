import express from 'express';
import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get financial health assessment
router.post('/assess', async (req, res) => {
  try {
    const { companyData } = req.body;
    
    if (!companyData) {
      return res.status(400).json({
        success: false,
        error: 'Company data is required'
      });
    }

    // Call Python ML model
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/financial_health_model.py'),
      '--predict',
      JSON.stringify(companyData)
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
        logger.error('Python process error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to analyze financial health'
        });
      }

      try {
        const analysis = JSON.parse(result);
        
        // Generate recommendations based on ML results
        const recommendations = generateRecommendations(analysis);
        
        res.json({
          success: true,
          data: {
            ...analysis,
            recommendations,
            timestamp: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse Python output:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse analysis results'
        });
      }
    });

  } catch (error) {
    logger.error('Financial health assessment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Train financial health model
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
      path.join(__dirname, '../../ml/models/financial_health_model.py'),
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
          error: 'Failed to train model'
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

// Get model performance metrics
router.get('/performance', async (req, res) => {
  try {
    // Call Python script to get model performance
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../../ml/models/financial_health_model.py'),
      '--performance'
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
        logger.error('Python performance check error:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to get model performance'
        });
      }

      try {
        const performance = JSON.parse(result);
        
        res.json({
          success: true,
          data: performance
        });
      } catch (parseError) {
        logger.error('Failed to parse performance data:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse performance data'
        });
      }
    });

  } catch (error) {
    logger.error('Performance check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Generate recommendations based on ML analysis
function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.health_score < 40) {
    recommendations.push({
      category: 'Critical',
      action: 'Immediate intervention required',
      priority: 'High',
      description: 'Company shows critical financial health indicators'
    });
  }
  
  if (analysis.risk_score > 70) {
    recommendations.push({
      category: 'Risk Management',
      action: 'Implement risk mitigation strategies',
      priority: 'High',
      description: 'High risk score indicates need for immediate attention'
    });
  }
  
  if (analysis.health_score < 60) {
    recommendations.push({
      category: 'Financial Planning',
      action: 'Review and restructure financial strategy',
      priority: 'Medium',
      description: 'Below-average health score suggests need for financial restructuring'
    });
  }
  
  if (analysis.health_score >= 80) {
    recommendations.push({
      category: 'Growth',
      action: 'Consider expansion opportunities',
      priority: 'Low',
      description: 'Strong financial health allows for strategic growth initiatives'
    });
  }
  
  return recommendations;
}

export default router;
