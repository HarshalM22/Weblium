import { WebContainer } from '@webcontainer/api';
import { useEffect, useState, useRef, useCallback } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

type LoadingState = 'idle' | 'installing' | 'building' | 'starting' | 'ready' | 'error';

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState("");
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Refs for cleanup
  const devProcessRef = useRef<any>(null);
  const hasInitializedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Helper to add logs safely
  const addLog = useCallback((message: string, isError = false) => {
    if (!isMountedRef.current) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    
    setLogs(prev => [...prev.slice(-19), logEntry]); // Keep last 20 logs
    
    if (isError) {
      console.error(logEntry);
    } else {
      console.log(logEntry);
    }
  }, []);

  const cleanup = useCallback(() => {
    addLog('Cleaning up processes...');
    
    if (devProcessRef.current) {
      try {
        devProcessRef.current.kill();
        devProcessRef.current = null;
      } catch (e) {
        console.warn('Error killing dev process:', e);
      }
    }
    
    // Remove event listeners
    try {
      webContainer.off('server-ready');
    } catch (e) {
      console.warn('Error removing server-ready listener:', e);
    }
  }, [webContainer, addLog]);

  const setupDevServer = useCallback(async () => {
    if (hasInitializedRef.current || !isMountedRef.current) {
      return;
    }
    
    hasInitializedRef.current = true;
    
    try {
      setError(null);
      setLoadingState('installing');
      addLog('Starting npm install...');

      // 1. Install dependencies
      const installProcess = await webContainer.spawn('npm', ['install']);
      
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          if (!isMountedRef.current) return;
          const text = new TextDecoder().decode(data);
          addLog(`[install] ${text.trim()}`);
        }
      }));

      const installExitCode = await installProcess.exit;
      
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`);
      }

      if (!isMountedRef.current) return;
      
      addLog('npm install completed successfully');
      setLoadingState('starting');

      // 2. Set up server-ready listener BEFORE starting dev server
      const handleServerReady = (port: number, serverUrl: string) => {
        if (!isMountedRef.current) return;
        
        addLog(`Server ready on port ${port}: ${serverUrl}`);
        setUrl(serverUrl);
        setLoadingState('ready');
      };

      webContainer.on('server-ready', handleServerReady);

      // 3. Start dev server
      addLog('Starting dev server...');
      devProcessRef.current = await webContainer.spawn('npm', ['run', 'dev']);
      
      if (!isMountedRef.current) return;

      // Handle dev server output
      devProcessRef.current.output.pipeTo(new WritableStream({
        write(data) {
          if (!isMountedRef.current) return;
          const text = new TextDecoder().decode(data);
          addLog(`[dev] ${text.trim()}`);
        }
      }));

      // Handle dev server exit
      devProcessRef.current.exit.then((exitCode: number) => {
        if (!isMountedRef.current) return;
        
        if (exitCode !== 0) {
          addLog(`Dev server exited with code ${exitCode}`, true);
          setLoadingState('error');
          setError(`Dev server crashed (exit code: ${exitCode})`);
        }
      }).catch((err: any) => {
        if (!isMountedRef.current) return;
        addLog(`Dev server error: ${err.message}`, true);
        setLoadingState('error');
        setError(`Dev server error: ${err.message}`);
      });

    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      addLog(`Setup failed: ${errorMessage}`, true);
      setLoadingState('error');
      setError(errorMessage);
      hasInitializedRef.current = false; // Allow retry
    }
  }, [webContainer, addLog]);

  const retry = useCallback(() => {
    cleanup();
    hasInitializedRef.current = false;
    setUrl('');
    setError(null);
    setLogs([]);
    setLoadingState('idle');
    setupDevServer();
  }, [cleanup, setupDevServer]);

  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;
    setupDevServer();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [setupDevServer, cleanup]);

  // Render loading states
  const renderLoadingContent = () => {
    const stateMessages = {
      idle: 'Initializing...',
      installing: 'Installing dependencies...',
      building: 'Building project...',
      starting: 'Starting dev server...',
      ready: 'Preview ready!',
      error: 'Something went wrong'
    };

    const stateColors = {
      idle: 'text-blue-500',
      installing: 'text-yellow-500',
      building: 'text-orange-500',
      starting: 'text-green-500',
      ready: 'text-green-600',
      error: 'text-red-500'
    };

    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        {/* Loading spinner for non-error states */}
        {loadingState !== 'error' && loadingState !== 'ready' && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        )}
        
        {/* State message */}
        <p className={`text-lg font-medium ${stateColors[loadingState]}`}>
          {stateMessages[loadingState]}
        </p>

        {/* Error handling */}
        {error && (
          <div className="text-center space-y-3">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Show recent logs for debugging */}
        {logs.length > 0 && (
          <details className="w-full max-w-md">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Show logs ({logs.length})
            </summary>
            <div className="mt-2 max-h-32 overflow-y-auto bg-gray-100 rounded p-2 text-xs font-mono">
              {logs.slice(-10).map((log, index) => (
                <div key={index} className="text-gray-700">{log}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header with status */}
      <div className="flex-shrink-0 px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Preview</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              loadingState === 'ready' ? 'bg-green-500' :
              loadingState === 'error' ? 'bg-red-500' :
              'bg-yellow-500'
            }`}></div>
            <span className="text-sm text-gray-600 capitalize">
              {loadingState}
            </span>
            {url && (
              <button
                onClick={retry}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Restart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex">
        {!url ? (
          renderLoadingContent()
        ) : (
          <iframe
            src={url}
            className="w-full h-full border-none"
            title="App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  );
}