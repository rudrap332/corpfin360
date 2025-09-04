import React from 'react';
import { useBackendState } from '../../contexts/BackendContext';

const BackendStatus: React.FC = () => {
  const { 
    connectionStatus, 
    isConnected, 
    lastHealthCheck, 
    error, 
    models,
    isLoading 
  } = useBackendState();

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'connecting':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'disconnected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'error':
      case 'disconnected':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Connection Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const formatLastCheck = () => {
    if (!lastHealthCheck) return 'Never';
    return new Date(lastHealthCheck).toLocaleTimeString();
  };

  const getModelStatus = () => {
    const activeModels = models.filter(model => model.status === 'active');
    const totalModels = models.length;
    
    if (totalModels === 0) return 'No models available';
    return `${activeModels.length}/${totalModels} models active`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-600">Checking backend...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Backend Status</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
          <span className="mr-2">{getStatusIcon()}</span>
          {getStatusText()}
        </div>
      </div>

      <div className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Connection:</span>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Last Health Check */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Check:</span>
          <span className="text-sm text-gray-900">{formatLastCheck()}</span>
        </div>

        {/* ML Models Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">ML Models:</span>
          <span className="text-sm text-gray-900">{getModelStatus()}</span>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Model Details */}
        {models.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Available Models</h4>
            <div className="space-y-2">
              {models.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{model.name}</span>
                    <div className="text-xs text-gray-500">{model.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      model.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {model.status}
                    </span>
                    <span className="text-xs text-gray-500">{model.accuracy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button 
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
          {!isConnected && (
            <button 
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              onClick={() => window.location.reload()}
            >
              Reconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;
