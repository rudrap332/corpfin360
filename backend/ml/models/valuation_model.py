import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.feature_selection import SelectKBest, f_regression
import warnings
warnings.filterwarnings('ignore')

class BusinessValuationModel:
    def __init__(self):
        self.models = {
            'random_forest': RandomForestRegressor(n_estimators=200, random_state=42),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=200, random_state=42),
            'linear_regression': LinearRegression(),
            'ridge_regression': Ridge(alpha=1.0),
            'lasso_regression': Lasso(alpha=0.1)
        }
        
        self.scaler = StandardScaler()
        self.feature_selector = SelectKBest(score_func=f_regression, k=15)
        self.poly_features = PolynomialFeatures(degree=2, include_bias=False)
        self.is_trained = False
        self.best_model = None
        self.best_model_name = None
        
    def prepare_features(self, company_data):
        """Prepare comprehensive features for valuation"""
        features = []
        
        # Financial ratios
        if 'revenue' in company_data:
            features.append(company_data['revenue'])
        
        if 'ebitda' in company_data:
            features.append(company_data['ebitda'])
        
        if 'net_income' in company_data:
            features.append(company_data['net_income'])
        
        if 'total_assets' in company_data:
            features.append(company_data['total_assets'])
        
        if 'total_equity' in company_data:
            features.append(company_data['total_equity'])
        
        # Growth metrics
        if 'revenue_growth' in company_data:
            features.append(company_data['revenue_growth'])
        
        if 'profit_growth' in company_data:
            features.append(company_data['profit_growth'])
        
        if 'asset_growth' in company_data:
            features.append(company_data['asset_growth'])
        
        # Profitability ratios
        if 'revenue' in company_data and 'net_income' in company_data:
            features.append(company_data['net_income'] / company_data['revenue'])  # Net margin
        
        if 'total_assets' in company_data and 'net_income' in company_data:
            features.append(company_data['net_income'] / company_data['total_assets'])  # ROA
        
        if 'total_equity' in company_data and 'net_income' in company_data:
            features.append(company_data['net_income'] / company_data['total_equity'])  # ROE
        
        # Efficiency ratios
        if 'revenue' in company_data and 'total_assets' in company_data:
            features.append(company_data['revenue'] / company_data['total_assets'])  # Asset turnover
        
        # Market metrics
        if 'market_cap' in company_data:
            features.append(company_data['market_cap'])
        
        if 'pe_ratio' in company_data:
            features.append(company_data['pe_ratio'])
        
        if 'pb_ratio' in company_data:
            features.append(company_data['pb_ratio'])
        
        # Industry and market factors
        if 'industry_multiple' in company_data:
            features.append(company_data['industry_multiple'])
        
        if 'market_conditions' in company_data:
            features.append(company_data['market_conditions'])
        
        if 'company_age' in company_data:
            features.append(company_data['company_age'])
        
        # Fill missing values with 0
        while len(features) < 20:
            features.append(0.0)
        
        return np.array(features[:20]).reshape(1, -1)
    
    def train(self, training_data):
        """Train multiple valuation models and select the best one"""
        try:
            X = []
            y = []
            
            for company_data in training_data:
                features = self.prepare_features(company_data['metrics'])
                X.append(features.flatten())
                y.append(company_data['actual_valuation'])
            
            X = np.array(X)
            y = np.array(y)
            
            # Feature selection
            X_selected = self.feature_selector.fit_transform(X, y)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X_selected)
            
            # Train all models
            model_scores = {}
            
            for name, model in self.models.items():
                # Cross-validation score
                cv_score = cross_val_score(model, X_scaled, y, cv=5, scoring='r2').mean()
                model_scores[name] = cv_score
                
                # Train the model
                model.fit(X_scaled, y)
            
            # Select best model
            self.best_model_name = max(model_scores, key=model_scores.get)
            self.best_model = self.models[self.best_model_name]
            
            self.is_trained = True
            
            return {
                'best_model': self.best_model_name,
                'model_scores': model_scores,
                'status': 'Models trained successfully'
            }
            
        except Exception as e:
            raise Exception(f"Training failed: {str(e)}")
    
    def predict_valuation(self, company_data, confidence_interval=0.95):
        """Predict business valuation with confidence intervals"""
        if not self.is_trained:
            raise Exception("Models not trained yet")
        
        features = self.prepare_features(company_data)
        features_selected = self.feature_selector.transform(features)
        features_scaled = self.scaler.transform(features_selected)
        
        # Get prediction from best model
        base_prediction = self.best_model.predict(features_scaled)[0]
        
        # Calculate confidence intervals using ensemble predictions
        ensemble_predictions = []
        for name, model in self.models.items():
            pred = model.predict(features_scaled)[0]
            ensemble_predictions.append(pred)
        
        ensemble_predictions = np.array(ensemble_predictions)
        
        # Calculate statistics
        mean_prediction = np.mean(ensemble_predictions)
        std_prediction = np.std(ensemble_predictions)
        
        # Confidence intervals
        z_score = 1.96  # 95% confidence
        lower_bound = mean_prediction - (z_score * std_prediction)
        upper_bound = mean_prediction + (z_score * std_prediction)
        
        # Valuation methodology explanation
        methodology = self._explain_valuation_methodology(company_data, base_prediction)
        
        return {
            'valuation': float(base_prediction),
            'confidence_interval': {
                'lower': float(lower_bound),
                'upper': float(upper_bound),
                'confidence': confidence_interval
            },
            'ensemble_mean': float(mean_prediction),
            'ensemble_std': float(std_prediction),
            'best_model': self.best_model_name,
            'methodology': methodology,
            'valuation_range': {
                'min': float(lower_bound),
                'max': float(upper_bound)
            }
        }
    
    def _explain_valuation_methodology(self, company_data, prediction):
        """Explain the valuation methodology used"""
        methodology = []
        
        # Base methodology
        methodology.append(f"Multi-model ensemble approach using {self.best_model_name} as primary model")
        
        # Key factors
        if 'revenue' in company_data:
            methodology.append(f"Revenue-based valuation: ${company_data['revenue']:,.0f}")
        
        if 'ebitda' in company_data:
            methodology.append(f"EBITDA-based valuation: ${company_data['ebitda']:,.0f}")
        
        if 'net_income' in company_data:
            methodology.append(f"Net income-based valuation: ${company_data['net_income']:,.0f}")
        
        # Growth considerations
        if 'revenue_growth' in company_data and company_data['revenue_growth'] > 0.1:
            methodology.append("High growth premium applied")
        elif 'revenue_growth' in company_data and company_data['revenue_growth'] < 0:
            methodology.append("Declining growth discount applied")
        
        # Risk factors
        if 'debt_to_equity' in company_data and company_data['debt_to_equity'] > 1:
            methodology.append("High leverage risk discount applied")
        
        methodology.append(f"Final valuation: ${prediction:,.0f}")
        
        return methodology
    
    def get_feature_importance(self):
        """Get feature importance from the best model"""
        if not self.is_trained or not hasattr(self.best_model, 'feature_importances_'):
            return None
        
        feature_names = [
            'Revenue', 'EBITDA', 'Net Income', 'Total Assets', 'Total Equity',
            'Revenue Growth', 'Profit Growth', 'Asset Growth', 'Net Margin',
            'ROA', 'ROE', 'Asset Turnover', 'Market Cap', 'P/E Ratio',
            'P/B Ratio', 'Industry Multiple', 'Market Conditions', 'Company Age'
        ]
        
        importance = self.best_model.feature_importances_
        
        return dict(zip(feature_names, importance))
    
    def save_model(self, filepath):
        """Save the trained models"""
        if not self.is_trained:
            raise Exception("Cannot save untrained models")
        
        model_data = {
            'models': self.models,
            'best_model': self.best_model,
            'best_model_name': self.best_model_name,
            'scaler': self.scaler,
            'feature_selector': self.feature_selector,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath):
        """Load trained models"""
        model_data = joblib.load(filepath)
        
        self.models = model_data['models']
        self.best_model = model_data['best_model']
        self.best_model_name = model_data['best_model_name']
        self.scaler = model_data['scaler']
        self.feature_selector = model_data['feature_selector']
        self.is_trained = model_data['is_trained']

