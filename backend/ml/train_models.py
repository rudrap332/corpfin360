#!/usr/bin/env python3
"""
Main training script for CorpFin360 ML models
Trains all models with sample data and saves them
"""

import os
import sys
import json
import logging
import argparse
from pathlib import Path
import asyncio

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

class ModelTrainer:
    """Main trainer for all ML models"""
    
    def __init__(self):
        self.models = {}
        self.training_results = {}
        self.models_dir = Path(__file__).parent / 'models'
        self.trained_models_dir = Path(__file__).parent / 'trained_models'
        
        # Create trained models directory if it doesn't exist
        self.trained_models_dir.mkdir(exist_ok=True)
        
    def initialize_models(self):
        """Initialize all ML models"""
        logger.info("Initializing ML models...")
        
        try:
            self.models['financial_health'] = FinancialHealthModel()
            self.models['business_valuation'] = BusinessValuationModel()
            self.models['market_trends'] = MarketTrendModel()
            
            logger.info(f"Initialized {len(self.models)} models successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {e}")
            raise
    
    def generate_training_data(self):
        """Generate sample training data for all models"""
        logger.info("Generating training data...")
        
        training_data = {}
        
        # Financial Health training data
        training_data['financial_health'] = self._generate_financial_health_data()
        
        # Business Valuation training data
        training_data['business_valuation'] = self._generate_valuation_data()
        
        # Market Trend training data
        training_data['market_trends'] = self._generate_market_trend_data()
        
        logger.info("Training data generated successfully")
        return training_data
    
    def _generate_financial_health_data(self):
        """Generate sample financial health training data"""
        import numpy as np
        
        np.random.seed(42)
        data = []
        
        for i in range(2000):
            # Generate realistic company data
            revenue = np.random.uniform(100000, 100000000)
            total_assets = revenue * np.random.uniform(0.8, 2.5)
            net_income = revenue * np.random.uniform(-0.1, 0.3)
            total_debt = total_assets * np.random.uniform(0, 0.8)
            total_equity = total_assets - total_debt
            
            # Calculate derived metrics
            current_assets = total_assets * np.random.uniform(0.2, 0.6)
            current_liabilities = total_assets * np.random.uniform(0.1, 0.4)
            cash = current_assets * np.random.uniform(0.1, 0.5)
            
            # Growth metrics
            revenue_growth = np.random.uniform(-0.3, 0.8)
            profit_growth = np.random.uniform(-0.5, 1.0)
            
            # Market metrics
            market_cap = revenue * np.random.uniform(1.0, 10.0)
            pe_ratio = np.random.uniform(5, 50)
            industry_avg_pe = np.random.uniform(15, 25)
            
            # Calculate health score based on metrics
            health_score = self._calculate_health_score(
                revenue, net_income, total_assets, total_debt,
                current_assets, current_liabilities, cash,
                revenue_growth, profit_growth, pe_ratio, industry_avg_pe
            )
            
            # Calculate risk score
            risk_score = self._calculate_risk_score(
                total_debt, total_equity, current_assets, current_liabilities,
                revenue_growth, profit_growth
            )
            
            company_data = {
                'metrics': {
                    'revenue': revenue,
                    'total_assets': total_assets,
                    'net_income': net_income,
                    'total_debt': total_debt,
                    'total_equity': total_equity,
                    'current_assets': current_assets,
                    'current_liabilities': current_liabilities,
                    'cash': cash,
                    'revenue_growth': revenue_growth,
                    'profit_growth': profit_growth,
                    'market_cap': market_cap,
                    'pe_ratio': pe_ratio,
                    'industry_avg_pe': industry_avg_pe
                },
                'health_score': health_score,
                'risk_score': risk_score
            }
            
            data.append(company_data)
        
        return data
    
    def _generate_valuation_data(self):
        """Generate sample business valuation training data"""
        import numpy as np
        
        np.random.seed(42)
        data = []
        
        for i in range(3000):
            # Generate realistic company data
            revenue = np.random.uniform(500000, 500000000)
            ebitda = revenue * np.random.uniform(0.05, 0.35)
            net_income = ebitda * np.random.uniform(0.6, 0.9)
            total_assets = revenue * np.random.uniform(0.8, 3.0)
            total_equity = revenue * np.random.uniform(0.2, 1.5)
            
            # Growth metrics
            revenue_growth = np.random.uniform(-0.2, 0.8)
            profit_growth = np.random.uniform(-0.3, 1.0)
            asset_growth = np.random.uniform(-0.1, 0.5)
            
            # Market metrics
            market_cap = revenue * np.random.uniform(1.0, 15.0)
            pe_ratio = np.random.uniform(8, 40)
            pb_ratio = np.random.uniform(0.5, 8.0)
            
            # Industry and market factors
            industry_multiple = np.random.uniform(0.7, 1.8)
            market_conditions = np.random.uniform(0.6, 1.4)
            company_age = np.random.uniform(1, 25)
            
            # Calculate actual valuation (target for training)
            # Use multiple approaches to generate realistic valuations
            revenue_multiple = np.random.uniform(1.5, 8.0)
            ebitda_multiple = np.random.uniform(8.0, 25.0)
            
            revenue_based = revenue * revenue_multiple
            ebitda_based = ebitda * ebitda_multiple
            
            # Add some randomness and use the higher value
            actual_valuation = max(revenue_based, ebitda_based) * np.random.uniform(0.8, 1.3)
            
            company_data = {
                'metrics': {
                    'revenue': revenue,
                    'ebitda': ebitda,
                    'net_income': net_income,
                    'total_assets': total_assets,
                    'total_equity': total_equity,
                    'revenue_growth': revenue_growth,
                    'profit_growth': profit_growth,
                    'asset_growth': asset_growth,
                    'market_cap': market_cap,
                    'pe_ratio': pe_ratio,
                    'pb_ratio': pb_ratio,
                    'industry_multiple': industry_multiple,
                    'market_conditions': market_conditions,
                    'company_age': company_age
                },
                'actual_valuation': actual_valuation
            }
            
            data.append(company_data)
        
        return data
    
    def _generate_market_trend_data(self):
        """Generate sample market trend training data"""
        import numpy as np
        
        np.random.seed(42)
        data = []
        
        for i in range(1500):
            # Generate realistic market data
            current_price = np.random.uniform(50, 500)
            
            # Price and volume data
            price_change = current_price * np.random.uniform(-0.15, 0.15)
            price_change_percent = price_change / current_price
            volume = np.random.uniform(1000000, 50000000)
            volume_change = np.random.uniform(-0.4, 0.4)
            
            # Technical indicators
            moving_average_20 = current_price * np.random.uniform(0.92, 1.08)
            moving_average_50 = current_price * np.random.uniform(0.88, 1.12)
            rsi = np.random.uniform(20, 80)
            macd = np.random.uniform(-3, 3)
            
            # Bollinger Bands
            bollinger_upper = current_price * 1.1
            bollinger_lower = current_price * 0.9
            
            # Market sentiment
            fear_greed_index = np.random.uniform(0, 100)
            vix = np.random.uniform(10, 45)
            
            # Economic indicators
            interest_rate = np.random.uniform(1, 8)
            inflation_rate = np.random.uniform(0.5, 7)
            gdp_growth = np.random.uniform(-3, 6)
            unemployment_rate = np.random.uniform(3, 12)
            
            # Sector and industry data
            sector_performance = np.random.uniform(-0.25, 0.35)
            industry_trend = np.random.uniform(-0.2, 0.3)
            
            # Generate future prices (targets for training)
            next_day_price = current_price * (1 + np.random.uniform(-0.08, 0.08))
            next_day_volatility = np.random.uniform(0.05, 0.4)
            
            # Generate news data
            news_data = [
                {
                    'headline': f'Market update for company {i}',
                    'content': f'Financial news content for company {i} with market implications'
                }
            ]
            
            # Calculate sentiment score based on news content
            sentiment_score = np.random.uniform(-1, 1)
            
            market_data = {
                'market_data': {
                    'current_price': current_price,
                    'price_change': price_change,
                    'price_change_percent': price_change_percent,
                    'volume': volume,
                    'volume_change': volume_change,
                    'moving_average_20': moving_average_20,
                    'moving_average_50': moving_average_50,
                    'rsi': rsi,
                    'macd': macd,
                    'bollinger_upper': bollinger_upper,
                    'bollinger_lower': bollinger_lower,
                    'fear_greed_index': fear_greed_index,
                    'vix': vix,
                    'interest_rate': interest_rate,
                    'inflation_rate': inflation_rate,
                    'gdp_growth': gdp_growth,
                    'unemployment_rate': unemployment_rate,
                    'sector_performance': sector_performance,
                    'industry_trend': industry_trend
                },
                'next_day_price': next_day_price,
                'next_day_volatility': next_day_volatility,
                'news_data': news_data,
                'sentiment_score': sentiment_score
            }
            
            data.append(market_data)
        
        return data
    
    def _calculate_health_score(self, revenue, net_income, total_assets, total_debt,
                               current_assets, current_liabilities, cash,
                               revenue_growth, profit_growth, pe_ratio, industry_avg_pe):
        """Calculate financial health score based on metrics"""
        score = 50  # Base score
        
        # Profitability
        if revenue > 0:
            profit_margin = net_income / revenue
            if profit_margin > 0.2:
                score += 20
            elif profit_margin > 0.1:
                score += 15
            elif profit_margin > 0:
                score += 10
        
        # Liquidity
        if current_liabilities > 0:
            current_ratio = current_assets / current_liabilities
            if current_ratio > 2:
                score += 15
            elif current_ratio > 1.5:
                score += 10
            elif current_ratio > 1:
                score += 5
        
        # Solvency
        if total_assets > 0:
            debt_ratio = total_debt / total_assets
            if debt_ratio < 0.3:
                score += 15
            elif debt_ratio < 0.5:
                score += 10
            elif debt_ratio < 0.7:
                score += 5
        
        # Growth
        if revenue_growth > 0.2:
            score += 10
        elif revenue_growth > 0.1:
            score += 5
        
        # Market valuation
        if pe_ratio > 0 and industry_avg_pe > 0:
            pe_ratio_normalized = pe_ratio / industry_avg_pe
            if 0.8 <= pe_ratio_normalized <= 1.2:
                score += 5
        
        return min(max(score, 0), 100)
    
    def _calculate_risk_score(self, total_debt, total_equity, current_assets, current_liabilities,
                             revenue_growth, profit_growth):
        """Calculate risk score based on metrics"""
        score = 50  # Base score
        
        # Debt risk
        if total_equity > 0:
            debt_to_equity = total_debt / total_equity
            if debt_to_equity > 1.5:
                score += 30
            elif debt_to_equity > 1:
                score += 20
            elif debt_to_equity > 0.5:
                score += 10
        
        # Liquidity risk
        if current_liabilities > 0:
            current_ratio = current_assets / current_liabilities
            if current_ratio < 1:
                score += 20
            elif current_ratio < 1.5:
                score += 10
        
        # Growth risk
        if revenue_growth < -0.1:
            score += 15
        elif revenue_growth < 0:
            score += 10
        
        if profit_growth < -0.2:
            score += 15
        elif profit_growth < 0:
            score += 10
        
        return min(max(score, 0), 100)
    
    def train_all_models(self, training_data):
        """Train all ML models"""
        logger.info("Starting training for all models...")
        
        for model_name, model in self.models.items():
            try:
                logger.info(f"Training {model_name} model...")
                
                if model_name in training_data:
                    data = training_data[model_name]
                    
                    if hasattr(model, 'train'):
                        result = model.train(data)
                        self.training_results[model_name] = {
                            'success': True,
                            'result': result,
                            'data_points': len(data)
                        }
                        
                        # Save the trained model
                        model_path = self.trained_models_dir / f"{model_name}_model.pkl"
                        model.save_model(str(model_path))
                        
                        logger.info(f"{model_name} model trained successfully and saved")
                    else:
                        logger.warning(f"{model_name} model does not support training")
                        self.training_results[model_name] = {
                            'success': False,
                            'error': 'Model does not support training'
                        }
                else:
                    logger.warning(f"No training data found for {model_name}")
                    self.training_results[model_name] = {
                        'success': False,
                        'error': 'No training data available'
                    }
                    
            except Exception as e:
                logger.error(f"Training failed for {model_name}: {e}")
                self.training_results[model_name] = {
                    'success': False,
                    'error': str(e)
                }
    
    def get_training_summary(self):
        """Get summary of training results"""
        summary = {
            'total_models': len(self.models),
            'successful_training': sum(1 for result in self.training_results.values() if result.get('success')),
            'failed_training': sum(1 for result in self.training_results.values() if not result.get('success')),
            'models': self.training_results
        }
        
        return summary
    
    def save_training_report(self):
        """Save training report to file"""
        report_path = self.trained_models_dir / 'training_report.json'
        
        report = {
            'timestamp': str(Path(__file__).stat().st_mtime),
            'summary': self.get_training_summary(),
            'training_results': self.training_results
        }
        
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Training report saved to {report_path}")

