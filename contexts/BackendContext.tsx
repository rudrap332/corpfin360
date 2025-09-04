import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  BackendServices, 
  getAuthToken, 
  setAuthToken, 
  clearAuthToken,
  checkBackendHealth,
  getAvailableModels,
  ModelInfo 
} from '../services/backendService';

// State interface
interface BackendState {
  isConnected: boolean;
  isAuthenticated: boolean;
  authToken: string | null;
  models: ModelInfo[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastHealthCheck: Date | null;
  error: string | null;
  isLoading: boolean;
}

// Action types
type BackendAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: BackendState['connectionStatus'] }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_AUTH_TOKEN'; payload: string | null }
  | { type: 'SET_MODELS'; payload: ModelInfo[] }
  | { type: 'SET_LAST_HEALTH_CHECK'; payload: Date }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_STATE' };

// Initial state
const initialState: BackendState = {
  isConnected: false,
  isAuthenticated: false,
  authToken: null,
  models: [],
  connectionStatus: 'connecting',
  lastHealthCheck: null,
  error: null,
  isLoading: false,
};

// Reducer function
function backendReducer(state: BackendState, action: BackendAction): BackendState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload,
        isConnected: action.payload === 'connected',
      };
    case 'SET_AUTHENTICATED':
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    case 'SET_AUTH_TOKEN':
      return {
        ...state,
        authToken: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_MODELS':
      return {
        ...state,
        models: action.payload,
      };
    case 'SET_LAST_HEALTH_CHECK':
      return {
        ...state,
        lastHealthCheck: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
}

// Context interface
interface BackendContextType {
  state: BackendState;
  // Connection management
  checkConnection: () => Promise<boolean>;
  // Authentication
  login: (token: string) => void;
  logout: () => void;
  // Model management
  refreshModels: () => Promise<void>;
  // Health monitoring
  startHealthMonitoring: () => void;
  stopHealthMonitoring: () => void;
  // Error handling
  clearError: () => void;
}

// Create context
const BackendContext = createContext<BackendContextType | undefined>(undefined);

// Provider component
interface BackendProviderProps {
  children: ReactNode;
  healthCheckInterval?: number; // in milliseconds
}

export const BackendProvider: React.FC<BackendProviderProps> = ({ 
  children, 
  healthCheckInterval = 30000 // 30 seconds default
}) => {
  const [state, dispatch] = useReducer(backendReducer, initialState);
  const healthCheckRef = React.useRef<NodeJS.Timeout | null>(null);

  // Check backend connection
  const checkConnection = async (): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const health = await checkBackendHealth();
      
      if (health.status === 'OK') {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'connected' });
        dispatch({ type: 'SET_LAST_HEALTH_CHECK', payload: new Date() });
        return true;
      } else {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
        dispatch({ type: 'SET_ERROR', payload: 'Backend health check failed' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: 'error' });
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Connection failed' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Login function
  const login = (token: string) => {
    setAuthToken(token);
    dispatch({ type: 'SET_AUTH_TOKEN', payload: token });
  };

  // Logout function
  const logout = () => {
    clearAuthToken();
    dispatch({ type: 'SET_AUTH_TOKEN', payload: null });
  };

  // Refresh available models
  const refreshModels = async () => {
    try {
      const response = await getAvailableModels();
      if (response.success) {
        dispatch({ type: 'SET_MODELS', payload: response.data });
      }
    } catch (error) {
      console.error('Failed to refresh models:', error);
    }
  };

  // Start health monitoring
  const startHealthMonitoring = () => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
    }
    
    healthCheckRef.current = setInterval(async () => {
      await checkConnection();
    }, healthCheckInterval);
  };

  // Stop health monitoring
  const stopHealthMonitoring = () => {
    if (healthCheckRef.current) {
      clearInterval(healthCheckRef.current);
      healthCheckRef.current = null;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  // Initialize on mount
  useEffect(() => {
    const initializeBackend = async () => {
      // Check for existing auth token
      const existingToken = getAuthToken();
      if (existingToken) {
        dispatch({ type: 'SET_AUTH_TOKEN', payload: existingToken });
      }

      // Check initial connection
      await checkConnection();

      // Start health monitoring
      startHealthMonitoring();

      // Load available models
      await refreshModels();
    };

    initializeBackend();

    // Cleanup on unmount
    return () => {
      stopHealthMonitoring();
    };
  }, []);

  // Context value
  const contextValue: BackendContextType = {
    state,
    checkConnection,
    login,
    logout,
    refreshModels,
    startHealthMonitoring,
    stopHealthMonitoring,
    clearError,
  };

  return (
    <BackendContext.Provider value={contextValue}>
      {children}
    </BackendContext.Provider>
  );
};

// Custom hook to use the backend context
export const useBackend = (): BackendContextType => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('useBackend must be used within a BackendProvider');
  }
  return context;
};

// Hook for just the state
export const useBackendState = (): BackendState => {
  const { state } = useBackend();
  return state;
};

// Hook for just the actions
export const useBackendActions = (): Omit<BackendContextType, 'state'> => {
  const { state, ...actions } = useBackend();
  return actions;
};
