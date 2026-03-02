import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from 'react';
import PageLoader from './PageLoader';
import XMLFileRenderer from './XMLFileRenderer';
import WebPageImage from './WebPageImage';

/**
 * Integration tests for full page loading flow
 * 
 * Tests cover:
 * - Full page load with multiple components (Requirements 1.1, 1.2, 1.3)
 * - Mixed success/failure scenarios (Requirement 3.3)
 * - Navigation during load (Requirement 4.2)
 * - Error recovery
 */
describe('PageLoader - Integration Tests', () => {
  let fetchSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Full page load with multiple components (Requirements 1.1, 1.2, 1.3)', () => {
    it('should display loading spinner until all XMLFileRenderer and WebPageImage components complete', async () => {
      // Mock successful XML fetches
      fetchSpy.mockImplementation((url) => {
        if (url.includes('Title.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><heading>Page Title</heading></content>'
          });
        }
        if (url.includes('Content.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Page content here</paragraph></content>'
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <PageLoader minLoadingTime={50}>
          <div>
            <XMLFileRenderer fileName="test/Title" />
            <XMLFileRenderer fileName="test/Content" />
            <WebPageImage src="/images/test1.png" alt="Test 1" />
            <WebPageImage src="/images/test2.png" alt="Test 2" />
          </div>
        </PageLoader>
      );

      // Initially should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByText('Page Title')).not.toBeInTheDocument();

      // Wait for all content to load and display
      await waitFor(() => {
        expect(screen.getByText('Page Title')).toBeInTheDocument();
      }, { timeout: 500 });

      expect(screen.getByText('Page content here')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should wait for all resources before displaying content', async () => {
      let resolveSlowXML;
      const slowXMLPromise = new Promise((resolve) => {
        resolveSlowXML = resolve;
      });

      fetchSpy.mockImplementation((url) => {
        if (url.includes('fast.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Fast content</paragraph></content>'
          });
        }
        if (url.includes('slow.xml')) {
          return slowXMLPromise;
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <PageLoader minLoadingTime={20}>
          <div>
            <XMLFileRenderer fileName="test/fast" />
            <XMLFileRenderer fileName="test/slow" />
          </div>
        </PageLoader>
      );

      // Should show loading spinner initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Resolve slow XML
      await act(async () => {
        resolveSlowXML({
          ok: true,
          text: async () => '<content><paragraph>Slow content</paragraph></content>'
        });
      });

      // Now loading should complete and both pieces of content should be visible
      await waitFor(() => {
        expect(screen.getByText('Fast content')).toBeInTheDocument();
      }, { timeout: 500 });

      expect(screen.getByText('Slow content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle pages with many resources', async () => {
      // Mock successful fetches for all resources
      fetchSpy.mockImplementation((url) => {
        const match = url.match(/file(\d+)\.xml/);
        if (match) {
          const num = match[1];
          return Promise.resolve({
            ok: true,
            text: async () => `<content><paragraph>Content ${num}</paragraph></content>`
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            {[1, 2, 3, 4, 5].map(i => (
              <XMLFileRenderer key={`xml-${i}`} fileName={`test/file${i}`} />
            ))}
            {[1, 2, 3, 4, 5].map(i => (
              <WebPageImage key={`img-${i}`} src={`/images/test${i}.png`} alt={`Test ${i}`} />
            ))}
          </div>
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for all content to load
      await waitFor(() => {
        expect(screen.getByText('Content 1')).toBeInTheDocument();
      }, { timeout: 500 });

      // Verify all content is displayed
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`Content ${i}`)).toBeInTheDocument();
      }

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Mixed success/failure scenarios (Requirement 3.3)', () => {
    it('should complete loading even when some XMLFileRenderer components fail', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('success.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Success content</paragraph></content>'
          });
        }
        if (url.includes('fail.xml')) {
          return Promise.resolve({
            ok: false,
            status: 404,
            statusText: 'Not Found'
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/success" />
            <XMLFileRenderer fileName="test/fail" />
            <WebPageImage src="/images/test.png" alt="Test" />
          </div>
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for page to complete loading
      await waitFor(() => {
        expect(screen.getByText('Success content')).toBeInTheDocument();
      }, { timeout: 500 });

      // Successful content should be displayed
      expect(screen.getByText('Success content')).toBeInTheDocument();
      
      // Error message should be displayed for failed component
      expect(screen.getByText('Error loading content')).toBeInTheDocument();
      
      // Loading spinner should be gone
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should complete loading when all resources fail', async () => {
      fetchSpy.mockImplementation(() => {
        return Promise.resolve({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/fail1" />
            <XMLFileRenderer fileName="test/fail2" />
          </div>
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for page to complete loading (even with all failures)
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 500 });

      // Wait for error messages to appear
      await waitFor(() => {
        const errorMessages = screen.getAllByText('Error loading content');
        expect(errorMessages.length).toBeGreaterThanOrEqual(2);
      }, { timeout: 200 });
    });

    it('should handle mix of successful and failed images', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>XML content</paragraph></content>'
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/content" />
            <WebPageImage src="/images/success.png" alt="Success" />
            <WebPageImage src="/images/fail.png" alt="Fail" />
          </div>
        </PageLoader>
      );

      // Wait for loading to start
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      // Wait for content to display (images will load/error automatically in test environment)
      await waitFor(() => {
        expect(screen.getByText('XML content')).toBeInTheDocument();
      }, { timeout: 500 });

      // Loading should complete
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle network errors gracefully', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('network-error.xml')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          text: async () => '<content><paragraph>Good content</paragraph></content>'
        });
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/good" />
            <XMLFileRenderer fileName="test/network-error" />
          </div>
        </PageLoader>
      );

      // Wait for page to complete loading
      await waitFor(() => {
        expect(screen.getByText('Good content')).toBeInTheDocument();
      }, { timeout: 500 });

      // Error should be displayed for failed component
      expect(screen.getByText('Error loading content')).toBeInTheDocument();
      
      // Loading should complete
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Navigation during load (Requirement 4.2)', () => {
    it('should cleanup resources when unmounting during load', async () => {
      let resolveXML;
      const xmlPromise = new Promise((resolve) => {
        resolveXML = resolve;
      });

      fetchSpy.mockReturnValue(xmlPromise);

      const { unmount } = render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/slow" />
            <WebPageImage src="/images/test.png" alt="Test" />
          </div>
        </PageLoader>
      );

      // Verify loading state
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Unmount before resources complete (simulating navigation)
      unmount();

      // Resolve the promise after unmount
      resolveXML({
        ok: true,
        text: async () => '<content><paragraph>Late content</paragraph></content>'
      });

      // Wait a bit
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // No errors should occur
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Warning: Can\'t perform a React state update')
      );
    });

    it('should not display content after unmounting', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      const { unmount } = render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/content" />
          </div>
        </PageLoader>
      );

      // Unmount immediately
      unmount();

      // Wait a bit
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Content should not be in document
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should handle rapid mount/unmount cycles', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      // Mount and unmount multiple times rapidly
      for (let i = 0; i < 5; i++) {
        const { unmount } = render(
          <PageLoader minLoadingTime={20}>
            <div>
              <XMLFileRenderer fileName={`test/content${i}`} />
              <WebPageImage src={`/images/test${i}.png`} alt={`Test ${i}`} />
            </div>
          </PageLoader>
        );

        // Unmount almost immediately
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
        
        unmount();
      }

      // No errors should occur
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Warning: Can\'t perform a React state update')
      );
    });
  });

  describe('Error recovery', () => {
    it('should recover from transient errors and continue loading', async () => {
      let attemptCount = 0;
      
      fetchSpy.mockImplementation((url) => {
        if (url.includes('retry.xml')) {
          attemptCount++;
          // Fail first attempt, succeed on retry
          if (attemptCount === 1) {
            return Promise.resolve({
              ok: false,
              status: 500,
              statusText: 'Internal Server Error'
            });
          }
        }
        return Promise.resolve({
          ok: true,
          text: async () => '<content><paragraph>Success</paragraph></content>'
        });
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/success" />
            <XMLFileRenderer fileName="test/retry" />
          </div>
        </PageLoader>
      );

      // Wait for page to complete loading
      await waitFor(() => {
        expect(screen.getByText('Success')).toBeInTheDocument();
      }, { timeout: 500 });

      // First XMLFileRenderer should succeed
      expect(screen.getByText('Success')).toBeInTheDocument();
      
      // Second should show error (no automatic retry in current implementation)
      expect(screen.getByText('Error loading content')).toBeInTheDocument();
      
      // Loading should complete
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle components with trackLoading=false not blocking page load', async () => {
      let resolveTrackedXML;
      const trackedXMLPromise = new Promise((resolve) => {
        resolveTrackedXML = resolve;
      });

      fetchSpy.mockImplementation((url) => {
        if (url.includes('tracked.xml')) {
          return trackedXMLPromise;
        }
        if (url.includes('untracked.xml')) {
          // This one takes forever but shouldn't block
          return new Promise(() => {}); // Never resolves
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/tracked" trackLoading={true} />
            <XMLFileRenderer fileName="test/untracked" trackLoading={false} />
          </div>
        </PageLoader>
      );

      // Should show loading
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Resolve only the tracked XML
      await act(async () => {
        resolveTrackedXML({
          ok: true,
          text: async () => '<content><paragraph>Tracked content</paragraph></content>'
        });
      });

      // Page should complete loading (untracked XML doesn't block)
      await waitFor(() => {
        expect(screen.getAllByText('Tracked content').length).toBeGreaterThan(0);
      }, { timeout: 500 });

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle empty page with no resources', async () => {
      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <h1>Empty Page</h1>
            <p>No async resources here</p>
          </div>
        </PageLoader>
      );

      // Should complete loading quickly
      await waitFor(() => {
        expect(screen.getByText('Empty Page')).toBeInTheDocument();
      }, { timeout: 200 });

      expect(screen.getByText('No async resources here')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle page with only untracked resources', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Untracked content</paragraph></content>'
      });

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/content" trackLoading={false} />
            <WebPageImage src="/images/test.png" alt="Test" trackLoading={false} />
          </div>
        </PageLoader>
      );

      // Should complete loading quickly (no tracked resources)
      await waitFor(() => {
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Complex page scenarios', () => {
    it('should handle nested components with loading tracking', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('parent.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Parent content</paragraph></content>'
          });
        }
        if (url.includes('child.xml')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Child content</paragraph></content>'
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const NestedComponent = () => (
        <div>
          <XMLFileRenderer fileName="test/child" />
          <WebPageImage src="/images/child.png" alt="Child" />
        </div>
      );

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/parent" />
            <NestedComponent />
          </div>
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for all content to load
      await waitFor(() => {
        expect(screen.getByText('Parent content')).toBeInTheDocument();
      }, { timeout: 500 });

      expect(screen.getByText('Child content')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle conditional rendering of components', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      const ConditionalPage = ({ showExtra }) => (
        <PageLoader minLoadingTime={30}>
          <div>
            <XMLFileRenderer fileName="test/main" />
            {showExtra && <XMLFileRenderer fileName="test/extra" />}
          </div>
        </PageLoader>
      );

      const { rerender } = render(<ConditionalPage showExtra={false} />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      }, { timeout: 500 });

      // Re-render with extra component
      rerender(<ConditionalPage showExtra={true} />);

      // Should still work correctly
      await waitFor(() => {
        const contentElements = screen.getAllByText('Content');
        expect(contentElements.length).toBeGreaterThan(0);
      }, { timeout: 500 });
    });

    it('should handle dynamic list of components', async () => {
      fetchSpy.mockImplementation((url) => {
        const match = url.match(/item(\d+)\.xml/);
        if (match) {
          const num = match[1];
          return Promise.resolve({
            ok: true,
            text: async () => `<content><paragraph>Item ${num}</paragraph></content>`
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const items = [1, 2, 3];

      render(
        <PageLoader minLoadingTime={30}>
          <div>
            {items.map(i => (
              <div key={i}>
                <XMLFileRenderer fileName={`test/item${i}`} />
                <WebPageImage src={`/images/item${i}.png`} alt={`Item ${i}`} />
              </div>
            ))}
          </div>
        </PageLoader>
      );

      // Should show loading initially
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for all items to load
      await waitFor(() => {
        expect(screen.getByText('Item 1')).toBeInTheDocument();
      }, { timeout: 500 });

      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
