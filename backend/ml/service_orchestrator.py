#!/usr/bin/env python3
"""
ML Service Orchestrator for CorpFin360
Coordinates all ML models and provides unified interface
"""

import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from pathlib import Path
import sys

# Add the models directory to the path
sys.path.append(str(Path(__file__).parent / 'models'))

from financial_health_model import FinancialHealthModel
from valuation_model import BusinessValuationModel
from market_trend_model import MarketTrendModel

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MLServiceOrchestrator:
    """Main orchestrator for all ML services"""
    
    def __init__(self):
        self.models = {}
        self.model_status = {}
        self.initialized = False
        
    async def initialize(self):
        """Initialize all ML models"""
        try:
            logger.info("Initializing ML Service Orchestrator...")
            
            # Initialize models
            self.models['financial_health'] = FinancialHealthModel()
            self.models['business_valuation'] = BusinessValuationModel()
            self.models['market_trends'] = MarketTrendModel()
            
            # Check model status
            for model_name, model in self.models.items():
                self.model_status[model_name] = {
                    'initialized': True,
                    'trained': model.is_trained if hasattr(model, 'is_trained') else False,
                    'last_used': None,
                    'performance': {}
                }
            
            self.initialized = True
            logger.info("ML Service Orchestrator initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ML Service Orchestrator: {e}")
            raise
    
    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        if not self.initialized:
            await self.initialize()
        
        return {
            'orchestrator_status': 'running' if self.initialized else 'stopped',
            'models': self.model_status,
            'total_models': len(self.models),
            'active_models': sum(1 for status in self.model_status.values() if status['initialized'])
        }
    
    async def analyze_financial_health(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze company financial health"""
        try:
            if not self.initialized:
                await self.initialize()
            
            model = self.models['financial_health']
            
            # Check if model needs training
            if not model.is_trained:
                logger.warning("Financial health model not trained, using default analysis")
                return self._default_financial_health_analysis(company_data)
            
            # Perform analysis
            result = model.predict_health(company_data)
            
            # Update model status
            self.model_status['financial_health']['last_used'] = asyncio.get_event_loop().time()
            
            return {
                'success': True,
                'analysis': result,
                'model_used': 'financial_health',
                'confidence': 'high' if model.is_trained else 'low'
            }
            
        except Exception as e:
            logger.error(f"Financial health analysis failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_analysis': self._default_financial_health_analysis(company_data)
            }
    
    async def estimate_business_valuation(self, company_data: Dict[str, Any], confidence_level: float = 0.95) -> Dict[str, Any]:
        """Estimate business valuation"""
        try:
            if not self.initialized:
                await self.initialize()
            
            model = self.models['business_valuation']
            
            # Check if model needs training
            if not model.is_trained:
                logger.warning("Business valuation model not trained, using default valuation")
                return self._default_business_valuation(company_data)
            
            # Perform valuation
            result = model.predict_valuation(company_data, confidence_level)
            
            # Update model status
            self.model_status['business_valuation']['last_used'] = asyncio.get_event_loop().time()
            
            return {
                'success': True,
                'valuation': result,
                'model_used': 'business_valuation',
                'confidence': 'high' if model.is_trained else 'low'
            }
            
        except Exception as e:
            logger.error(f"Business valuation failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_valuation': self._default_business_valuation(company_data)
            }
    
    async def analyze_market_trends(self, market_data: Dict[str, Any], news_data: Optional[List] = None, prediction_horizon: int = 5) -> Dict[str, Any]:
        """Analyze market trends"""
        try:
            if not self.initialized:
                await self.initialize()
            
            model = self.models['market_trends']
            
            # Check if model needs training
            if not model.is_trained:
                logger.warning("Market trend model not trained, using default analysis")
                return self._default_market_trend_analysis(market_data)
            
            # Perform analysis
            result = model.predict_market_trends(market_data, news_data, prediction_horizon)
            
            # Update model status
            self.model_status['market_trends']['last_used'] = asyncio.get_event_loop().time()
            
            return {
                'success': True,
                'analysis': result,
                'model_used': 'market_trends',
                'confidence': 'high' if model.is_trained else 'low'
            }
            
        except Exception as e:
            logger.error(f"Market trend analysis failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'fallback_analysis': self._default_market_trend_analysis(market_data)
            }
    
    async def comprehensive_analysis(self, company_data: Dict[str, Any], market_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Perform comprehensive financial analysis using all models"""
        try:
            if not self.initialized:
                await self.initialize()
            
            logger.info("Starting comprehensive financial analysis...")
            
            # Run all analyses concurrently
            tasks = [
                self.analyze_financial_health(company_data),
                self.estimate_business_valuation(company_data)
            ]
            
            if market_data:
                tasks.append(self.analyze_market_trends(market_data))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            analysis_results = {}
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Analysis {i} failed: {result}")
                    analysis_results[f'analysis_{i}'] = {'success': False, 'error': str(result)}
                else:
                    analysis_results[f'analysis_{i}'] = result
            
            # Generate comprehensive insights
            insights = self._generate_comprehensive_insights(analysis_results)
            
            return {
                'success': True,
                'comprehensive_analysis': analysis_results,
                'insights': insights,
                'summary': self._generate_analysis_summary(analysis_results),
                'recommendations': self._generate_recommendations(analysis_results)
            }
            
        except Exception as e:
            logger.error(f"Comprehensive analysis failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def train_model(self, model_name: str, training_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Train a specific model"""
        try:
            if not self.initialized:
                await self.initialize()
            
            if model_name not in self.models:
                return {
                    'success': False,
                    'error': f'Model {model_name} not found'
                }
            
            model = self.models[model_name]
            
            logger.info(f"Training {model_name} model...")
            
            # Train the model
            if hasattr(model, 'train'):
                training_result = model.train(training_data)
                
                # Update model status
                self.model_status[model_name]['trained'] = True
                self.model_status[model_name]['last_trained'] = asyncio.get_event_loop().time()
                
                return {
                    'success': True,
                    'model': model_name,
                    'training_result': training_result,
                    'status': 'trained'
                }
            else:
                return {
                    'success': False,
                    'error': f'Model {model_name} does not support training'
                }
                
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def get_model_performance(self, model_name: str) -> Dict[str, Any]:
        """Get performance metrics for a specific model"""
        try:
            if not self.initialized:
                await self.initialize()
            
            if model_name not in self.models:
                return {
                    'success': False,
                    'error': f'Model {model_name} not found'
                }
            
            model = self.models[model_name]
            
            # Get feature importance if available
            feature_importance = None
            if hasattr(model, 'get_feature_importance'):
                feature_importance = model.get_feature_importance()
            
            return {
                'success': True,
                'model': model_name,
                'status': self.model_status[model_name],
                'feature_importance': feature_importance,
                'capabilities': self._get_model_capabilities(model)
            }
            
        except Exception as e:
            logger.error(f"Failed to get model performance: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    # Fallback analysis methods
    def _default_financial_health_analysis(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Default financial health analysis when ML model is not available"""
        # Simple rule-based analysis
        revenue = company_data.get('revenue', 0)
        profit = company_data.get('net_income', 0)
        assets = company_data.get('total_assets', 0)
        liabilities = company_data.get('total_liabilities', 0)
        
        # Calculate basic ratios
        profit_margin = (profit / revenue) if revenue > 0 else 0
        debt_ratio = (liabilities / assets) if assets > 0 else 0
        
        # Simple scoring
        health_score = 50  # Base score
        
        if profit_margin > 0.15:
            health_score += 20
        elif profit_margin > 0.05:
            health_score += 10
        
        if debt_ratio < 0.5:
            health_score += 20
        elif debt_ratio < 0.7:
            health_score += 10
        
        if revenue > 1000000:  # $1M+
            health_score += 10
        
        health_score = min(health_score, 100)
        
        return {
            'health_score': health_score,
            'risk_score': 100 - health_score,
            'health_category': 'Good' if health_score > 60 else 'Fair' if health_score > 40 else 'Poor',
            'risk_category': 'Low Risk' if health_score > 60 else 'Moderate Risk' if health_score > 40 else 'High Risk',
            'analysis_method': 'rule_based_fallback'
        }
    
    def _default_business_valuation(self, company_data: Dict[str, Any]) -> Dict[str, Any]:
        """Default business valuation when ML model is not available"""
        revenue = company_data.get('revenue', 1000000)
        profit = company_data.get('net_income', 100000)
        
        # Simple multiple-based valuation
        revenue_multiple = 2.0  # Conservative multiple
        profit_multiple = 15.0  # Conservative multiple
        
        revenue_based = revenue * revenue_multiple
        profit_based = profit * profit_multiple
        
        # Use the higher of the two
        valuation = max(revenue_based, profit_based)
        
        return {
            'valuation': valuation,
            'valuation_range': {
                'min': valuation * 0.8,
                'max': valuation * 1.2
            },
            'methodology': ['Revenue multiple approach', 'Profit multiple approach'],
            'analysis_method': 'multiple_based_fallback'
        }
    
    def _default_market_trend_analysis(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Default market trend analysis when ML model is not available"""
        current_price = market_data.get('current_price', 100)
        
        # Simple trend analysis
        trend_direction = 'neutral'
        if 'price_change_percent' in market_data:
            change = market_data['price_change_percent']
            if change > 0.02:
                trend_direction = 'bullish'
            elif change < -0.02:
                trend_direction = 'bearish'
        
        return {
            'trend_direction': trend_direction,
            'confidence_score': 0.5,
            'key_factors': ['Price movement analysis'],
            'analysis_method': 'trend_based_fallback'
        }
    
    # Helper methods
    def _generate_comprehensive_insights(self, analysis_results: Dict[str, Any]) -> List[str]:
        """Generate comprehensive insights from all analysis results"""
        insights = []
        
        # Extract key insights from each analysis
        for analysis_name, result in analysis_results.items():
            if result.get('success'):
                if 'financial_health' in analysis_name and 'analysis' in result:
                    analysis = result['analysis']
                    if analysis.get('health_score', 0) > 80:
                        insights.append("Company shows excellent financial health with strong fundamentals")
                    elif analysis.get('health_score', 0) < 40:
                        insights.append("Company faces significant financial challenges requiring immediate attention")
                
                if 'business_valuation' in analysis_name and 'valuation' in result:
                    valuation = result['valuation']
                    if valuation.get('valuation', 0) > 10000000:
                        insights.append("High company valuation indicates strong market position and growth potential")
                
                if 'market_trends' in analysis_name and 'analysis' in result:
                    analysis = result['analysis']
                    if analysis.get('trend_direction') == 'bullish':
                        insights.append("Positive market trends suggest favorable conditions for growth")
        
        return insights if insights else ["Analysis completed successfully"]
    
    def _generate_analysis_summary(self, analysis_results: Dict[str, Any]) -> str:
        """Generate a summary of the comprehensive analysis"""
        successful_analyses = sum(1 for result in analysis_results.values() if result.get('success'))
        total_analyses = len(analysis_results)
        
        if successful_analyses == total_analyses:
            return f"All {total_analyses} analyses completed successfully with high confidence"
        elif successful_analyses > 0:
            return f"{successful_analyses} out of {total_analyses} analyses completed successfully"
        else:
            return "Analysis completed with fallback methods due to model unavailability"
    
    def _generate_recommendations(self, analysis_results: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate actionable recommendations based on analysis results"""
        recommendations = []
        
        for analysis_name, result in analysis_results.items():
            if result.get('success'):
                if 'financial_health' in analysis_name and 'analysis' in result:
                    analysis = result['analysis']
                    if analysis.get('health_score', 0) < 50:
                        recommendations.append({
                            'category': 'Financial Health',
                            'action': 'Implement cost reduction and revenue optimization strategies',
                            'priority': 'High',
                            'timeline': 'Immediate'
                        })
                
                if 'business_valuation' in analysis_name and 'valuation' in result:
                    valuation = result['valuation']
                    if valuation.get('valuation', 0) < 5000000:
                        recommendations.append({
                            'category': 'Valuation',
                            'action': 'Focus on growth initiatives to increase company value',
                            'priority': 'Medium',
                            'timeline': '3-6 months'
                        })
        
        return recommendations if recommendations else [{
            'category': 'General',
            'action': 'Continue monitoring key financial metrics',
            'priority': 'Low',
            'timeline': 'Ongoing'
        }]
    
    def _get_model_capabilities(self, model) -> Dict[str, Any]:
        """Get capabilities of a specific model"""
        capabilities = {
            'supports_training': hasattr(model, 'train'),
            'supports_prediction': hasattr(model, 'predict') or hasattr(model, 'predict_health') or hasattr(model, 'predict_valuation') or hasattr(model, 'predict_market_trends'),
            'supports_feature_importance': hasattr(model, 'get_feature_importance'),
            'model_type': type(model).__name__
        }
        
        return capabilities

# Main execution for testing
async def main():
    """Test the ML Service Orchestrator"""
    orchestrator = MLServiceOrchestrator()
    
    try:
        await orchestrator.initialize()
        
        # Test status
        status = await orchestrator.get_model_status()
        print("Orchestrator Status:", json.dumps(status, indent=2))
        
        # Test comprehensive analysis
        company_data = {
            'revenue': 5000000,
            'net_income': 750000,
            'total_assets': 8000000,
            'total_liabilities': 3000000
        }
        
        market_data = {
            'current_price': 100,
            'price_change_percent': 0.05
        }
        
        analysis = await orchestrator.comprehensive_analysis(company_data, market_data)
        print("\nComprehensive Analysis:", json.dumps(analysis, indent=2))
        
    except Exception as e:
        logger.error(f"Test failed: {e}")

if __name__ == "__main__":
    asyncio.run(main())
