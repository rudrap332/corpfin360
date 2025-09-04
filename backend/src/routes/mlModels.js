import express from 'express';
import { spawn } from 'child_process';
import { logger } from '../utils/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all available ML models
router.get('/', async (req, res) => {
  try {
    const models = [
      {
        id: 'financial_health',
        name: 'Financial Health Assessment',
        description: 'ML model for analyzing company financial health and risk',
        status: 'active',
        lastTrained: '2024-01-15',
        accuracy: '87.3%',
        features: ['Revenue ratios', 'Profitability metrics', 'Growth rates', 'Risk indicators'],
        endpoint: '/api/financial-health/assess'
      },
      {
        id: 'business_valuation',
        name: 'Business Valuation',
        description: 'Ensemble ML model for company valuation using multiple approaches',
        status: 'active',
        lastTrained: '2024-01-10',
        accuracy: '92.1%',
        features: ['Financial metrics', 'Market data', 'Industry benchmarks', 'Growth projections'],
        endpoint: '/api/valuation/estimate'
      },
      {
        id: 'market_trends',
        name: 'Market Trend Analysis',
        description: 'Time series and sentiment analysis for market predictions',
        status: 'active',
        lastTrained: '2024-01-12',
        accuracy: '78.9%',
        features: ['Price data', 'Technical indicators', 'News sentiment', 'Economic factors'],
        endpoint: '/api/market-analysis/trends'
      }
    ];

    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    logger.error('Get models error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get model details and performance
router.get('/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    // Check if model file exists
    const modelPath = path.join(__dirname, `../../ml/models/${modelId}_model.py`);
    
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Get model performance metrics
    const pythonProcess = spawn('python', [
      modelPath,
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
        logger.error(`Python performance check error for ${modelId}:`, error);
        return res.status(500).json({
          success: false,
          error: 'Failed to get model performance'
        });
      }

      try {
        const performance = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            modelId,
            performance,
            modelPath: modelPath,
            lastModified: fs.statSync(modelPath).mtime
          }
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
    logger.error('Get model details error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Retrain a specific model
router.post('/:modelId/retrain', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { trainingData, parameters } = req.body;
    
    if (!trainingData || !Array.isArray(trainingData)) {
      return res.status(400).json({
        success: false,
        error: 'Training data array is required'
      });
    }

    // Check if model file exists
    const modelPath = path.join(__dirname, `../../ml/models/${modelId}_model.py`);
    
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
        });
    }

    // Call Python training script
    const pythonProcess = spawn('python', [
      modelPath,
      '--train',
      JSON.stringify(trainingData),
      '--parameters',
      JSON.stringify(parameters || {})
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
        logger.error(`Python training error for ${modelId}:`, error);
        return res.status(500).json({
          success: false,
          error: 'Failed to retrain model'
        });
      }

      try {
        const trainingResults = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            modelId,
            ...trainingResults,
            retrainedAt: new Date().toISOString()
          }
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
    logger.error('Model retraining error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get model feature importance
router.get('/:modelId/features', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    // Check if model file exists
    const modelPath = path.join(__dirname, `../../ml/models/${modelId}_model.py`);
    
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Call Python script to get feature importance
    const pythonProcess = spawn('python', [
      modelPath,
      '--features'
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
        logger.error(`Python feature importance error for ${modelId}:`, error);
        return res.status(500).json({
          success: false,
          error: 'Failed to get feature importance'
        });
      }

      try {
        const features = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            modelId,
            features
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse feature importance:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse feature importance'
        });
      }
    });

  } catch (error) {
    logger.error('Get feature importance error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get model training history
router.get('/:modelId/history', async (req, res) => {
  try {
    const { modelId } = req.params;
    
    // Mock training history - in production this would come from a database
    const history = [
      {
        trainingId: 'train_001',
        date: '2024-01-15T10:30:00Z',
        accuracy: '87.3%',
        dataPoints: 15000,
        duration: '45m 23s',
        status: 'completed'
      },
      {
        trainingId: 'train_002',
        date: '2024-01-10T14:15:00Z',
        accuracy: '85.1%',
        dataPoints: 12000,
        duration: '38m 45s',
        status: 'completed'
      },
      {
        trainingId: 'train_003',
        date: '2024-01-05T09:00:00Z',
        accuracy: '82.7%',
        dataPoints: 10000,
        duration: '32m 12s',
        status: 'completed'
      }
    ];

    res.json({
      success: true,
      data: {
        modelId,
        history
      }
    });
  } catch (error) {
    logger.error('Get training history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Export model
router.post('/:modelId/export', async (req, res) => {
  try {
    const { modelId } = req.params;
    const { format = 'pickle' } = req.body;
    
    // Check if model file exists
    const modelPath = path.join(__dirname, `../../ml/models/${modelId}_model.py`);
    
    if (!fs.existsSync(modelPath)) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    // Call Python script to export model
    const pythonProcess = spawn('python', [
      modelPath,
      '--export',
      '--format',
      format
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
        logger.error(`Python export error for ${modelId}:`, error);
        return res.status(500).json({
          success: false,
          error: 'Failed to export model'
        });
      }

      try {
        const exportResult = JSON.parse(result);
        
        res.json({
          success: true,
          data: {
            modelId,
            ...exportResult,
            exportedAt: new Date().toISOString()
          }
        });
      } catch (parseError) {
        logger.error('Failed to parse export result:', parseError);
        res.status(500).json({
          success: false,
          error: 'Failed to parse export result'
        });
      }
    });

  } catch (error) {
    logger.error('Model export error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
