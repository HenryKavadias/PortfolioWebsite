import { createContext, useState, useCallback, useMemo } from 'react';

export const LoadingTrackerContext = createContext({
  registerResource: () => {},
  markResourceComplete: () => {},
  isLoading: false
});

export function LoadingTrackerProvider({ children }) {
  const [pendingResources, setPendingResources] = useState(new Set());

  // INVARIANT: isLoading = pendingResources.size > 0
  const isLoading = pendingResources.size > 0;

  // Register a new resource that needs to load
  // PRECONDITION: id is non-empty string
  // POSTCONDITION: id is in pendingResources
  const registerResource = useCallback((id) => {
    setPendingResources(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Mark a resource as complete
  // PRECONDITION: id is non-empty string
  // POSTCONDITION: id is not in pendingResources
  const markResourceComplete = useCallback((id) => {
    setPendingResources(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const contextValue = useMemo(() => ({
    registerResource,
    markResourceComplete,
    isLoading
  }), [registerResource, markResourceComplete, isLoading]);

  return (
    <LoadingTrackerContext.Provider value={contextValue}>
      {children}
    </LoadingTrackerContext.Provider>
  );
}
