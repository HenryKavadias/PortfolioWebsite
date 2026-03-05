import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor, act } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Slow Network Conditions Tests for YouTubeVideo component
 * 
 * Tests verify that the component behaves correctly under slow network conditions:
 * - Component doesn't block page rendering while iframe loads
 * - Loading tracker integration works with delayed loads
 * - No memory leaks or hanging resources with slow loads
 * - User experience remains acceptable with slow connections
 * 
 * Validates Requirements 2.1: Performance
 * Validates Requirements 2.3: Reliability
 */
describe('YouTubeVideo - Slow Network Conditions Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Component renders immediately without blocking
   * 
   * This test verifies that the component renders the iframe element
   * immediately, even if the iframe content takes time to load.
   * The component should not wait for the iframe to load before rendering.
   */
  it('renders iframe immediately without waiting for load', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const startTime = performance.now();
    
    const { container } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );
    
    const renderTime = performance.now() - startTime;

    // Verify iframe is rendered immediately
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

    // Verify render time is fast (under 50ms - allows for test environment overhead)
    expect(renderTime).toBeLessThan(50);

    // Verify resource was registered immediately
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);

    // Verify resource is NOT marked complete yet (iframe hasn't loaded)
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    console.log(`\nImmediate Render Test:`);
    console.log(`  Render time: ${renderTime.toFixed(3)}ms`);
    console.log(`  iframe rendered: ${!!iframe}`);
    console.log(`  Resource registered: ${mockContext.registerResource.mock.calls.length}`);
  });

  /**
   * Test: Loading tracker marks complete on delayed load
   * 
   * This test simulates a slow network by delaying the iframe load event
   * and verifies that the loading tracker correctly marks the resource
   * complete when the load eventually succeeds.
   */
  it('marks resource complete when iframe loads after delay', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const { container } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Verify resource is not marked complete yet
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Simulate delayed load (e.g., 2 seconds)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      iframe.dispatchEvent(new Event('load'));
    });

    // Verify resource was marked complete after delayed load
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    console.log(`\nDelayed Load Test:`);
    console.log(`  Simulated delay: 2000ms`);
    console.log(`  Resource marked complete: ${mockContext.markResourceComplete.mock.calls.length}`);
  });

  /**
   * Test: Component cleans up if unmounted before slow load completes
   * 
   * This test simulates a user navigating away before the iframe finishes
   * loading on a slow connection. The component should properly clean up
   * and mark the resource complete to prevent blocking page loading.
   */
  it('cleans up properly if unmounted before slow load completes', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const { container, unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Verify resource is not marked complete yet
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Simulate slow network: wait 1 second but don't trigger load event
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    // Verify resource is still not marked complete
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Unmount before load completes (user navigates away)
    unmount();

    // Verify resource was marked complete during cleanup
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    console.log(`\nEarly Unmount Test:`);
    console.log(`  Waited: 1000ms without load`);
    console.log(`  Resource cleaned up on unmount: ${mockContext.markResourceComplete.mock.calls.length}`);
  });

  /**
   * Test: Multiple videos with slow loads don't interfere
   * 
   * This test verifies that when multiple videos are loading slowly,
   * they don't interfere with each other and each properly tracks
   * its own loading state.
   */
  it('multiple videos with slow loads track independently', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2',
      'https://www.youtube.com/watch?v=video3'
    ];

    const { container } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          {testUrls.map((url, index) => (
            <YouTubeVideo key={index} url={url} trackLoading={true} />
          ))}
        </div>
      </LoadingTrackerContext.Provider>
    );

    const iframes = container.querySelectorAll('iframe');
    expect(iframes.length).toBe(3);

    // Verify all resources were registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(3);
    const resourceIds = mockContext.registerResource.mock.calls.map(call => call[0]);

    // Verify all resource IDs are unique
    expect(new Set(resourceIds).size).toBe(3);

    // Verify no resources are marked complete yet
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Simulate first video loading after 500ms
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      iframes[0].dispatchEvent(new Event('load'));
    });

    // Verify only first resource is marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[0]);

    // Simulate third video loading after another 500ms (second video still loading)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      iframes[2].dispatchEvent(new Event('load'));
    });

    // Verify first and third resources are marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(2);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[2]);

    // Simulate second video loading after another 500ms
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      iframes[1].dispatchEvent(new Event('load'));
    });

    // Verify all resources are marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(3);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[1]);

    console.log(`\nMultiple Slow Loads Test:`);
    console.log(`  Total videos: ${testUrls.length}`);
    console.log(`  Load order: 1st (500ms), 3rd (1000ms), 2nd (1500ms)`);
    console.log(`  All resources completed: ${mockContext.markResourceComplete.mock.calls.length === 3}`);
  });

  /**
   * Test: Component handles very long load times gracefully
   * 
   * This test simulates an extremely slow network (5+ seconds) and verifies
   * that the component continues to function correctly without timing out
   * or causing issues.
   */
  it('handles very long load times without issues', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const { container } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Verify resource is not marked complete yet
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Simulate very slow load (5 seconds)
    const loadStartTime = performance.now();
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 5000));
      iframe.dispatchEvent(new Event('load'));
    });
    const loadDuration = performance.now() - loadStartTime;

    // Verify resource was marked complete after very long delay
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    // Verify component is still functional
    expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

    console.log(`\nVery Long Load Test:`);
    console.log(`  Simulated delay: 5000ms`);
    console.log(`  Actual duration: ${loadDuration.toFixed(0)}ms`);
    console.log(`  Resource marked complete: ${mockContext.markResourceComplete.mock.calls.length}`);
  }, 10000); // 10 second timeout for this test

  /**
   * Test: Slow load followed by error is handled correctly
   * 
   * This test simulates a slow network that eventually fails, verifying
   * that the component handles the error correctly and marks the resource
   * complete to prevent blocking.
   * 
   * Note: iframe error events may not trigger onError in test environment,
   * so we focus on verifying the cleanup behavior on unmount.
   */
  it('handles slow load followed by error', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const { container, unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Simulate slow network: wait 2 seconds (simulating failed load)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
    });

    // Verify resource is not marked complete yet (load hasn't completed or failed)
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Unmount (simulating user navigating away after failed load)
    unmount();

    // Verify resource was marked complete during cleanup
    // This ensures that even if the load fails, the resource doesn't block page loading
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    console.log(`\nSlow Load + Error Test:`);
    console.log(`  Simulated delay before unmount: 2000ms`);
    console.log(`  Resource marked complete on cleanup: ${mockContext.markResourceComplete.mock.calls.length}`);
  }, 5000); // 5 second timeout for this test

  /**
   * Test: Rapid mount/unmount during slow loads doesn't cause issues
   * 
   * This test simulates rapid navigation (mount/unmount cycles) while
   * videos are still loading on a slow connection. This verifies that
   * the component handles this scenario without memory leaks or errors.
   */
  it('handles rapid mount/unmount during slow loads', async () => {
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const cycles = 10;
    let totalRegistrations = 0;
    let totalCompletions = 0;

    for (let i = 0; i < cycles; i++) {
      // Create fresh mock for each cycle
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Mount the component
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Wait a short time (simulating slow load in progress)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Unmount before load completes
      unmount();
      cleanup();

      // Track totals
      totalRegistrations += mockContext.registerResource.mock.calls.length;
      totalCompletions += mockContext.markResourceComplete.mock.calls.length;
    }

    // Verify all resources were registered and completed
    expect(totalRegistrations).toBe(cycles);
    expect(totalCompletions).toBe(cycles);

    console.log(`\nRapid Mount/Unmount During Slow Loads:`);
    console.log(`  Cycles: ${cycles}`);
    console.log(`  Resources registered: ${totalRegistrations}`);
    console.log(`  Resources completed: ${totalCompletions}`);
  });

  /**
   * Test: Component without loading tracking works with slow loads
   * 
   * This test verifies that when trackLoading is false, the component
   * still renders correctly even with slow network conditions, and
   * doesn't interact with the loading tracker.
   */
  it('works without loading tracking during slow loads', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    const { container } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={false} />
      </LoadingTrackerContext.Provider>
    );

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();
    expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

    // Verify no interaction with loading tracker
    expect(mockContext.registerResource).not.toHaveBeenCalled();
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Simulate slow load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      iframe.dispatchEvent(new Event('load'));
    });

    // Verify still no interaction with loading tracker
    expect(mockContext.registerResource).not.toHaveBeenCalled();
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    console.log(`\nNo Tracking During Slow Load:`);
    console.log(`  trackLoading: false`);
    console.log(`  Simulated delay: 2000ms`);
    console.log(`  Context interactions: 0`);
  }, 5000); // 5 second timeout for this test

  /**
   * Test: Page remains responsive during slow video loads
   * 
   * This test verifies that the page remains responsive and can render
   * other content while videos are loading slowly in the background.
   */
  it('page remains responsive during slow video loads', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2'
    ];

    // Measure time to render page with videos
    const renderStartTime = performance.now();
    
    const { container, rerender } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <h1>Test Page</h1>
          {testUrls.map((url, index) => (
            <YouTubeVideo key={index} url={url} trackLoading={true} />
          ))}
          <p>Other content</p>
        </div>
      </LoadingTrackerContext.Provider>
    );
    
    const renderTime = performance.now() - renderStartTime;

    // Verify page rendered quickly despite videos not being loaded
    expect(renderTime).toBeLessThan(50);

    // Verify all content is present
    expect(container.querySelector('h1')).toBeTruthy();
    expect(container.querySelector('p')).toBeTruthy();
    expect(container.querySelectorAll('iframe').length).toBe(2);

    // Verify page can be updated while videos are loading
    const updateStartTime = performance.now();
    
    rerender(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <h1>Test Page Updated</h1>
          {testUrls.map((url, index) => (
            <YouTubeVideo key={index} url={url} trackLoading={true} />
          ))}
          <p>Other content updated</p>
        </div>
      </LoadingTrackerContext.Provider>
    );
    
    const updateTime = performance.now() - updateStartTime;

    // Verify update was fast
    expect(updateTime).toBeLessThan(50);

    // Verify updated content is present
    expect(container.querySelector('h1').textContent).toBe('Test Page Updated');
    expect(container.querySelector('p').textContent).toBe('Other content updated');

    console.log(`\nPage Responsiveness Test:`);
    console.log(`  Initial render time: ${renderTime.toFixed(3)}ms`);
    console.log(`  Update time: ${updateTime.toFixed(3)}ms`);
    console.log(`  Page remained responsive: ${renderTime < 50 && updateTime < 50}`);
  });
});
