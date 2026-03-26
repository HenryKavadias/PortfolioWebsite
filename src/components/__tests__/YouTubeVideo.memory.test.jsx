import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Memory Leak Tests for YouTubeVideo component
 * 
 * Tests verify that the component properly cleans up resources and doesn't cause
 * memory leaks when mounted and unmounted multiple times.
 * 
 * Validates Requirements 2.1: Performance
 * - Component cleanup prevents memory leaks on unmount
 * - Component handles rapid mount/unmount cycles (navigation)
 */
describe('YouTubeVideo - Memory Leak Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Rapid mount/unmount cycles don't cause memory leaks
   * 
   * This test simulates rapid navigation between pages by mounting and unmounting
   * the component multiple times in quick succession. It verifies that:
   * 1. Each mount registers a resource
   * 2. Each unmount marks the resource complete (cleanup)
   * 3. No duplicate registrations or completions occur
   * 4. The component can be safely mounted/unmounted many times
   */
  it('handles rapid mount/unmount cycles without memory leaks', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const cycles = 50; // Simulate 50 rapid mount/unmount cycles

    // Track all registered and completed resource IDs
    const registeredIds = [];
    const completedIds = [];

    // Perform rapid mount/unmount cycles
    for (let i = 0; i < cycles; i++) {
      // Mount the component
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Capture the registered resource ID
      const registerCalls = mockContext.registerResource.mock.calls.length;
      if (registerCalls > registeredIds.length) {
        const newId = mockContext.registerResource.mock.calls[registerCalls - 1][0];
        registeredIds.push(newId);
      }

      // Immediately unmount (simulating rapid navigation)
      unmount();

      // Capture the completed resource ID
      const completeCalls = mockContext.markResourceComplete.mock.calls.length;
      if (completeCalls > completedIds.length) {
        const newId = mockContext.markResourceComplete.mock.calls[completeCalls - 1][0];
        completedIds.push(newId);
      }
    }

    // Verify that registerResource was called exactly once per cycle
    expect(mockContext.registerResource).toHaveBeenCalledTimes(cycles);

    // Verify that markResourceComplete was called exactly once per cycle
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(cycles);

    // Verify that all registered resources were completed
    expect(registeredIds.length).toBe(cycles);
    expect(completedIds.length).toBe(cycles);

    // Verify that each registered resource was completed exactly once
    registeredIds.forEach(registeredId => {
      const completionCount = completedIds.filter(id => id === registeredId).length;
      expect(completionCount).toBe(1);
    });

    // Verify no duplicate registrations
    const uniqueRegisteredIds = new Set(registeredIds);
    expect(uniqueRegisteredIds.size).toBe(cycles);

    // Verify no duplicate completions
    const uniqueCompletedIds = new Set(completedIds);
    expect(uniqueCompletedIds.size).toBe(cycles);
  });

  /**
   * Test: Event listeners are properly removed on unmount
   * 
   * This test verifies that the onLoad and onError event handlers are properly
   * cleaned up when the component unmounts. It ensures that:
   * 1. Event handlers don't fire after unmount
   * 2. No stale references to the component remain
   * 3. Context methods aren't called after cleanup
   */
  it('removes event listeners on unmount', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    // Mount the component
    const { container, unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    // Get the iframe element
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify registerResource was called on mount
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);

    // Clear the mock to track calls after unmount
    mockContext.markResourceComplete.mockClear();

    // Unmount the component
    unmount();

    // Verify markResourceComplete was called during cleanup
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);

    // Clear the mock again to verify no further calls
    mockContext.markResourceComplete.mockClear();

    // Try to trigger load event on the unmounted iframe
    // This should NOT trigger any additional calls to markResourceComplete
    await act(async () => {
      try {
        iframe.dispatchEvent(new Event('load'));
      } catch {
        // Expected: iframe may be detached from DOM
      }
    });

    // Verify that markResourceComplete was NOT called again
    // (event listener was properly removed)
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
  });

  /**
   * Test: Context resources are properly cleaned up on unmount
   * 
   * This test verifies that resources registered with LoadingTrackerContext
   * are properly marked complete on unmount, preventing memory leaks in the
   * context's resource tracking.
   */
  it('cleans up context resources on unmount', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    // Mount the component
    const { unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Verify resource has not been marked complete yet
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

    // Unmount the component
    unmount();

    // Verify resource was marked complete during cleanup
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);
  });

  /**
   * Test: No duplicate resource completions on unmount after load
   * 
   * This test verifies that if the iframe loads successfully before unmount,
   * the resource is only marked complete once (not twice - once on load and
   * once on unmount).
   */
  it('does not mark resource complete twice if loaded before unmount', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    // Mount the component
    const { container, unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    // Get the iframe element
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Simulate iframe load event
    await act(async () => {
      iframe.dispatchEvent(new Event('load'));
    });

    // Verify resource was marked complete on load
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    // Clear the mock to track calls during unmount
    mockContext.markResourceComplete.mockClear();

    // Unmount the component
    unmount();

    // Verify resource was NOT marked complete again during cleanup
    // (because it was already marked complete on load)
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
  });

  /**
   * Test: Multiple instances clean up independently
   * 
   * This test verifies that when multiple YouTubeVideo components are mounted
   * and unmounted, each one cleans up its own resources without interfering
   * with others.
   */
  it('multiple instances clean up independently', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl1 = 'https://www.youtube.com/watch?v=video1';
    const testUrl2 = 'https://www.youtube.com/watch?v=video2';
    const testUrl3 = 'https://youtu.be/video3';

    // Mount three components
    const { unmount: unmount1 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl1} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const { unmount: unmount2 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl2} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    const { unmount: unmount3 } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl3} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    // Verify all three resources were registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(3);
    const resourceId1 = mockContext.registerResource.mock.calls[0][0];
    const resourceId2 = mockContext.registerResource.mock.calls[1][0];
    const resourceId3 = mockContext.registerResource.mock.calls[2][0];

    // Verify all resource IDs are unique
    expect(resourceId1).not.toBe(resourceId2);
    expect(resourceId1).not.toBe(resourceId3);
    expect(resourceId2).not.toBe(resourceId3);

    // Unmount the second component
    unmount2();

    // Verify only the second resource was marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId2);

    // Clear the mock
    mockContext.markResourceComplete.mockClear();

    // Unmount the first component
    unmount1();

    // Verify only the first resource was marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId1);

    // Clear the mock
    mockContext.markResourceComplete.mockClear();

    // Unmount the third component
    unmount3();

    // Verify only the third resource was marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId3);
  });

  /**
   * Test: Component cleanup works without context
   * 
   * This test verifies that the component can be safely mounted and unmounted
   * even when LoadingTrackerContext is not available, without causing errors
   * or memory leaks.
   */
  it('handles mount/unmount cycles without context', () => {
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const cycles = 10;

    // Perform multiple mount/unmount cycles without context
    for (let i = 0; i < cycles; i++) {
      // Mount without context provider
      const { container, unmount } = render(
        <YouTubeVideo url={testUrl} trackLoading={true} />
      );

      // Verify iframe is rendered
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    }

    // If we reach here without errors, the test passes
    expect(true).toBe(true);
  });

  /**
   * Test: Ref cleanup prevents stale closures
   * 
   * This test verifies that the component uses refs correctly to prevent
   * stale closure issues in the cleanup function. The iframeLoadedRef should
   * always reflect the current load state, not a captured closure value.
   */
  it('uses refs to prevent stale closures in cleanup', async () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    // Mount the component
    const { container, unmount } = render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url={testUrl} trackLoading={true} />
      </LoadingTrackerContext.Provider>
    );

    // Get the iframe element
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeTruthy();

    // Verify resource was registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
    const resourceId = mockContext.registerResource.mock.calls[0][0];

    // Simulate iframe load event
    await act(async () => {
      iframe.dispatchEvent(new Event('load'));
    });

    // Verify resource was marked complete on load
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
    expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceId);

    // Clear the mock
    mockContext.markResourceComplete.mockClear();

    // Unmount the component
    // The cleanup function should check iframeLoadedRef (which is true)
    // and NOT call markResourceComplete again
    unmount();

    // Verify resource was NOT marked complete again
    // This confirms that the ref is being used correctly to prevent
    // stale closure issues
    expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
  });

  /**
   * Test: Unique resource IDs prevent conflicts
   * 
   * This test verifies that each component instance generates a unique
   * resource ID, even when rendering the same video multiple times.
   * This prevents resource tracking conflicts in the context.
   */
  it('generates unique resource IDs to prevent conflicts', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const instances = 20;

    // Mount multiple instances of the same video
    const unmountFunctions = [];
    for (let i = 0; i < instances; i++) {
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );
      unmountFunctions.push(unmount);
    }

    // Verify all instances registered resources
    expect(mockContext.registerResource).toHaveBeenCalledTimes(instances);

    // Extract all resource IDs
    const resourceIds = mockContext.registerResource.mock.calls.map(call => call[0]);

    // Verify all resource IDs are unique
    const uniqueIds = new Set(resourceIds);
    expect(uniqueIds.size).toBe(instances);

    // Verify all resource IDs follow the expected format
    resourceIds.forEach(id => {
      expect(id).toMatch(/^youtube-dQw4w9WgXcQ-\d+$/);
    });

    // Unmount all instances
    unmountFunctions.forEach(unmount => unmount());

    // Verify all resources were marked complete
    expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(instances);

    // Verify each resource was completed exactly once
    const completedIds = mockContext.markResourceComplete.mock.calls.map(call => call[0]);
    resourceIds.forEach(resourceId => {
      const completionCount = completedIds.filter(id => id === resourceId).length;
      expect(completionCount).toBe(1);
    });
  });
});
