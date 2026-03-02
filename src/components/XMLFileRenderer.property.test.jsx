import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import XMLFileRenderer from './XMLFileRenderer';
import { LoadingTrackerProvider, LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

/**
 * Property-Based Tests for XMLFileRenderer Resource Tracking
 * 
 * **Validates: Requirements 2.1, 2.2, 4.1**
 * 
 * Property 4: Component Registration
 * Property 5: Component Completion
 * Property 9: Resource Cleanup on Unmount
 */
describe('XMLFileRenderer - Resource Tracking Property Tests', () => {
  let fetchSpy;
  let registerResourceSpy;
  let markResourceCompleteSpy;

  beforeEach(() => {
    // Mock global fetch
    fetchSpy = vi.spyOn(global, 'fetch');
    
    // Create spies for tracking context methods
    registerResourceSpy = vi.fn();
    markResourceCompleteSpy = vi.fn();
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    vi.clearAllMocks();
  });

  /**
   * Property 4: Component Registration
   * 
   * For any tracked component (XMLFileRenderer) that mounts with trackLoading enabled,
   * the component should register a unique resource identifier with the LoadingTracker.
   * 
   * **Validates: Requirements 2.1, 8.4, 10.1, 10.2**
   */
  describe('Property 4: Component Registration', () => {
    it('should register resource with unique ID containing fileName', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content><paragraph>Test</paragraph></content>',
          });

          // Track registered IDs
          const registeredIds = [];
          const mockRegister = vi.fn((id) => {
            registeredIds.push(id);
          });

          const TestWrapper = ({ children }) => {
            const [pendingResources, setPendingResources] = React.useState(new Set());
            
            const registerResource = React.useCallback((id) => {
              mockRegister(id);
              setPendingResources(prev => {
                const next = new Set(prev);
                next.add(id);
                return next;
              });
            }, []);
            
            const markResourceComplete = React.useCallback((id) => {
              setPendingResources(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }, []);
            
            const contextValue = React.useMemo(() => ({
              registerResource,
              markResourceComplete,
              isLoading: pendingResources.size > 0
            }), [registerResource, markResourceComplete, pendingResources.size]);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify resource ID was registered
          expect(registeredIds.length).toBeGreaterThan(0);
          
          // Verify resource ID contains 'xml-' prefix and fileName
          const resourceId = registeredIds[0];
          expect(resourceId).toContain('xml-');
          expect(resourceId).toContain(fileName);

          unmount();
        }),
        { numRuns: 10 }
      );
    });

    it('should not register when trackLoading is false', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content><paragraph>Test</paragraph></content>',
          });

          const mockRegister = vi.fn();
          const mockComplete = vi.fn();

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: false
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} trackLoading={false} />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Should NOT have registered
          expect(mockRegister).not.toHaveBeenCalled();

          unmount();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 5: Component Completion
   * 
   * For any tracked component that successfully loads its content,
   * the component should mark its resource as complete with the LoadingTracker.
   * 
   * **Validates: Requirements 2.2, 2.4**
   */
  describe('Property 5: Component Completion', () => {
    it('should mark resource complete after successful load', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          const mockXMLContent = '<content><paragraph>Test content</paragraph></content>';
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => mockXMLContent,
          });

          const registeredIds = [];
          const completedIds = [];
          
          const mockRegister = vi.fn((id) => {
            registeredIds.push(id);
          });
          
          const mockComplete = vi.fn((id) => {
            completedIds.push(id);
          });

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Wait for completion
          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          // Verify the same ID that was registered is now completed
          expect(registeredIds.length).toBeGreaterThan(0);
          expect(completedIds.length).toBeGreaterThan(0);
          expect(completedIds).toContain(registeredIds[0]);

          unmount();
        }),
        { numRuns: 10 }
      );
    });

    it('should mark resource complete even on fetch error', async () => {
      const errorScenarioArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 15 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          .filter(s => s.length >= 3),
        fc.constantFrom(400, 404, 500, 503)
      );

      await fc.assert(
        fc.asyncProperty(errorScenarioArbitrary, async ([fileName, statusCode]) => {
          fetchSpy.mockClear();
          
          // Mock error response
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
            statusText: 'Error',
          });

          const mockComplete = vi.fn();
          const mockRegister = vi.fn();

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          // Wait for error handling
          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          // Verify resource was marked complete despite error
          expect(mockComplete).toHaveBeenCalled();

          unmount();
        }),
        { numRuns: 10 }
      );
    });

    it('should mark resource complete on network failure', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          // Mock network error
          fetchSpy.mockRejectedValueOnce(new Error('Network failure'));

          const mockComplete = vi.fn();
          const mockRegister = vi.fn();

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          // Wait for error handling
          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          // Verify resource was marked complete despite network error
          expect(mockComplete).toHaveBeenCalled();

          unmount();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Property 9: Resource Cleanup on Unmount
   * 
   * For any tracked component that unmounts, the component should mark its
   * resource as complete with the LoadingTracker to prevent memory leaks
   * and stuck loading states.
   * 
   * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.3**
   */
  describe('Property 9: Resource Cleanup on Unmount', () => {
    it('should mark resource complete on unmount before load finishes', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          // Mock slow fetch that won't resolve quickly
          fetchSpy.mockImplementationOnce(() => 
            new Promise(resolve => setTimeout(() => resolve({
              ok: true,
              text: async () => '<content><paragraph>Test</paragraph></content>'
            }), 5000))
          );

          const mockComplete = vi.fn();
          const mockRegister = vi.fn();

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Clear the mock to track only unmount calls
          mockComplete.mockClear();

          // Unmount before fetch completes
          unmount();

          // Verify cleanup was called
          expect(mockComplete).toHaveBeenCalled();
        }),
        { numRuns: 5 }
      );
    });

    it('should call markResourceComplete exactly once on unmount', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockImplementationOnce(() => 
            new Promise(resolve => setTimeout(() => resolve({
              ok: true,
              text: async () => '<content></content>'
            }), 5000))
          );

          const mockComplete = vi.fn();
          const mockRegister = vi.fn();

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Clear to count only unmount calls
          mockComplete.mockClear();

          // Unmount
          unmount();

          // Should be called exactly once during cleanup
          expect(mockComplete).toHaveBeenCalledTimes(1);
        }),
        { numRuns: 5 }
      );
    });

    it('should not crash when unmounting without context', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content><paragraph>Test</paragraph></content>',
          });

          // Render without context provider
          const { unmount } = render(
            <XMLFileRenderer fileName={fileName} />
          );

          await new Promise(resolve => setTimeout(resolve, 100));

          // Should not crash on unmount
          expect(() => unmount()).not.toThrow();
        }),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Combined Property: Registration and Completion Lifecycle
   * 
   * For any XMLFileRenderer component lifecycle, the resource should be:
   * 1. Registered exactly once on mount
   * 2. Completed exactly once (either on success, error, or unmount)
   * 3. The same ID used for both registration and completion
   */
  describe('Combined Property: Full Resource Lifecycle', () => {
    it('should maintain consistent resource ID throughout lifecycle', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content><paragraph>Test</paragraph></content>',
          });

          const registeredIds = [];
          const completedIds = [];
          
          const mockRegister = vi.fn((id) => {
            registeredIds.push(id);
          });
          
          const mockComplete = vi.fn((id) => {
            completedIds.push(id);
          });

          const TestWrapper = ({ children }) => {
            const contextValue = React.useMemo(() => ({
              registerResource: mockRegister,
              markResourceComplete: mockComplete,
              isLoading: true
            }), []);
            
            return (
              <LoadingTrackerContext.Provider value={contextValue}>
                {children}
              </LoadingTrackerContext.Provider>
            );
          };

          const { unmount } = render(
            <TestWrapper>
              <XMLFileRenderer fileName={fileName} />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 2000 });

          unmount();

          // Verify same ID was used for registration and completion
          expect(registeredIds.length).toBe(1);
          expect(completedIds.length).toBeGreaterThanOrEqual(1);
          expect(completedIds).toContain(registeredIds[0]);
        }),
        { numRuns: 10 }
      );
    });
  });
});
