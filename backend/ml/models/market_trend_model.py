import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LinearRegression
import warnings
warnings.filterwarnings('ignore')

class MarketTrendModel:
    def __init__(self):
        self.price_predictor = RandomForestRegressor(n_estimators=200, random_state=42)
        self.volatility_predictor = GradientBoostingRegressor(n_estimators=200, random_state=42)
        self.sentiment_analyzer = LinearRegression()
        self.scaler = StandardScaler()
        self.price_scaler = MinMaxScaler()
        self.volatility_scaler = MinMaxScaler()
        self.tfidf_vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.is_trained = False
        
    def prepare_market_features(self, market_data):
        """Prepare features for market trend prediction"""
        features = []
        
        # Price-based features
        if 'current_price' in market_data:
            features.append(market_data['current_price'])
        
        if 'price_change' in market_data:
            features.append(market_data['price_change'])
        
        if 'price_change_percent' in market_data:
            features.append(market_data['price_change_percent'])
        
        # Volume features
        if 'volume' in market_data:
            features.append(market_data['volume'])
        
        if 'volume_change' in market_data:
            features.append(market_data['volume_change'])
        
        # Technical indicators
        if 'moving_average_20' in market_data:
            features.append(market_data['moving_average_20'])
        
        if 'moving_average_50' in market_data:
            features.append(market_data['moving_average_50'])
        
        if 'rsi' in market_data:
            features.append(market_data['rsi'])
        
        if 'macd' in market_data:
            features.append(market_data['macd'])
        
        if 'bollinger_upper' in market_data and 'current_price' in market_data:
            features.append(market_data['current_price'] / market_data['bollinger_upper'])
        
        if 'bollinger_lower' in market_data and 'current_price' in market_data:
            features.append(market_data['current_price'] / market_data['bollinger_lower'])
        
        # Market sentiment features
        if 'fear_greed_index' in market_data:
            features.append(market_data['fear_greed_index'])
        
        if 'vix' in market_data:
            features.append(market_data['vix'])
        
        # Economic indicators
        if 'interest_rate' in market_data:
            features.append(market_data['interest_rate'])
        
        if 'inflation_rate' in market_data:
            features.append(market_data['inflation_rate'])
        
        if 'gdp_growth' in market_data:
            features.append(market_data['gdp_growth'])
        
        if 'unemployment_rate' in market_data:
            features.append(market_data['unemployment_rate'])
        
        # Sector-specific features
        if 'sector_performance' in market_data:
            features.append(market_data['sector_performance'])
        
        if 'industry_trend' in market_data:
            features.append(market_data['industry_trend'])
        
        # Fill missing values with 0
        while len(features) < 25:
            features.append(0.0)
        
        return np.array(features[:25]).reshape(1, -1)
    
    def prepare_sentiment_features(self, news_data):
        """Prepare sentiment analysis features from news and social media"""
        if not news_data or not isinstance(news_data, list):
            return np.zeros((1, 1000))
        
        # Combine all news headlines and content
        combined_text = ' '.join([str(item.get('headline', '')) + ' ' + str(item.get('content', '')) 
                                 for item in news_data])
        
        # Transform text to TF-IDF features
        try:
            features = self.tfidf_vectorizer.transform([combined_text])
            return features
        except:
            return np.zeros((1, 1000))
    
    def train(self, training_data):
        """Train the market trend prediction models"""
        try:
            X_market = []
            y_price = []
            y_volatility = []
            X_sentiment = []
            y_sentiment = []
            
            for data_point in training_data:
                # Market features
                market_features = self.prepare_market_features(data_point['market_data'])
                X_market.append(market_features.flatten())
                
                # Price prediction target (next day's price)
                if 'next_day_price' in data_point:
                    y_price.append(data_point['next_day_price'])
                
                # Volatility prediction target
                if 'next_day_volatility' in data_point:
                    y_volatility.append(data_point['next_day_volatility'])
                
                # Sentiment features and targets
                if 'news_data' in data_point and 'sentiment_score' in data_point:
                    sentiment_features = self.prepare_sentiment_features(data_point['news_data'])
                    X_sentiment.append(sentiment_features.toarray().flatten())
                    y_sentiment.append(data_point['sentiment_score'])
            
            # Train market prediction models
            if X_market and y_price:
                X_market = np.array(X_market)
                y_price = np.array(y_price)
                
                # Scale market features
                X_market_scaled = self.scaler.fit_transform(X_market)
                
                # Scale price targets
                y_price_scaled = self.price_scaler.fit_transform(y_price.reshape(-1, 1)).flatten()
                
                # Train price predictor
                self.price_predictor.fit(X_market_scaled, y_price_scaled)
            
            if X_market and y_volatility:
                # Scale volatility targets
                y_volatility_scaled = self.volatility_scaler.fit_transform(y_volatility.reshape(-1, 1)).flatten()
                
                # Train volatility predictor
                self.volatility_predictor.fit(X_market_scaled, y_volatility_scaled)
            
            # Train sentiment analyzer
            if X_sentiment and y_sentiment:
                X_sentiment = np.array(X_sentiment)
                y_sentiment = np.array(y_sentiment)
                
                self.sentiment_analyzer.fit(X_sentiment, y_sentiment)
            
            self.is_trained = True
            
            return {
                'status': 'Market trend models trained successfully',
                'price_model_trained': len(y_price) > 0,
                'volatility_model_trained': len(y_volatility) > 0,
                'sentiment_model_trained': len(y_sentiment) > 0
            }
            
        except Exception as e:
            raise Exception(f"Training failed: {str(e)}")
    
    def predict_market_trends(self, market_data, news_data=None, prediction_horizon=5):
        """Predict market trends and price movements"""
        if not self.is_trained:
            raise Exception("Models not trained yet")
        
        predictions = {
            'price_predictions': [],
            'volatility_predictions': [],
            'trend_direction': 'neutral',
            'confidence_score': 0.0,
            'key_factors': []
        }
        
        # Prepare features
        market_features = self.prepare_market_features(market_data)
        market_features_scaled = self.scaler.transform(market_features)
        
        # Price predictions
        if hasattr(self.price_predictor, 'predict'):
            price_pred_scaled = self.price_predictor.predict(market_features_scaled)
            price_pred = self.price_scaler.inverse_transform(price_pred_scaled.reshape(-1, 1)).flatten()
            
            for i in range(min(prediction_horizon, len(price_pred))):
                predictions['price_predictions'].append({
                    'day': i + 1,
                    'predicted_price': float(price_pred[i]),
                    'confidence': 0.85  # Base confidence
                })
        
        # Volatility predictions
        if hasattr(self.volatility_predictor, 'predict'):
            volatility_pred_scaled = self.volatility_predictor.predict(market_features_scaled)
            volatility_pred = self.volatility_scaler.inverse_transform(volatility_pred_scaled.reshape(-1, 1)).flatten()
            
            for i in range(min(prediction_horizon, len(volatility_pred))):
                predictions['volatility_predictions'].append({
                    'day': i + 1,
                    'predicted_volatility': float(volatility_pred[i]),
                    'risk_level': self._categorize_volatility(volatility_pred[i])
                })
        
        # Sentiment analysis
        if news_data and hasattr(self.sentiment_analyzer, 'predict'):
            sentiment_features = self.prepare_sentiment_features(news_data)
            sentiment_score = self.sentiment_analyzer.predict(sentiment_features)[0]
            
            predictions['sentiment_score'] = float(sentiment_score)
            predictions['sentiment_category'] = self._categorize_sentiment(sentiment_score)
        
        # Determine trend direction
        if predictions['price_predictions']:
            current_price = market_data.get('current_price', 0)
            future_price = predictions['price_predictions'][-1]['predicted_price']
            
            if future_price > current_price * 1.02:
                predictions['trend_direction'] = 'bullish'
                predictions['confidence_score'] = 0.8
            elif future_price < current_price * 0.98:
                predictions['trend_direction'] = 'bearish'
                predictions['confidence_score'] = 0.8
            else:
                predictions['trend_direction'] = 'sideways'
                predictions['confidence_score'] = 0.6
        
        # Identify key factors
        predictions['key_factors'] = self._identify_key_factors(market_data)
        
        return predictions
    
    def _categorize_volatility(self, volatility_score):
        """Categorize volatility levels"""
        if volatility_score < 0.1:
            return 'Low'
        elif volatility_score < 0.25:
            return 'Moderate'
        elif volatility_score < 0.5:
            return 'High'
        else:
            return 'Extreme'
    
    def _categorize_sentiment(self, sentiment_score):
        """Categorize sentiment scores"""
        if sentiment_score > 0.6:
            return 'Very Positive'
        elif sentiment_score > 0.3:
            return 'Positive'
        elif sentiment_score > -0.3:
            return 'Neutral'
        elif sentiment_score > -0.6:
            return 'Negative'
        else:
            return 'Very Negative'
    
    def _identify_key_factors(self, market_data):
        """Identify key factors influencing market trends"""
        factors = []
        
        if 'rsi' in market_data:
            if market_data['rsi'] > 70:
                factors.append('Overbought conditions (RSI > 70)')
            elif market_data['rsi'] < 30:
                factors.append('Oversold conditions (RSI < 30)')
        
        if 'vix' in market_data:
            if market_data['vix'] > 30:
                factors.append('High market volatility (VIX > 30)')
            elif market_data['vix'] < 15:
                factors.append('Low market volatility (VIX < 15)')
        
        if 'fear_greed_index' in market_data:
            if market_data['fear_greed_index'] < 25:
                factors.append('Extreme fear in market')
            elif market_data['fear_greed_index'] > 75:
                factors.append('Extreme greed in market')
        
        if 'interest_rate' in market_data and 'current_price' in market_data:
            if market_data['interest_rate'] > 5:
                factors.append('High interest rate environment')
        
        return factors
    
    def get_feature_importance(self):
        """Get feature importance from the models"""
        importance_data = {}
        
        if hasattr(self.price_predictor, 'feature_importances_'):
            feature_names = [
                'Current Price', 'Price Change', 'Price Change %', 'Volume', 'Volume Change',
                'MA20', 'MA50', 'RSI', 'MACD', 'Bollinger Upper', 'Bollinger Lower',
                'Fear Greed Index', 'VIX', 'Interest Rate', 'Inflation Rate', 'GDP Growth',
                'Unemployment Rate', 'Sector Performance', 'Industry Trend'
            ]
            
            importance_data['price_prediction'] = dict(zip(
                feature_names, 
                self.price_predictor.feature_importances_
            ))
        
        if hasattr(self.volatility_predictor, 'feature_importances_'):
            importance_data['volatility_prediction'] = dict(zip(
                feature_names, 
                self.volatility_predictor.feature_importances_
            ))
        
        return importance_data
    
    def save_model(self, filepath):
        """Save the trained models"""
        if not self.is_trained:
            raise Exception("Cannot save untrained models")
        
        model_data = {
            'price_predictor': self.price_predictor,
            'volatility_predictor': self.volatility_predictor,
            'sentiment_analyzer': self.sentiment_analyzer,
            'scaler': self.scaler,
            'price_scaler': self.price_scaler,
            'volatility_scaler': self.volatility_scaler,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
    
    def load_model(self, filepath):
        """Load trained models"""
        model_data = joblib.load(filepath)
        
        self.price_predictor = model_data['price_predictor']
        self.volatility_predictor = model_data['volatility_predictor']
        self.sentiment_analyzer = model_data['sentiment_analyzer']
        self.scaler = model_data['scaler']
        self.price_scaler = model_data['price_scaler']
        self.volatility_scaler = model_data['volatility_scaler']
        self.tfidf_vectorizer = model_data['tfidf_vectorizer']
        self.is_trained = model_data['is_trained']

# Example usage and training data generation
if __name__ == "__main__":
    # Generate sample training data
    np.random.seed(42)
    sample_data = []
    
    for i in range(1000):
        current_price = np.random.uniform(100, 500)
        
        market_data = {
            'current_price': current_price,
            'price_change': np.random.uniform(-20, 20),
            'price_change_percent': np.random.uniform(-0.1, 0.1),
            'volume': np.random.uniform(1000000, 10000000),
            'volume_change': np.random.uniform(-0.3, 0.3),
            'moving_average_20': current_price * np.random.uniform(0.95, 1.05),
            'moving_average_50': current_price * np.random.uniform(0.9, 1.1),
            'rsi': np.random.uniform(20, 80),
            'macd': np.random.uniform(-2, 2),
            'bollinger_upper': current_price * 1.1,
            'bollinger_lower': current_price * 0.9,
            'fear_greed_index': np.random.uniform(0, 100),
            'vix': np.random.uniform(10, 40),
            'interest_rate': np.random.uniform(2, 8),
            'inflation_rate': np.random.uniform(1, 6),
            'gdp_growth': np.random.uniform(-2, 5),
            'unemployment_rate': np.random.uniform(3, 10),
            'sector_performance': np.random.uniform(-0.2, 0.3),
            'industry_trend': np.random.uniform(-0.15, 0.25)
        }
        
        # Generate future prices
        next_day_price = current_price * (1 + np.random.uniform(-0.05, 0.05))
        next_day_volatility = np.random.uniform(0.05, 0.3)
        
        # Generate news data
        news_data = [
            {
                'headline': f'Market update for day {i}',
                'content': f'Financial news content for day {i}'
            }
        ]
        
        data_point = {
            'market_data': market_data,
            'next_day_price': next_day_price,
            'next_day_volatility': next_day_volatility,
            'news_data': news_data,
            'sentiment_score': np.random.uniform(-1, 1)
        }
        
        sample_data.append(data_point)
    
    # Train model
    model = MarketTrendModel()
    results = model.train(sample_data)
    print("Training results:", results)
    
    # Save model
    model.save_model('market_trend_model.pkl')
    print("Model saved successfully!")
