import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import mongoose from 'mongoose';
// import rateLimit from 'express-rate-limit';

// Import routes
import financialHealthRoutes from './routes/financialHealth.js';
import marketAnalysisRoutes from './routes/marketAnalysis.js';
import fundraisingRoutes from './routes/fundraising.js';
import valuationRoutes from './routes/valuation.js';
import documentAnalysisRoutes from './routes/documentAnalysis.js';
import videoGeneratorRoutes from './routes/videoGenerator.js';
import mlModelRoutes from './routes/mlModels.js';
import dataRoutes from './routes/data.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';
import { logger } from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting - temporarily disabled
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many requests from this IP, please try again later.'
// });
// app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'CorpFin360 ML Backend'
  });
});

// API routes
app.use('/api/financial-health', authMiddleware, financialHealthRoutes);
app.use('/api/market-analysis', authMiddleware, marketAnalysisRoutes);
app.use('/api/fundraising', authMiddleware, fundraisingRoutes);
app.use('/api/valuation', authMiddleware, valuationRoutes);
app.use('/api/document-analysis', authMiddleware, documentAnalysisRoutes);
app.use('/api/video-generator', authMiddleware, videoGeneratorRoutes);
app.use('/api/ml-models', authMiddleware, mlModelRoutes);
app.use('/api/data', authMiddleware, dataRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('MongoDB connected successfully');
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
  }
};

// Redis connection
const connectRedis = async () => {
  try {
    if (process.env.REDIS_URL) {
      const redisClient = createClient({
        url: process.env.REDIS_URL
      });
      
      redisClient.on('error', (err) => logger.error('Redis Client Error:', err));
      redisClient.on('connect', () => logger.info('Redis connected successfully'));
      
      await redisClient.connect();
      
      // Make redis client available globally
      global.redisClient = redisClient;
    }
  } catch (error) {
    logger.error('Redis connection error:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
