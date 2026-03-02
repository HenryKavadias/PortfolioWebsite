import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import XMLFileRenderer from './XMLFileRenderer';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

/**
 * Unit tests for XMLFileRenderer component with loading tracking integration
 * 
 * Tests cover:
 * - Resource registration on mount (Requirement 2.1)
 * - Completion after successful load (Requirement 2.2)
 * - Completion on error (Requirement 3.1)
 * - Completion on unmount (Requirement 4.1, 4.3)
 * - trackLoading prop behavior (Requirement 8.1, 8.3)
 * - Graceful degradation without context (Requirement 9.1)
 */
describe('XMLFileRenderer - Unit Tests', () => {
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

  describe('Resource registration on mount (Requirement 2.1)', () => {
    it('should register resource with LoadingTracker on mount when trackLoading is true', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was called
      expect(registerResource).toHaveBeenCalledTimes(1);
      
      // Verify resource ID format includes 'xml-' prefix and fileName
      const resourceId = registerResource.mock.calls[0][0];
      expect(resourceId).toMatch(/^xml-test\/file-/);
    });

    it('should register resource with default trackLoading (true)', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Should register by default
      expect(registerResource).toHaveBeenCalledTimes(1);
    });

    it('should generate stable resource ID across re-renders', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      const { rerender } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" className="class1" />
        </LoadingTrackerContext.Provider>
      );

      const firstResourceId = registerResource.mock.calls[0][0];

      // Re-render with different className (but same fileName)
      rerender(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" className="class2" />
        </LoadingTrackerContext.Provider>
      );

      // Resource ID should remain stable (only registered once)
      expect(registerResource).toHaveBeenCalledTimes(1);
      expect(registerResource.mock.calls[0][0]).toBe(firstResourceId);
    });
  });

  describe('Completion after successful load (Requirement 2.2)', () => {
    it('should mark resource complete after successful XML load', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test content</paragraph></content>'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(container.textContent).toBe('Test content');
      });

      // Verify markResourceComplete was called
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify it was called with the same resource ID that was registered
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);
    });

    it('should display content after successful load', async () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Loaded content</paragraph></content>'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" className="test-class" />
        </LoadingTrackerContext.Provider>
      );

      // Initially shows loading
      expect(container.textContent).toBe('Loading...');

      // Wait for content
      await waitFor(() => {
        expect(container.textContent).toBe('Loaded content');
      });

      // Verify className is applied
      expect(container.querySelector('.test-class')).toBeTruthy();
    });
  });

  describe('Completion on error (Requirement 3.1)', () => {
    it('should mark resource complete when fetch fails', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/missing" />
        </LoadingTrackerContext.Provider>
      );

      // Wait for error state
      await waitFor(() => {
        expect(container.textContent).toBe('Error loading content');
      });

      // Verify markResourceComplete was called even on error
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify same resource ID
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);
    });

    it('should mark resource complete when network error occurs', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockRejectedValueOnce(new Error('Network error'));

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Wait for error state
      await waitFor(() => {
        expect(container.textContent).toBe('Error loading content');
      });

      // Verify markResourceComplete was called
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
    });

    it('should display error message when load fails', async () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      await waitFor(() => {
        expect(container.textContent).toBe('Error loading content');
      });

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Completion on unmount (Requirements 4.1, 4.3)', () => {
    it('should mark resource complete when component unmounts before load completes', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      // Create a promise that never resolves to simulate slow load
      let resolveFetch;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      
      fetchSpy.mockReturnValueOnce(fetchPromise);

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Verify registration happened
      expect(registerResource).toHaveBeenCalledTimes(1);
      
      // Unmount before fetch completes
      unmount();

      // Verify cleanup called markResourceComplete
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify same resource ID
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);

      // Clean up the promise
      resolveFetch({ ok: true, text: async () => '<content></content>' });
    });

    it('should not update state after unmount', async () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      let resolveFetch;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      
      fetchSpy.mockReturnValueOnce(fetchPromise);

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Unmount before fetch completes
      unmount();

      // Resolve fetch after unmount
      resolveFetch({
        ok: true,
        text: async () => '<content><paragraph>Late content</paragraph></content>'
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // No errors should occur (component handles unmounted state)
      expect(consoleErrorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Warning: Can\'t perform a React state update')
      );
    });

    it('should call markResourceComplete only once on unmount even if already completed', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      const { container, unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      // Wait for load to complete
      await waitFor(() => {
        expect(container.textContent).toBe('Test');
      });

      // markResourceComplete called once after load
      expect(markResourceComplete).toHaveBeenCalledTimes(1);

      // Unmount
      unmount();

      // markResourceComplete called again on cleanup
      expect(markResourceComplete).toHaveBeenCalledTimes(2);
      
      // Both calls with same resource ID
      expect(markResourceComplete.mock.calls[0][0]).toBe(markResourceComplete.mock.calls[1][0]);
    });
  });

  describe('trackLoading prop behavior (Requirements 8.1, 8.3)', () => {
    it('should not register resource when trackLoading is false', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify registerResource was NOT called
      expect(registerResource).not.toHaveBeenCalled();
    });

    it('should not mark complete when trackLoading is false', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(container.textContent).toBe('Test');
      });

      // Verify markResourceComplete was NOT called
      expect(markResourceComplete).not.toHaveBeenCalled();
    });

    it('should still render content normally when trackLoading is false', async () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Content without tracking</paragraph></content>'
      });

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Content should still load and display
      await waitFor(() => {
        expect(container.textContent).toBe('Content without tracking');
      });
    });

    it('should not call markResourceComplete on unmount when trackLoading is false', async () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Test</paragraph></content>'
      });

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      // Unmount
      unmount();

      // Verify markResourceComplete was never called
      expect(markResourceComplete).not.toHaveBeenCalled();
    });
  });

  describe('Graceful degradation without context (Requirement 9.1)', () => {
    it('should render normally when LoadingTrackerContext is not provided', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Standalone content</paragraph></content>'
      });

      const { container } = render(
        <XMLFileRenderer fileName="test/file" />
      );

      // Should load and display content without crashing
      await waitFor(() => {
        expect(container.textContent).toBe('Standalone content');
      });
    });

    it('should handle errors normally without context', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const { container } = render(
        <XMLFileRenderer fileName="test/missing" />
      );

      // Should display error without crashing
      await waitFor(() => {
        expect(container.textContent).toBe('Error loading content');
      });
    });

    it('should not crash on unmount without context', async () => {
      let resolveFetch;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });
      
      fetchSpy.mockReturnValueOnce(fetchPromise);

      const { unmount } = render(
        <XMLFileRenderer fileName="test/file" />
      );

      // Unmount before fetch completes
      unmount();

      // Should not crash
      expect(() => {
        resolveFetch({ ok: true, text: async () => '<content></content>' });
      }).not.toThrow();
    });

    it('should work with trackLoading=true even without context', async () => {
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      const { container } = render(
        <XMLFileRenderer fileName="test/file" trackLoading={true} />
      );

      // Should still work normally
      await waitFor(() => {
        expect(container.textContent).toBe('Content');
      });
    });
  });

  describe('Resource identifier format (Requirement 10.4)', () => {
    it('should generate resource ID with xml prefix and fileName', async () => {
      const registerResource = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        text: async () => '<content></content>'
      });

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="content/Home/AboutMe" />
        </LoadingTrackerContext.Provider>
      );

      expect(registerResource).toHaveBeenCalledTimes(1);
      
      const resourceId = registerResource.mock.calls[0][0];
      
      // Should start with 'xml-'
      expect(resourceId).toMatch(/^xml-/);
      
      // Should include the fileName
      expect(resourceId).toContain('content/Home/AboutMe');
      
      // Should have a random component for uniqueness
      expect(resourceId).toMatch(/^xml-content\/Home\/AboutMe-0\.\d+$/);
    });

    it('should generate unique IDs for different instances of same fileName', async () => {
      const registerResource = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content></content>'
      });

      // Render two instances with same fileName
      const { unmount: unmount1 } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      const firstId = registerResource.mock.calls[0][0];

      unmount1();
      registerResource.mockClear();

      const { unmount: unmount2 } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <XMLFileRenderer fileName="test/file" />
        </LoadingTrackerContext.Provider>
      );

      const secondId = registerResource.mock.calls[0][0];

      // IDs should be different (due to random component)
      expect(firstId).not.toBe(secondId);
      
      // But both should have same prefix and fileName
      expect(firstId).toMatch(/^xml-test\/file-/);
      expect(secondId).toMatch(/^xml-test\/file-/);

      unmount2();
    });
  });
});
