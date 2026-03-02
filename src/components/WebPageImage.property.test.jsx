import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import React from 'react';
import WebPageImage from './WebPageImage';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

/**
 * Property-Based Tests for WebPageImage Resource Tracking
 * 
 * **Validates: Requirements 2.3, 2.4, 4.1**
 * 
 * Property 4: Component Registration
 * Property 5: Component Completion
 * Property 9: Resource Cleanup on Unmount
 */
describe('WebPageImage - Resource Tracking Property Tests', () => {
  let registerResourceSpy;
  let markResourceCompleteSpy;

  beforeEach(() => {
    // Create spies for tracking context methods
    registerResourceSpy = vi.fn();
    markResourceCompleteSpy = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  /**
   * Property 4: Component Registration
   * 
   * For any tracked component (WebPageImage) that mounts with trackLoading enabled,
   * the component should register a unique resource identifier with the LoadingTracker.
   * 
   * **Validates: Requirements 2.3, 8.4, 10.1, 10.2**
   */
  describe('Property 4: Component Registration', () => {
    it('should register resource with unique ID containing src', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify resource ID was registered
          expect(registeredIds.length).toBeGreaterThan(0);
          
          // Verify resource ID contains 'img-' prefix and src
          const resourceId = registeredIds[0];
          expect(resourceId).toContain('img-');
          expect(resourceId).toContain(src);

          unmount();
        }),
        { numRuns: 10 }
      );
    });

    it('should not register when trackLoading is false', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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
              <WebPageImage src={src} alt="Test image" trackLoading={false} />
            </TestWrapper>
          );

          await new Promise(resolve => setTimeout(resolve, 100));

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
   * **Validates: Requirements 2.3, 2.4**
   */
  describe('Property 5: Component Completion', () => {
    it('should mark resource complete after successful image load', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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

          const { container, unmount } = render(
            <TestWrapper>
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Simulate image load event
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('load'));
          }

          // Wait for completion
          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify the same ID that was registered is now completed
          expect(registeredIds.length).toBeGreaterThan(0);
          expect(completedIds.length).toBeGreaterThan(0);
          expect(completedIds).toContain(registeredIds[0]);

          unmount();
        }),
        { numRuns: 10 }
      );
    });

    it('should mark resource complete even on image error', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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

          const { container, unmount } = render(
            <TestWrapper>
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Simulate image error event
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('error'));
          }

          // Wait for completion
          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify resource was marked complete despite error
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
    it('should mark resource complete on unmount before image loads', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Clear the mock to track only unmount calls
          mockComplete.mockClear();

          // Unmount before image loads
          unmount();

          // Verify cleanup was called
          expect(mockComplete).toHaveBeenCalled();
        }),
        { numRuns: 10 }
      );
    });

    it('should call markResourceComplete exactly once on unmount', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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
              <WebPageImage src={src} alt="Test image" />
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
        { numRuns: 10 }
      );
    });

    it('should not crash when unmounting without context', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
          // Render without context provider
          const { unmount } = render(
            <WebPageImage src={src} alt="Test image" />
          );

          await new Promise(resolve => setTimeout(resolve, 100));

          // Should not crash on unmount
          expect(() => unmount()).not.toThrow();
        }),
        { numRuns: 10 }
      );
    });

    it('should not call markResourceComplete on unmount if image already loaded', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
          const completedIds = [];
          const mockComplete = vi.fn((id) => {
            completedIds.push(id);
          });
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

          const { container, unmount } = render(
            <TestWrapper>
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          // Wait for registration
          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 500 });

          // Simulate image load
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('load'));
          }

          await waitFor(() => {
            expect(completedIds.length).toBeGreaterThan(0);
          }, { timeout: 500 });

          // Get the call count after load
          const callCountAfterLoad = completedIds.length;

          // Unmount after image loaded
          unmount();

          // Should NOT be called again since image already loaded
          expect(completedIds.length).toBe(callCountAfterLoad);
        }),
        { numRuns: 5, timeout: 2000 }
      );
    });
  });

  /**
   * Combined Property: Registration and Completion Lifecycle
   * 
   * For any WebPageImage component lifecycle, the resource should be:
   * 1. Registered exactly once on mount
   * 2. Completed exactly once (either on load, error, or unmount)
   * 3. The same ID used for both registration and completion
   */
  describe('Combined Property: Full Resource Lifecycle', () => {
    it('should maintain consistent resource ID throughout lifecycle', async () => {
      const imagePathArbitrary = fc.string({ minLength: 5, maxLength: 20 })
        .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
        .filter(s => s.length >= 10);

      await fc.assert(
        fc.asyncProperty(imagePathArbitrary, async (src) => {
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

          const { container, unmount } = render(
            <TestWrapper>
              <WebPageImage src={src} alt="Test image" />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 500 });

          // Simulate image load
          const img = container.querySelector('img');
          if (img) {
            img.dispatchEvent(new Event('load'));
          }

          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 500 });

          unmount();

          // Verify exactly one ID was registered
          expect(registeredIds.length).toBe(1);
          // Verify at least one completion call was made
          expect(completedIds.length).toBeGreaterThanOrEqual(1);
          // All completion calls should use the same ID that was registered
          completedIds.forEach(id => {
            expect(id).toBe(registeredIds[0]);
          });
        }),
        { numRuns: 5, timeout: 2000 }
      );
    });

    it('should handle various image sizes and padding configurations', async () => {
      const configArbitrary = fc.record({
        src: fc.string({ minLength: 5, maxLength: 20 })
          .map(s => `/images/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}.png`)
          .filter(s => s.length >= 10),
        size: fc.integer({ min: 100, max: 1000 }),
        padding: fc.integer({ min: 0, max: 50 })
      });

      await fc.assert(
        fc.asyncProperty(configArbitrary, async ({ src, size, padding }) => {
          const mockRegister = vi.fn();
          const mockComplete = vi.fn();

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

          const { container, unmount } = render(
            <TestWrapper>
              <WebPageImage src={src} alt="Test image" size={size} padding={padding} />
            </TestWrapper>
          );

          await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify image has correct styling
          const img = container.querySelector('img');
          expect(img).toBeTruthy();
          expect(img.style.maxWidth).toBe(`${size}px`);
          expect(img.style.padding).toBe(`${padding}px`);

          // Simulate load
          if (img) {
            img.dispatchEvent(new Event('load'));
          }

          await waitFor(() => {
            expect(mockComplete).toHaveBeenCalled();
          }, { timeout: 1000 });

          unmount();
        }),
        { numRuns: 10 }
      );
    });
  });
});

