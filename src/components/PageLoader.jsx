import { useState, useEffect, useCallback, useMemo } from 'react';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';
import DefaultLoadingSpinner from './DefaultLoadingSpinner';

function PageLoader({ 
  children, 
  loadingComponent = <DefaultLoadingSpinner />, 
  minLoadingTime = 300 
}) {
  // PRECONDITION: children is valid React node
  // PRECONDITION: minLoadingTime >= 0
  
  const [pendingResources, setPendingResources] = useState(new Set());
  const [loadingStartTime] = useState(Date.now());
  const [canDisplay, setCanDisplay] = useState(false);
  
  // INVARIANT: pendingResources contains only registered, incomplete resources
  const isLoading = pendingResources.size > 0;
  
  // Register a new resource that needs to load
  const registerResource = useCallback((id) => {
    // PRECONDITION: id is non-empty string
    setPendingResources(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
      // POSTCONDITION: id is in pendingResources
    });
  }, []);
  
  // Mark a resource as complete
  const markResourceComplete = useCallback((id) => {
    // PRECONDITION: id is non-empty string
    setPendingResources(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
      // POSTCONDITION: id is not in pendingResources
    });
  }, []);
  
  // Effect: Handle transition from loading to ready
  useEffect(() => {
    if (!isLoading && !canDisplay) {
      // PRECONDITION: All resources are loaded
      const elapsedTime = Date.now() - loadingStartTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Enforce minimum loading time
      const timer = setTimeout(() => {
        setCanDisplay(true);
        // POSTCONDITION: Content will be displayed
      }, remainingTime);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, canDisplay, loadingStartTime, minLoadingTime]);
  
  const contextValue = useMemo(() => ({
    registerResource,
    markResourceComplete,
    isLoading
  }), [registerResource, markResourceComplete, isLoading]);
  
  // POSTCONDITION: Returns loading UI if not ready, content if ready
  return (
    <LoadingTrackerContext.Provider value={contextValue}>
      {canDisplay ? children : loadingComponent}
    </LoadingTrackerContext.Provider>
  );
}

export default PageLoader;
