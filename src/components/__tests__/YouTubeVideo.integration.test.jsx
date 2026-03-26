import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';
import { Component } from 'react';

/**
 * Integration tests for YouTubeVideo component error handling
 * 
 * Tests error handling in real usage scenarios:
 * - Error boundaries catching component errors
 * - Application stability when invalid props are provided
 * - Error messages are clear and helpful
 * - Component fails gracefully without crashing the application
 * 
 * **Validates: Requirements 1.2 (Props Validation) in integration context**
 */

/**
 * Simple Error Boundary component for testing
 * Catches errors thrown by child components and displays error message
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for debugging (in real app, this would go to error tracking service)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-testid="error-boundary">
          <h2>Something went wrong</h2>
          <p data-testid="error-message">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

describe('YouTubeVideo - Integration Tests: Error Handling', () => {
  let mockContext;

  beforeEach(() => {
    // Create fresh mock context for each test
    mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };
    
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Test: Error boundary catches null url error
   * Validates that when url is null, the error is caught by error boundary
   * and the application continues to function
   */
  it('error boundary catches null url error gracefully', () => {
    const { getByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url={null} />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    // Verify error boundary caught the error
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeTruthy();

    // Verify error message is displayed
    const errorMessage = getByTestId('error-message');
    expect(errorMessage.textContent).toBe("YouTubeVideo requires a 'url' prop");
  });

  /**
   * Test: Error boundary catches undefined url error
   * Validates that when url is undefined, the error is caught by error boundary
   */
  it('error boundary catches undefined url error gracefully', () => {
    const { getByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url={undefined} />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    // Verify error boundary caught the error
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeTruthy();

    // Verify error message is displayed
    const errorMessage = getByTestId('error-message');
    expect(errorMessage.textContent).toBe("YouTubeVideo requires a 'url' prop");
  });

  /**
   * Test: Error boundary catches empty string url error
   * Validates that when url is empty string, the error is caught by error boundary
   */
  it('error boundary catches empty string url error gracefully', () => {
    const { getByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url="" />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    // Verify error boundary caught the error
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeTruthy();

    // Verify error message is displayed
    const errorMessage = getByTestId('error-message');
    expect(errorMessage.textContent).toBe("YouTubeVideo requires a 'url' prop");
  });

  /**
   * Test: Error boundary catches invalid URL format error
   * Validates that when url format is invalid (not a YouTube URL),
   * the error is caught by error boundary
   */
  it('error boundary catches invalid URL format error gracefully', () => {
    const { getByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url="https://example.com/video" />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    // Verify error boundary caught the error
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeTruthy();

    // Verify error message is displayed
    const errorMessage = getByTestId('error-message');
    expect(errorMessage.textContent).toBe("Invalid YouTube URL format");
  });

  /**
   * Test: Multiple components with mixed valid and invalid props
   * Validates that one component with invalid props doesn't crash other components
   */
  it('one component error does not crash other components', () => {
    const { container, getAllByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          {/* Valid component 1 */}
          <ErrorBoundary>
            <YouTubeVideo url="https://www.youtube.com/watch?v=valid1" />
          </ErrorBoundary>

          {/* Invalid component - should be caught by error boundary */}
          <ErrorBoundary>
            <YouTubeVideo url={null} />
          </ErrorBoundary>

          {/* Valid component 2 */}
          <ErrorBoundary>
            <YouTubeVideo url="https://youtu.be/valid2" />
          </ErrorBoundary>

          {/* Invalid component - invalid format */}
          <ErrorBoundary>
            <YouTubeVideo url="https://vimeo.com/123456" />
          </ErrorBoundary>

          {/* Valid component 3 */}
          <ErrorBoundary>
            <YouTubeVideo url="https://www.youtube.com/embed/valid3" />
          </ErrorBoundary>
        </div>
      </LoadingTrackerContext.Provider>
    );

    // Verify valid components rendered successfully
    const iframes = container.querySelectorAll('iframe');
    expect(iframes).toHaveLength(3);
    expect(iframes[0].src).toBe('https://www.youtube.com/embed/valid1');
    expect(iframes[1].src).toBe('https://www.youtube.com/embed/valid2');
    expect(iframes[2].src).toBe('https://www.youtube.com/embed/valid3');

    // Verify error boundaries caught the invalid components
    const errorBoundaries = getAllByTestId('error-boundary');
    expect(errorBoundaries).toHaveLength(2);

    // Verify error messages are displayed
    const errorMessages = getAllByTestId('error-message');
    expect(errorMessages).toHaveLength(2);
    expect(errorMessages[0].textContent).toBe("YouTubeVideo requires a 'url' prop");
    expect(errorMessages[1].textContent).toBe("Invalid YouTube URL format");
  });

  /**
   * Test: Error messages are clear and helpful
   * Validates that error messages provide clear guidance on what went wrong
   */
  it('error messages are clear and helpful', () => {
    // Test missing url error message
    const { getByTestId: getByTestId1 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url={null} />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    const errorMessage1 = getByTestId1('error-message');
    // Error message should clearly indicate that url prop is required
    expect(errorMessage1.textContent).toContain('url');
    expect(errorMessage1.textContent).toContain('prop');
    expect(errorMessage1.textContent).toContain('requires');

    cleanup();

    // Test invalid format error message
    const { getByTestId: getByTestId2 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url="https://example.com" />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    const errorMessage2 = getByTestId2('error-message');
    // Error message should clearly indicate that URL format is invalid
    expect(errorMessage2.textContent).toContain('Invalid');
    expect(errorMessage2.textContent).toContain('YouTube');
    expect(errorMessage2.textContent).toContain('URL');
    expect(errorMessage2.textContent).toContain('format');
  });

  /**
   * Test: Component fails gracefully without crashing the application
   * Validates that errors don't propagate beyond error boundaries
   */
  it('component fails gracefully without crashing the application', () => {
    // Simulate a page with multiple sections, one containing invalid video
    const { container, getByTestId } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <header data-testid="header">
            <h1>My Page</h1>
          </header>

          <main data-testid="main">
            <section data-testid="section-1">
              <h2>Valid Video Section</h2>
              <ErrorBoundary>
                <YouTubeVideo url="https://www.youtube.com/watch?v=valid123" />
              </ErrorBoundary>
            </section>

            <section data-testid="section-2">
              <h2>Invalid Video Section</h2>
              <ErrorBoundary>
                <YouTubeVideo url={null} />
              </ErrorBoundary>
            </section>

            <section data-testid="section-3">
              <h2>Another Valid Section</h2>
              <p>Some content here</p>
            </section>
          </main>

          <footer data-testid="footer">
            <p>Footer content</p>
          </footer>
        </div>
      </LoadingTrackerContext.Provider>
    );

    // Verify all page sections are still rendered
    expect(getByTestId('header')).toBeTruthy();
    expect(getByTestId('main')).toBeTruthy();
    expect(getByTestId('section-1')).toBeTruthy();
    expect(getByTestId('section-2')).toBeTruthy();
    expect(getByTestId('section-3')).toBeTruthy();
    expect(getByTestId('footer')).toBeTruthy();

    // Verify valid video rendered
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.src).toBe('https://www.youtube.com/embed/valid123');

    // Verify error boundary caught the invalid video
    const errorBoundary = getByTestId('error-boundary');
    expect(errorBoundary).toBeTruthy();

    // Verify other sections are unaffected
    const section3 = getByTestId('section-3');
    expect(section3.textContent).toContain('Some content here');
  });

  /**
   * Test: Various invalid prop combinations
   * Validates error handling with different combinations of invalid props
   */
  it('handles various invalid prop combinations correctly', () => {
    const invalidUrls = [
      { url: null, expectedError: "YouTubeVideo requires a 'url' prop" },
      { url: undefined, expectedError: "YouTubeVideo requires a 'url' prop" },
      { url: '', expectedError: "YouTubeVideo requires a 'url' prop" },
      { url: 'not-a-url', expectedError: 'Invalid YouTube URL format' },
      { url: 'https://vimeo.com/123', expectedError: 'Invalid YouTube URL format' },
      { url: 'https://example.com', expectedError: 'Invalid YouTube URL format' },
      { url: 'https://youtube-fake.com/watch?v=123', expectedError: 'Invalid YouTube URL format' },
      { url: 'https://www.youtube.co.uk/watch?v=123', expectedError: 'Invalid YouTube URL format' }
    ];

    invalidUrls.forEach(({ url, expectedError }) => {
      const { getByTestId } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <ErrorBoundary>
            <YouTubeVideo url={url} />
          </ErrorBoundary>
        </LoadingTrackerContext.Provider>
      );

      // Verify error boundary caught the error
      const errorBoundary = getByTestId('error-boundary');
      expect(errorBoundary).toBeTruthy();

      // Verify correct error message is displayed
      const errorMessage = getByTestId('error-message');
      expect(errorMessage.textContent).toBe(expectedError);

      cleanup();
    });
  });

  /**
   * Test: Error handling doesn't interfere with loading tracker
   * Validates that when component throws error, loading tracker is not left in inconsistent state
   */
  it('error handling does not interfere with loading tracker', () => {
    // Render component with invalid url
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <ErrorBoundary>
          <YouTubeVideo url={null} />
        </ErrorBoundary>
      </LoadingTrackerContext.Provider>
    );

    // Verify registerResource was NOT called (component threw error before registration)
    expect(mockContext.registerResource).not.toHaveBeenCalled();

    // Verify markResourceComplete was NOT called
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // This ensures the loading tracker is not left in an inconsistent state
    // with registered resources that will never complete
  });
});