def main():
    """Main training function"""
    parser = argparse.ArgumentParser(description='Train CorpFin360 ML models')
    parser.add_argument('--models', nargs='+', choices=['financial_health', 'business_valuation', 'market_trends', 'all'],
                       default=['all'], help='Models to train')
    parser.add_argument('--data-size', type=int, default=2000, help='Number of training data points per model')
    parser.add_argument('--output-dir', type=str, help='Output directory for trained models')
    
    args = parser.parse_args()
    
    try:
        # Initialize trainer
        trainer = ModelTrainer()
        trainer.initialize_models()
        
        # Generate training data
        training_data = trainer.generate_training_data()
        
        # Train models
        trainer.train_all_models(training_data)
        
        # Get and display results
        summary = trainer.get_training_summary()
        
        print("\n" + "="*50)
        print("TRAINING SUMMARY")
        print("="*50)
        print(f"Total models: {summary['total_models']}")
        print(f"Successful training: {summary['successful_training']}")
        print(f"Failed training: {summary['failed_training']}")
        print("\nDetailed Results:")
        
        for model_name, result in summary['models'].items():
            status = "✅ SUCCESS" if result.get('success') else "❌ FAILED"
            print(f"  {model_name}: {status}")
            if result.get('success'):
                print(f"    Data points: {result.get('data_points', 'N/A')}")
            else:
                print(f"    Error: {result.get('error', 'Unknown error')}")
        
        # Save training report
        trainer.save_training_report()
        
        print(f"\nTraining report saved to: {trainer.trained_models_dir / 'training_report.json'}")
        print(f"Trained models saved to: {trainer.trained_models_dir}")
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
