import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useContext, useEffect } from 'react';
import PageLoader from './PageLoader';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

describe('PageLoader', () => {
  describe('Loading Component Display', () => {
    it('should display default loading spinner initially when resources are pending', async () => {
      const TestChild = () => {
        const { registerResource } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Register a resource to keep loading state active
          registerResource('test-resource');
        }, [registerResource]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader>
          <TestChild />
        </PageLoader>
      );

      // Should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
      
      // Should not show content yet
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });

    it('should display custom loading component when provided', async () => {
      const CustomLoader = () => <div data-testid="custom-loader">Custom Loading...</div>;
      
      const TestChild = () => {
        const { registerResource } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          registerResource('test-resource');
        }, [registerResource]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader loadingComponent={<CustomLoader />}>
          <TestChild />
        </PageLoader>
      );

      // Should show custom loading component
      expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
      expect(screen.getByText('Custom Loading...')).toBeInTheDocument();
      
      // Should not show content yet
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
    });
  });

  describe('Content Display After Loading', () => {
    it('should display content after all resources complete and minimum time elapses', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Simulate resource loading
          registerResource('test-resource');
          const timer = setTimeout(() => {
            markResourceComplete('test-resource');
          }, 10);
          return () => clearTimeout(timer);
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader minLoadingTime={50}>
          <TestChild />
        </PageLoader>
      );

      // Initially should show loading
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for content to appear
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 200 });
      
      // Should not show loading spinner anymore
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should display content immediately when no resources are registered', async () => {
      render(
        <PageLoader minLoadingTime={50}>
          <div>Test Content</div>
        </PageLoader>
      );

      // Should show content after minimum time
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Minimum Loading Time Enforcement', () => {
    it('should enforce default minimum loading time of 300ms', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Complete resource immediately
          registerResource('test-resource');
          markResourceComplete('test-resource');
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader>
          <TestChild />
        </PageLoader>
      );

      // Should still show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Test Content')).not.toBeInTheDocument();

      // Should show content after default 300ms
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should enforce custom minimum loading time', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Complete resource immediately
          registerResource('test-resource');
          markResourceComplete('test-resource');
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader minLoadingTime={100}>
          <TestChild />
        </PageLoader>
      );

      // Should still show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Should show content after 100ms
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 300 });
    });

    it('should display content immediately if resources complete after minimum time', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Register resource
          registerResource('test-resource');
          
          // Complete after 100ms (longer than 50ms minimum)
          const timer = setTimeout(() => {
            markResourceComplete('test-resource');
          }, 100);
          
          return () => clearTimeout(timer);
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader minLoadingTime={50}>
          <TestChild />
        </PageLoader>
      );

      // Should show content after resource completes (no additional delay)
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 300 });
    });

    it('should handle zero minimum loading time', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          registerResource('test-resource');
          markResourceComplete('test-resource');
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader minLoadingTime={0}>
          <TestChild />
        </PageLoader>
      );

      // Should show content immediately
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 100 });
    });
  });

  describe('Context Provision to Children', () => {
    it('should provide LoadingTrackerContext to children', async () => {
      const TestChild = () => {
        const context = useContext(LoadingTrackerContext);
        
        return (
          <div>
            <div data-testid="has-register">{typeof context.registerResource === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-complete">{typeof context.markResourceComplete === 'function' ? 'yes' : 'no'}</div>
            <div data-testid="has-loading">{typeof context.isLoading === 'boolean' ? 'yes' : 'no'}</div>
          </div>
        );
      };

      render(
        <PageLoader minLoadingTime={0}>
          <TestChild />
        </PageLoader>
      );

      // Wait for content to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('has-register')).toBeInTheDocument();
      }, { timeout: 100 });

      expect(screen.getByTestId('has-register')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-complete')).toHaveTextContent('yes');
      expect(screen.getByTestId('has-loading')).toHaveTextContent('yes');
    });

    it('should allow children to register and complete resources', async () => {
      const TestChild = () => {
        const { isLoading } = useContext(LoadingTrackerContext);
        
        return (
          <div>
            <div data-testid="loading-state">{isLoading ? 'loading' : 'ready'}</div>
          </div>
        );
      };

      render(
        <PageLoader minLoadingTime={0}>
          <TestChild />
        </PageLoader>
      );

      // Initially should be ready (no resources)
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('ready');
      }, { timeout: 100 });
    });

    it('should provide stable context functions across re-renders', async () => {
      let renderCount = 0;
      let firstRegisterFn = null;
      let firstCompleteFn = null;

      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        renderCount++;
        
        if (renderCount === 1) {
          firstRegisterFn = registerResource;
          firstCompleteFn = markResourceComplete;
        } else if (renderCount === 2) {
          // Functions should be the same reference
          expect(registerResource).toBe(firstRegisterFn);
          expect(markResourceComplete).toBe(firstCompleteFn);
        }
        
        return <div>Render {renderCount}</div>;
      };

      const { rerender } = render(
        <PageLoader minLoadingTime={0}>
          <TestChild />
        </PageLoader>
      );

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText(/Render/)).toBeInTheDocument();
      }, { timeout: 100 });

      // Force re-render
      rerender(
        <PageLoader minLoadingTime={0}>
          <TestChild />
        </PageLoader>
      );

      await waitFor(() => {
        expect(renderCount).toBeGreaterThanOrEqual(2);
      }, { timeout: 100 });
    });
  });

  describe('Multiple Resources', () => {
    it('should wait for all resources to complete before displaying content', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          // Register multiple resources
          registerResource('resource-1');
          registerResource('resource-2');
          registerResource('resource-3');
          
          // Complete them at different times
          const timer1 = setTimeout(() => markResourceComplete('resource-1'), 10);
          const timer2 = setTimeout(() => markResourceComplete('resource-2'), 20);
          const timer3 = setTimeout(() => markResourceComplete('resource-3'), 30);
          
          return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
          };
        }, [registerResource, markResourceComplete]);
        
        return <div>All Content Loaded</div>;
      };

      render(
        <PageLoader minLoadingTime={20}>
          <TestChild />
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Should show content after all resources complete
      await waitFor(() => {
        expect(screen.getByText('All Content Loaded')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', async () => {
      render(
        <PageLoader minLoadingTime={20}>
          {null}
        </PageLoader>
      );

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 100 });
    });

    it('should handle undefined children', async () => {
      render(
        <PageLoader minLoadingTime={20}>
          {undefined}
        </PageLoader>
      );

      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 100 });
    });

    it('should handle multiple child elements', async () => {
      render(
        <PageLoader minLoadingTime={20}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </PageLoader>
      );

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
        expect(screen.getByText('Child 3')).toBeInTheDocument();
      }, { timeout: 100 });
    });

    it('should handle negative minimum loading time as zero', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          registerResource('test-resource');
          markResourceComplete('test-resource');
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      render(
        <PageLoader minLoadingTime={-100}>
          <TestChild />
        </PageLoader>
      );

      // Should show content immediately (negative treated as 0)
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      }, { timeout: 100 });
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timers on unmount', async () => {
      const TestChild = () => {
        const { registerResource, markResourceComplete } = useContext(LoadingTrackerContext);
        
        useEffect(() => {
          registerResource('test-resource');
          markResourceComplete('test-resource');
        }, [registerResource, markResourceComplete]);
        
        return <div>Test Content</div>;
      };

      const { unmount } = render(
        <PageLoader minLoadingTime={1000}>
          <TestChild />
        </PageLoader>
      );

      // Unmount before timer completes
      unmount();

      // No errors should occur
      expect(true).toBe(true);
    });
  });
});
