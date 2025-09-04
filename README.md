
 🚀 CorpFin360 Frontend–Backend Integration Guide  

This guide will help you connect the React frontend with the Node.js + Python (ML) backend so everything works smoothly together.



 🏗️ System Overview  

Here’s how the pieces talk to each other:

```
React Frontend  ⇄  Node.js Backend  ⇄  Python ML Models
```

- Frontend (React): The user interface (graphs, dashboards, forms).  
- Backend (Node.js): API layer, authentication, database connections, orchestration.  
- ML Models (Python): Heavy lifting – predictions, analysis, and valuations.  



 ⚡ Getting Started  

 1. Start the Backend  
Move into the backend folder and run:

```bash
cd backend
chmod +x start.sh
./start.sh
```

What this does:
- Installs dependencies  
- Trains ML models (first time might take longer)  
- Starts the Express server on http://localhost:5000  



 2. Start the Frontend  
In a new terminal, run:

```bash
npm run dev
```

This launches the frontend on http://localhost:5173 and automatically points it to the backend.



 🔧 Configuring Things  

 Frontend Environment Variables  

Create a `.env` in the React project root:

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_API_TIMEOUT=30000
REACT_APP_HEALTH_CHECK_INTERVAL=30000
```

(Only the first line is mandatory.)  



 Backend Environment Variables  

The backend uses `backend/.env` (you can copy from `env.example`):

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/corpfin360
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
```



 🔌 Talking to the Backend API  

The frontend never calls APIs directly – it uses a service layer (`backendService.ts`).

Example usage:

```typescript
// Financial Health
const health = await BackendServices.analyzeFinancialHealth({ companyData: { revenue: 5000000, net_income: 750000 } });

// Business Valuation
const valuation = await BackendServices.estimateBusinessValuation({ companyData: { revenue: 10000000, ebitda: 2500000 } });

// Market Trends
const trends = await BackendServices.analyzeMarketTrends({ marketData: { current_price: 150, volume: 25000000 } });
```



 Using Context State  

Use the `BackendContext` to manage connection status:

```tsx
const MyComponent = () => {
  const { isConnected } = useBackend();
  const { connectionStatus, models } = useBackendState();

  if (!isConnected) return <p>Backend not connected</p>;

  return (
    <div>
      <p>Status: {connectionStatus}</p>
      <p>Models Loaded: {models.length}</p>
    </div>
  );
};
```



 📊 The AI/ML Services  

 ✅ 1. Financial Health Analysis  
- Endpoint: `POST /api/financial-health/assess`  
- Returns a company’s health score, risk level, and recommendations.  

Example output: Score = 78 ("Good"), Risk = Low, Suggestions to improve liquidity.  



 ✅ 2. Business Valuation  
- Endpoint: `POST /api/valuation/estimate`  
- Returns a valuation number, confidence range, methodology, and insights.  

It tells you not just the valuation, but also why and how confident it is.  



 ✅ 3. Market Trend Analysis  
- Endpoint: `POST /api/market-analysis/trends`  
- Predicts future prices, volatility, and overall trend direction.  
- Also provides recommendations (e.g., “Hold”, “Buy”, “Caution – High Volatility”).  



 🛡️ Handling Errors  

- Wrap API calls with `try/catch`.  
- Check for BackendError (API returned something wrong) vs. Network Error (server unreachable).  

Reusable retry function:

```typescript
const result = await withRetry(
  () => BackendServices.analyzeFinancialHealth(request),
  3,   // try up to 3 times
  1000 // wait 1 second between tries
);
```

Batch API calls are supported too – useful when analyzing many companies.



 🔍 Debugging and Monitoring  

- React Component: `BackendStatus` shows live health status, models loaded, errors.  
- Backend monitors itself: DB, Redis, model availability.  
- Logs:  
  - `backend/logs/combined.log` → all logs  
  - `backend/logs/error.log` → errors only  



 🚨 Common Problems & Fixes  

1. Backend not starting?  
   - Check Node.js (≥18), Python (≥3.8), MongoDB, and Redis.  

2. Models not training?  
   - Missing Python packages or no disk space.  

3. Frontend can’t connect?  
   - Check backend is online at port 5000.  
   - Ensure CORS settings and firewall allow traffic.  

4. Auth issues?  
   - Update `JWT_SECRET` in `.env`.  
   - Clear `localStorage`.  



 🔄 Dev Workflow

```bash
 Backend live reload
cd backend
npm run dev

 Frontend hot reload
npm run dev

 Retrain ML models
cd backend
python3 ml/train_models.py

 Run tests
npm test
```



 📦 Production Deployment  

- Change `.env` URLs to production API endpoints.  
- Build frontend: `npm run build`  
- Run backend: `npm run start`  
- Or run all via Docker: `docker-compose up --build`  



 🤝 Contribution Rules  

1. Keep code clean and consistent.  
2. Always add TypeScript types.  
3. Handle errors gracefully.  
4. Test both ends (backend services + frontend UI).  
5. Update this guide if you change integration.  



 📞 Support  

If things break:  
1. Check backend logs (`backend/logs/`)  
2. Verify `.env` configs  
3. Curl the API to isolate issues  
4. Check internet / firewall  
5. Re‑visit this guide  

