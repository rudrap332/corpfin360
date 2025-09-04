import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, mean_squared_error, r2_score
from sklearn.feature_selection import SelectKBest, f_classif
import warnings
warnings.filterwarnings('ignore')

class FinancialHealthModel:
    def __init__(self):
        self.health_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.risk_regressor = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.feature_selector = SelectKBest(score_func=f_classif, k=10)
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        
    def prepare_features(self, data):
        """Prepare features for the model"""
        features = []
        
        # Financial ratios
        if 'revenue' in data and 'total_assets' in data:
            features.append(data['revenue'] / data['total_assets'])  # Asset turnover
        
        if 'net_income' in data and 'revenue' in data:
            features.append(data['net_income'] / data['revenue'])  # Net profit margin
        
        if 'total_debt' in data and 'total_equity' in data:
            features.append(data['total_debt'] / data['total_equity'])  # Debt-to-equity
        
        if 'current_assets' in data and 'current_liabilities' in data:
            features.append(data['current_assets'] / data['current_liabilities'])  # Current ratio
        
        if 'cash' in data and 'current_liabilities' in data:
            features.append(data['cash'] / data['current_liabilities'])  # Cash ratio
        
        # Growth metrics
        if 'revenue_growth' in data:
            features.append(data['revenue_growth'])
        
        if 'profit_growth' in data:
            features.append(data['profit_growth'])
        
        # Market metrics
        if 'market_cap' in data and 'revenue' in data:
            features.append(data['market_cap'] / data['revenue'])  # Price-to-sales
        
        if 'pe_ratio' in data:
            features.append(data['pe_ratio'])
        
        # Industry benchmarks
        if 'industry_avg_pe' in data and 'pe_ratio' in data:
            features.append(data['pe_ratio'] / data['industry_avg_pe'])
        
        # Fill missing values with industry averages or 0
        while len(features) < 15:  # Ensure consistent feature count
            features.append(0.0)
        
        return np.array(features[:15]).reshape(1, -1)
    
    def train(self, training_data):
        """Train the model with historical financial data"""
        try:
            X = []
            y_health = []
            y_risk = []
            
            for company_data in training_data:
                features = self.prepare_features(company_data['metrics'])
                X.append(features.flatten())
                
                # Health score (0-100)
                y_health.append(company_data['health_score'])
                
                # Risk score (0-100, higher = more risky)
                y_risk.append(company_data['risk_score'])
            
            X = np.array(X)
            y_health = np.array(y_health)
            y_risk = np.array(y_risk)
            
            # Feature selection
            X_selected = self.feature_selector.fit_transform(X, y_health)
            
            # Scale features
            X_scaled = self.scaler.fit_transform(X_selected)
            
            # Train health classifier
            self.health_classifier.fit(X_scaled, y_health)
            
            # Train risk regressor
            self.risk_regressor.fit(X_scaled, y_risk)
            
            self.is_trained = True
            
            # Evaluate model performance
            health_score = cross_val_score(self.health_classifier, X_scaled, y_health, cv=5).mean()
            risk_score = cross_val_score(self.risk_regressor, X_scaled, y_risk, cv=5).mean()
            
            return {
                'health_accuracy': health_score,
                'risk_r2': risk_score,
                'status': 'Model trained successfully'
            }
            
        except Exception as e:
            raise Exception(f"Training failed: {str(e)}")
    
    def predict_health(self, company_data):
        """Predict financial health score"""
        if not self.is_trained:
            raise Exception("Model not trained yet")
        
        features = self.prepare_features(company_data)
        features_selected = self.feature_selector.transform(features)
        features_scaled = self.scaler.transform(features_selected)
        
        health_score = self.health_classifier.predict(features_scaled)[0]
        risk_score = self.risk_regressor.predict(features_scaled)[0]
        
        return {
            'health_score': int(health_score),
            'risk_score': float(risk_score),
            'health_category': self._categorize_health(health_score),
            'risk_category': self._categorize_risk(risk_score)
        }
    
    def _categorize_health(self, score):
        """Categorize health score"""
        if score >= 80:
            return 'Excellent'
        elif score >= 60:
            return 'Good'
        elif score >= 40:
            return 'Fair'
        elif score >= 20:
            return 'Poor'
        else:
            return 'Critical'
    
    def _categorize_risk(self, score):
        """Categorize risk score"""
        if score <= 20:
            return 'Low Risk'
        elif score <= 40:
            return 'Moderate Risk'
        elif score <= 60:
            return 'High Risk'
        else:
            return 'Very High Risk'
    
    def save_model(self, filepath):
        """Save the trained model"""
        if not self.is_trained:
            raise Exception("Cannot save untrained model")
        
        model_data = {
            'health_classifier': self.health_classifier,
            'risk_regressor': self.risk_regressor,
            'scaler': self.scaler,
            'feature_selector': self.feature_selector,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath):
        """Load a trained model"""
        model_data = joblib.load(filepath)
        
        self.health_classifier = model_data['health_classifier']
        self.risk_regressor = model_data['risk_regressor']
        self.scaler = model_data['scaler']
        self.feature_selector = model_data['feature_selector']
        self.is_trained = model_data['is_trained']
    
    def get_feature_importance(self):
        """Get feature importance scores"""
        if not self.is_trained:
            raise Exception("Model not trained yet")
        
        feature_names = [
            'Asset Turnover', 'Net Profit Margin', 'Debt-to-Equity',
            'Current Ratio', 'Cash Ratio', 'Revenue Growth', 'Profit Growth',
            'Price-to-Sales', 'P/E Ratio', 'Industry P/E Ratio'
        ]
        
        importance = self.health_classifier.feature_importances_
        
        return dict(zip(feature_names, importance))

# Example usage and training data generation
if __name__ == "__main__":
    # Generate sample training data
    np.random.seed(42)
    sample_data = []
    
    for i in range(1000):
        company_data = {
            'metrics': {
                'revenue': np.random.uniform(1000000, 100000000),
                'total_assets': np.random.uniform(2000000, 200000000),
                'net_income': np.random.uniform(-5000000, 20000000),
                'total_debt': np.random.uniform(0, 100000000),
                'total_equity': np.random.uniform(1000000, 150000000),
                'current_assets': np.random.uniform(500000, 50000000),
                'current_liabilities': np.random.uniform(200000, 30000000),
                'cash': np.random.uniform(100000, 20000000),
                'revenue_growth': np.random.uniform(-0.3, 0.5),
                'profit_growth': np.random.uniform(-0.5, 0.8),
                'market_cap': np.random.uniform(5000000, 500000000),
                'pe_ratio': np.random.uniform(5, 50),
                'industry_avg_pe': np.random.uniform(15, 25)
            },
            'health_score': np.random.randint(0, 101),
            'risk_score': np.random.uniform(0, 100)
        }
        sample_data.append(company_data)
    
    # Train model
    model = FinancialHealthModel()
    results = model.train(sample_data)
    print("Training results:", results)
    
    # Save model
    model.save_model('financial_health_model.pkl')
    print("Model saved successfully!")
