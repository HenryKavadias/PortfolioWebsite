import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import { LoadingTrackerProvider, LoadingTrackerContext } from './LoadingTrackerContext';

/**
 * Property-Based Tests for LoadingTrackerContext
 * 
 * **Validates: Requirements 5.1, 5.4, 5.5**
 * 
 * Property 1: Loading State Consistency
 * Property 6: Resource Registration Idempotency
 * Property 7: Resource Completion Robustness
 */
describe('LoadingTrackerContext - Property Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  // Helper to create a unique test ID for each test run
  const createTestId = () => `test-${Math.random().toString(36).substr(2, 9)}`;

  /**
   * Property 1: Loading State Consistency
   * 
   * For any state of the LoadingTracker, the loading state should equal true
   * if and only if the pending resources set is non-empty.
   * 
   * **Validates: Requirements 2.6, 5.1**
   */
  describe('Property 1: Loading State Consistency', () => {
    it('should maintain isLoading = true when any resources are registered', async () => {
      // Generate arbitrary sequences of resource registrations
      const resourceSequenceArbitrary = fc.array(
        fc.string({ minLength: 5, maxLength: 15 }),
        { minLength: 1, maxLength: 10 }
      );

      await fc.assert(
        fc.asyncProperty(resourceSequenceArbitrary, async (resourceIds) => {
          const testId = createTestId();
          let capturedIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture loading state on every render
            capturedIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Register all resources
              resourceIds.forEach(id => {
                context.registerResource(`${testId}-${id}`);
              });
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for effects to run and state to update
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // INVARIANT: isLoading should be true when resources are pending
          expect(capturedIsLoading).toBe(true);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should maintain isLoading = false when no resources are pending', async () => {
      // Generate sequences where all resources are completed
      const resourceSequenceArbitrary = fc.array(
        fc.string({ minLength: 5, maxLength: 15 }),
        { minLength: 1, maxLength: 10 }
      );

      await fc.assert(
        fc.asyncProperty(resourceSequenceArbitrary, async (resourceIds) => {
          const testId = createTestId();
          let capturedIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture loading state on every render
            capturedIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Register and immediately complete all resources
              resourceIds.forEach(id => {
                const fullId = `${testId}-${id}`;
                context.registerResource(fullId);
                context.markResourceComplete(fullId);
              });
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations to complete
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // INVARIANT: isLoading should be false when no resources are pending
          expect(capturedIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should transition isLoading correctly as resources are registered and completed', async () => {
      const resourceCountArbitrary = fc.integer({ min: 2, max: 8 });

      await fc.assert(
        fc.asyncProperty(resourceCountArbitrary, async (count) => {
          const testId = createTestId();
          const resourceIds = Array.from({ length: count }, (_, i) => `${testId}-resource-${i}`);
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture the current loading state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Register all resources
              resourceIds.forEach(id => {
                context.registerResource(id);
              });
              
              // Complete all but one resource
              for (let i = 0; i < resourceIds.length - 1; i++) {
                context.markResourceComplete(resourceIds[i]);
              }
              
              // Complete the last resource
              context.markResourceComplete(resourceIds[resourceIds.length - 1]);
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for all operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // After all resources are completed, should not be loading
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 15 }
      );
    });

    it('should maintain invariant through arbitrary sequences of operations', async () => {
      const operationSequenceArbitrary = fc.array(
        fc.record({
          type: fc.constantFrom('register', 'complete'),
          resourceId: fc.string({ minLength: 3, maxLength: 10 })
        }),
        { minLength: 5, maxLength: 20 }
      );

      await fc.assert(
        fc.asyncProperty(operationSequenceArbitrary, async (operations) => {
          const testId = createTestId();
          const pendingResources = new Set();
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture current state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Execute operations and track expected state
              operations.forEach((op) => {
                const id = `${testId}-${op.resourceId}`;
                
                if (op.type === 'register') {
                  context.registerResource(id);
                  pendingResources.add(id);
                } else if (op.type === 'complete') {
                  context.markResourceComplete(id);
                  pendingResources.delete(id);
                }
              });
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for all operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Verify final state matches expected
          const expectedIsLoading = pendingResources.size > 0;
          expect(finalIsLoading).toBe(expectedIsLoading);
          
          unmount();
        }),
        { numRuns: 15 }
      );
    });
  });

  /**
   * Property 6: Resource Registration Idempotency
   * 
   * For any resource identifier, registering it multiple times with the
   * LoadingTracker should have the same effect as registering it once.
   * 
   * **Validates: Requirements 5.4**
   */
  describe('Property 6: Resource Registration Idempotency', () => {
    it('should handle duplicate registrations without creating inconsistent state', async () => {
      const configArbitrary = fc.record({
        resourceId: fc.string({ minLength: 5, maxLength: 15 }),
        registrationCount: fc.integer({ min: 2, max: 10 })
      });

      await fc.assert(
        fc.asyncProperty(configArbitrary, async ({ resourceId, registrationCount }) => {
          const testId = createTestId();
          const fullId = `${testId}-${resourceId}`;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture current state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Register the same resource multiple times
              for (let i = 0; i < registrationCount; i++) {
                context.registerResource(fullId);
              }
              
              // Complete the resource once
              context.markResourceComplete(fullId);
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // After single completion, should not be loading (idempotent behavior)
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should maintain correct state with interleaved duplicate registrations', async () => {
      const resourceIdsArbitrary = fc.array(
        fc.string({ minLength: 5, maxLength: 10 }),
        { minLength: 2, maxLength: 5 }
      );

      await fc.assert(
        fc.asyncProperty(resourceIdsArbitrary, async (resourceIds) => {
          const testId = createTestId();
          const uniqueIds = [...new Set(resourceIds)]; // Get unique IDs
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture current state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              // Register all IDs (including duplicates)
              resourceIds.forEach(id => {
                context.registerResource(`${testId}-${id}`);
              });
              
              // Complete each unique ID once
              uniqueIds.forEach(id => {
                context.markResourceComplete(`${testId}-${id}`);
              });
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // After completing each unique ID once, should not be loading
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should handle rapid duplicate registrations and completions', async () => {
      const operationCountArbitrary = fc.integer({ min: 3, max: 15 });

      await fc.assert(
        fc.asyncProperty(operationCountArbitrary, async (count) => {
          const testId = createTestId();
          const resourceId = `${testId}-resource`;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            React.useEffect(() => {
              // Rapidly register the same resource multiple times
              for (let i = 0; i < count; i++) {
                context.registerResource(resourceId);
              }
              
              // Complete it once
              context.markResourceComplete(resourceId);
              
              finalIsLoading = context.isLoading;
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should not be loading after single completion (idempotent)
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property 7: Resource Completion Robustness
   * 
   * For any resource identifier, marking it as complete should be a safe
   * operation even if the resource was never registered or was already completed.
   * 
   * **Validates: Requirements 5.5**
   */
  describe('Property 7: Resource Completion Robustness', () => {
    it('should safely handle completion of non-existent resources', async () => {
      const resourceIdsArbitrary = fc.array(
        fc.string({ minLength: 5, maxLength: 15 }),
        { minLength: 1, maxLength: 10 }
      );

      await fc.assert(
        fc.asyncProperty(resourceIdsArbitrary, async (resourceIds) => {
          const testId = createTestId();
          let errorOccurred = false;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            React.useEffect(() => {
              try {
                // Complete resources that were never registered
                resourceIds.forEach(id => {
                  context.markResourceComplete(`${testId}-${id}`);
                });
                
                finalIsLoading = context.isLoading;
              } catch (error) {
                errorOccurred = true;
              }
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should not throw errors
          expect(errorOccurred).toBe(false);
          
          // Should remain in non-loading state
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should safely handle multiple completions of the same resource', async () => {
      const configArbitrary = fc.record({
        resourceId: fc.string({ minLength: 5, maxLength: 15 }),
        completionCount: fc.integer({ min: 2, max: 10 })
      });

      await fc.assert(
        fc.asyncProperty(configArbitrary, async ({ resourceId, completionCount }) => {
          const testId = createTestId();
          const fullId = `${testId}-${resourceId}`;
          let errorOccurred = false;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            React.useEffect(() => {
              try {
                // Register once
                context.registerResource(fullId);
                
                // Complete multiple times
                for (let i = 0; i < completionCount; i++) {
                  context.markResourceComplete(fullId);
                }
                
                finalIsLoading = context.isLoading;
              } catch (error) {
                errorOccurred = true;
              }
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should not throw errors
          expect(errorOccurred).toBe(false);
          
          // Should not be loading after completions
          expect(finalIsLoading).toBe(false);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should handle mixed valid and invalid completion operations', async () => {
      const operationSequenceArbitrary = fc.array(
        fc.record({
          type: fc.constantFrom('register', 'complete', 'complete-invalid'),
          resourceId: fc.string({ minLength: 3, maxLength: 10 })
        }),
        { minLength: 5, maxLength: 15 }
      );

      await fc.assert(
        fc.asyncProperty(operationSequenceArbitrary, async (operations) => {
          const testId = createTestId();
          const registeredResources = new Set();
          let errorOccurred = false;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            React.useEffect(() => {
              try {
                operations.forEach(op => {
                  const id = `${testId}-${op.resourceId}`;
                  
                  if (op.type === 'register') {
                    context.registerResource(id);
                    registeredResources.add(id);
                  } else if (op.type === 'complete') {
                    context.markResourceComplete(id);
                    registeredResources.delete(id);
                  } else if (op.type === 'complete-invalid') {
                    // Complete a resource that was never registered
                    context.markResourceComplete(`${testId}-invalid-${op.resourceId}`);
                  }
                });
                
                finalIsLoading = context.isLoading;
              } catch (error) {
                errorOccurred = true;
              }
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should not throw errors even with invalid completions
          expect(errorOccurred).toBe(false);
          
          // Loading state should reflect only registered resources
          const expectedIsLoading = registeredResources.size > 0;
          expect(finalIsLoading).toBe(expectedIsLoading);
          
          unmount();
        }),
        { numRuns: 15 }
      );
    });

    it('should maintain correct state when completing before registering', async () => {
      const resourceIdsArbitrary = fc.array(
        fc.string({ minLength: 5, maxLength: 10 }),
        { minLength: 2, maxLength: 5 }
      );

      await fc.assert(
        fc.asyncProperty(resourceIdsArbitrary, async (resourceIds) => {
          const testId = createTestId();
          let errorOccurred = false;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture current state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              try {
                // Complete resources before registering them
                resourceIds.forEach(id => {
                  context.markResourceComplete(`${testId}-${id}`);
                });
                
                // Now register them
                resourceIds.forEach(id => {
                  context.registerResource(`${testId}-${id}`);
                });
              } catch (error) {
                errorOccurred = true;
              }
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should not throw errors
          expect(errorOccurred).toBe(false);
          
          // After registering, should be loading (completions before registration don't affect)
          expect(finalIsLoading).toBe(true);
          
          unmount();
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Combined Property: Context Robustness
   * 
   * For any combination of valid and edge-case operations, the context
   * should maintain all invariants and never enter an inconsistent state.
   */
  describe('Combined Property: Context Robustness', () => {
    it('should maintain all invariants through complex operation sequences', async () => {
      const complexSequenceArbitrary = fc.array(
        fc.record({
          type: fc.constantFrom('register', 'complete', 'duplicate-register', 'invalid-complete'),
          resourceId: fc.string({ minLength: 3, maxLength: 8 }),
          repeat: fc.integer({ min: 1, max: 3 })
        }),
        { minLength: 10, maxLength: 30 }
      );

      await fc.assert(
        fc.asyncProperty(complexSequenceArbitrary, async (operations) => {
          const testId = createTestId();
          const pendingResources = new Set();
          let errorOccurred = false;
          let finalIsLoading = null;

          const TestComponent = () => {
            const context = React.useContext(LoadingTrackerContext);
            
            // Capture current state on each render
            finalIsLoading = context.isLoading;
            
            React.useEffect(() => {
              try {
                operations.forEach((op, index) => {
                  const id = `${testId}-${op.resourceId}`;
                  
                  for (let i = 0; i < op.repeat; i++) {
                    if (op.type === 'register' || op.type === 'duplicate-register') {
                      context.registerResource(id);
                      pendingResources.add(id);
                    } else if (op.type === 'complete') {
                      context.markResourceComplete(id);
                      pendingResources.delete(id);
                    } else if (op.type === 'invalid-complete') {
                      context.markResourceComplete(`${testId}-nonexistent-${index}`);
                    }
                  }
                });
              } catch (error) {
                errorOccurred = true;
              }
            }, [context]);
            
            return <div>Test</div>;
          };

          const { unmount } = render(
            <LoadingTrackerProvider>
              <TestComponent />
            </LoadingTrackerProvider>
          );

          // Wait for all operations
          await act(async () => {
            await vi.runAllTimersAsync();
          });

          // Should never throw errors
          expect(errorOccurred).toBe(false);
          
          // Verify final state matches expected
          const expectedIsLoading = pendingResources.size > 0;
          expect(finalIsLoading).toBe(expectedIsLoading);
          
          unmount();
        }),
        { numRuns: 10 }
      );
    });
  });
});