/**
 * Integration tests for YouTubeVideo component navigation handling
 * 
 * Tests navigation scenarios between pages with videos:
 * - Resources are properly cleaned up on unmount during navigation
 * - New resources are registered on mount after navigation
 * - No memory leaks or errors occur during navigation
 * - LoadingTrackerContext integration works correctly across navigation
 * 
 * **Validates: Requirements 1.5 (Loading Tracking Integration), 1.8 (Multiple Instances Support)**
 */

describe('YouTubeVideo - Integration Tests: Navigation Handling', () => {
  let mockContext;

  beforeEach(() => {
    // Create fresh mock context for each test
    mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  /**
   * Test: Resources are cleaned up when navigating away from page with video
   * Validates that when a component unmounts during navigation,
   * it properly marks resources complete if they haven't loaded yet
   */
  it('cleans up resources when navigating away from page with video', () => {
    // Render a video component
    const { unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=video1" />
      </LoadingTrackerContext.Provider>
    );

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const registeredResourceId = mockContext.registerResource.mock.calls[0][0];
    expect(registeredResourceId).toMatch(/^youtube-video1-\d+$/);

    // Simulate navigation away (unmount)
    unmount();

    // Verify resource was marked complete on unmount (cleanup)
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(registeredResourceId);
  });

  /**
   * Test: New resources are registered when navigating to page with video
   * Validates that mounting a new video component after navigation
   * properly registers its resources
   */
  it('registers new resources when navigating to page with video', () => {
    // Simulate first page with video
    const { unmount: unmount1 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=video1" />
      </LoadingTrackerContext.Provider>
    );

    // Verify first video registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const firstResourceId = mockContext.registerResource.mock.calls[0][0];

    // Navigate away (unmount first video)
    unmount1();

    // Reset mocks to track second page separately
    mockContext.registerResource.mockClear();
    mockContext.markResourceComplete.mockClear();

    // Simulate second page with different video
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=video2" />
      </LoadingTrackerContext.Provider>
    );

    // Verify second video registered with different ID
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const secondResourceId = mockContext.registerResource.mock.calls[0][0];
    expect(secondResourceId).toMatch(/^youtube-video2-\d+$/);
    expect(secondResourceId).not.toBe(firstResourceId);
  });

  /**
   * Test: Rapid navigation between pages with videos
   * Validates that rapid mount/unmount cycles don't cause errors
   * or leave resources in inconsistent state
   */
  it('handles rapid navigation between pages with videos', () => {
    const videos = [
      'https://www.youtube.com/watch?v=video1',
      'https://youtu.be/video2',
      'https://www.youtube.com/embed/video3',
      'https://www.youtube.com/watch?v=video4'
    ];

    const registeredResources = [];
    const completedResources = [];

    // Track all registered and completed resources
    mockContext.registerResource.mockImplementation((id) => {
      registeredResources.push(id);
    });
    mockContext.markResourceComplete.mockImplementation((id) => {
      completedResources.push(id);
    });

    // Simulate rapid navigation through multiple pages
    videos.forEach((url) => {
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={url} />
        </LoadingTrackerContext.Provider>
      );
      
      // Immediately unmount (simulate quick navigation)
      unmount();
    });

    // Verify all resources were registered
    expect(registeredResources).toHaveLength(4);
    expect(registeredResources[0]).toMatch(/^youtube-video1-\d+$/);
    expect(registeredResources[1]).toMatch(/^youtube-video2-\d+$/);
    expect(registeredResources[2]).toMatch(/^youtube-video3-\d+$/);
    expect(registeredResources[3]).toMatch(/^youtube-video4-\d+$/);

    // Verify all resources were cleaned up
    expect(completedResources).toHaveLength(4);
    
    // Verify each registered resource was completed
    registeredResources.forEach((resourceId) => {
      expect(completedResources).toContain(resourceId);
    });

    // Verify no duplicate completions
    const uniqueCompletions = new Set(completedResources);
    expect(uniqueCompletions.size).toBe(completedResources.length);
  });

  /**
   * Test: Navigation with loaded vs unloaded videos
   * Validates that cleanup behavior differs based on whether
   * the video finished loading before navigation
   */
  it('handles navigation with loaded vs unloaded videos correctly', () => {
    // Test 1: Video that loads before navigation
    const { container: container1, unmount: unmount1 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=loaded" />
      </LoadingTrackerContext.Provider>
    );

    const loadedResourceId = mockContext.registerResource.mock.calls[0][0];

    // Simulate iframe load event
    const iframe1 = container1.querySelector('iframe');
    iframe1.dispatchEvent(new Event('load'));

    // Verify resource was marked complete on load
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(loadedResourceId);
    
    const completionsBeforeUnmount = mockContext.markResourceComplete.mock.calls.length;

    // Navigate away
    unmount1();

    // Verify no additional completion call (already loaded)
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(completionsBeforeUnmount);

    // Reset for second test
    mockContext.registerResource.mockClear();
    mockContext.markResourceComplete.mockClear();

    // Test 2: Video that doesn't load before navigation
    const { unmount: unmount2 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=unloaded" />
      </LoadingTrackerContext.Provider>
    );

    const unloadedResourceId = mockContext.registerResource.mock.calls[0][0];

    // Navigate away WITHOUT triggering load event
    unmount2();

    // Verify resource was marked complete on unmount (cleanup)
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(unloadedResourceId);
  });

  /**
   * Test: Multiple videos on page during navigation
   * Validates that when a page has multiple videos,
   * all are properly cleaned up during navigation
   */
  it('cleans up multiple videos when navigating away from page', () => {
    const { unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <YouTubeVideo url="https://www.youtube.com/watch?v=video1" />
          <YouTubeVideo url="https://youtu.be/video2" />
          <YouTubeVideo url="https://www.youtube.com/embed/video3" />
        </div>
      </LoadingTrackerContext.Provider>
    );

    // Verify all three videos registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(3);
    const resourceIds = mockContext.registerResource.mock.calls.map(call => call[0]);
    expect(resourceIds[0]).toMatch(/^youtube-video1-\d+$/);
    expect(resourceIds[1]).toMatch(/^youtube-video2-\d+$/);
    expect(resourceIds[2]).toMatch(/^youtube-video3-\d+$/);

    // Navigate away (unmount all)
    unmount();

    // Verify all three resources were cleaned up
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(3);
    resourceIds.forEach((resourceId) => {
      expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);
    });
  });

  /**
   * Test: Navigation with trackLoading disabled
   * Validates that videos with trackLoading=false don't interfere
   * with loading tracker during navigation
   */
  it('handles navigation with trackLoading disabled correctly', () => {
    const { unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo 
          url="https://www.youtube.com/watch?v=video1" 
          trackLoading={false}
        />
      </LoadingTrackerContext.Provider>
    );

    // Verify no resource was registered
    expect(mockContext.registerResource).not.toHaveBeenCalled();

    // Navigate away
    unmount();

    // Verify no cleanup calls were made
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
  });

  /**
   * Test: Navigation without LoadingTrackerContext
   * Validates that component handles navigation gracefully
   * even when context is not available
   */
  it('handles navigation without LoadingTrackerContext gracefully', () => {
    // Render without context provider
    const { unmount } = render(
      <YouTubeVideo url="https://www.youtube.com/watch?v=video1" />
    );

    // Should not throw error during unmount
    expect(() => unmount()).not.toThrow();
  });

  /**
   * Test: Same video on different pages
   * Validates that the same video URL on different pages
   * creates separate resource instances
   */
  it('creates separate resource instances for same video on different pages', () => {
    const sameUrl = 'https://www.youtube.com/watch?v=samevideo';

    // Render first instance
    const { unmount: unmount1 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={sameUrl} />
      </LoadingTrackerContext.Provider>
    );

    const firstResourceId = mockContext.registerResource.mock.calls[0][0];

    // Navigate away
    unmount1();

    // Reset mocks
    mockContext.registerResource.mockClear();
    mockContext.markResourceComplete.mockClear();

    // Render second instance with same URL
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={sameUrl} />
      </LoadingTrackerContext.Provider>
    );

    const secondResourceId = mockContext.registerResource.mock.calls[0][0];

    // Verify different resource IDs (due to counter)
    expect(secondResourceId).not.toBe(firstResourceId);
    expect(firstResourceId).toMatch(/^youtube-samevideo-\d+$/);
    expect(secondResourceId).toMatch(/^youtube-samevideo-\d+$/);
  });

  /**
   * Test: Cleanup happens correctly regardless of load state
   * Validates that cleanup during navigation works whether
   * the iframe loaded, errored, or is still pending
   */
  it('cleans up correctly during navigation regardless of load state', () => {
    // Test case: iframe still loading when navigation occurs
    const { unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=pendingvideo" />
      </LoadingTrackerContext.Provider>
    );

    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Navigate away while still loading (no load or error event)
    unmount();

    // Verify resource was marked complete on unmount (cleanup)
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
  });

  /**
   * Test: Memory leak prevention during navigation
   * Validates that resource IDs are properly tracked and cleaned up
   * to prevent memory leaks in the loading tracker
   */
  it('prevents memory leaks by cleaning up all registered resources', () => {
    const resourceTracker = {
      registered: new Set(),
      completed: new Set()
    };

    mockContext.registerResource.mockImplementation((id) => {
      resourceTracker.registered.add(id);
    });

    mockContext.markResourceComplete.mockImplementation((id) => {
      resourceTracker.completed.add(id);
    });

    // Simulate multiple navigation cycles
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={`https://www.youtube.com/watch?v=video${i}`} />
        </LoadingTrackerContext.Provider>
      );
      unmount();
    }

    // Verify all registered resources were completed
    expect(resourceTracker.registered.size).toBe(10);
    expect(resourceTracker.completed.size).toBe(10);

    // Verify every registered resource was completed
    resourceTracker.registered.forEach((resourceId) => {
      expect(resourceTracker.completed.has(resourceId)).toBe(true);
    });
  });
});