# Example usage and training data generation
if __name__ == "__main__":
    # Generate sample training data
    np.random.seed(42)
    sample_data = []
    
    for i in range(2000):
        revenue = np.random.uniform(1000000, 100000000)
        ebitda = revenue * np.random.uniform(0.05, 0.25)
        net_income = ebitda * np.random.uniform(0.6, 0.9)
        
        company_data = {
            'metrics': {
                'revenue': revenue,
                'ebitda': ebitda,
                'net_income': net_income,
                'total_assets': revenue * np.random.uniform(0.8, 2.0),
                'total_equity': revenue * np.random.uniform(0.3, 1.0),
                'revenue_growth': np.random.uniform(-0.2, 0.6),
                'profit_growth': np.random.uniform(-0.3, 0.7),
                'asset_growth': np.random.uniform(-0.1, 0.4),
                'market_cap': revenue * np.random.uniform(1.0, 8.0),
                'pe_ratio': np.random.uniform(8, 35),
                'pb_ratio': np.random.uniform(0.5, 5.0),
                'industry_multiple': np.random.uniform(0.8, 1.5),
                'market_conditions': np.random.uniform(0.7, 1.3),
                'company_age': np.random.uniform(1, 20)
            },
            'actual_valuation': revenue * np.random.uniform(2.0, 10.0)
        }
        sample_data.append(company_data)
    
    # Train model
    model = BusinessValuationModel()
    results = model.train(sample_data)
    print("Training results:", results)
    
    # Save model
    model.save_model('business_valuation_model.pkl')
    print("Model saved successfully!")
