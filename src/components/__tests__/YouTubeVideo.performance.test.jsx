import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Performance Tests for YouTubeVideo component
 * 
 * Tests verify that the component meets performance requirements:
 * - Component mount time < 10ms (Requirements 7.2)
 * - Resource cleanup completes within 5ms of unmount (Requirements 7.2)
 * 
 * Validates Requirements 2.1: Performance
 */
describe('YouTubeVideo - Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Component mount time is under 10ms
   * 
   * This test measures the time it takes to mount the YouTubeVideo component
   * and verifies it meets the performance requirement of < 10ms mount time.
   * 
   * The test:
   * 1. Measures mount time over multiple iterations to get an average
   * 2. Accounts for variance in execution time
   * 3. Verifies average mount time is under 10ms threshold
   * 4. Reports the actual mount time for monitoring
   */
  it('mounts in under 10ms on average', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const iterations = 100; // Run 100 iterations to get reliable average
    const mountTimes = [];

    // Perform multiple mount operations and measure time
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      mountTimes.push(mountTime);

      // Clean up immediately
      unmount();
      cleanup();
    }

    // Calculate statistics
    const averageMountTime = mountTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxMountTime = Math.max(...mountTimes);
    const minMountTime = Math.min(...mountTimes);

    // Log performance metrics for monitoring
    console.log(`\nYouTubeVideo Mount Performance (${iterations} iterations):`);
    console.log(`  Average: ${averageMountTime.toFixed(3)}ms`);
    console.log(`  Min: ${minMountTime.toFixed(3)}ms`);
    console.log(`  Max: ${maxMountTime.toFixed(3)}ms`);
    console.log(`  Threshold: 10ms`);

    // Verify average mount time is under 10ms threshold
    expect(averageMountTime).toBeLessThan(10);
  });

  /**
   * Test: Component mount time remains consistent across different URL formats
   * 
   * This test verifies that mount time is consistent regardless of the
   * YouTube URL format used (standard, short, or embed).
   */
  it('mount time is consistent across different URL formats', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',  // Standard
      'https://youtu.be/dQw4w9WgXcQ',                 // Short
      'https://www.youtube.com/embed/dQw4w9WgXcQ'     // Embed
    ];

    const iterations = 50; // 50 iterations per URL format
    const resultsByFormat = {};

    testUrls.forEach(url => {
      const mountTimes = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        const { unmount } = render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={url} trackLoading={true} />
          </LoadingTrackerContext.Provider>
        );
        
        const endTime = performance.now();
        mountTimes.push(endTime - startTime);

        unmount();
        cleanup();
      }

      const average = mountTimes.reduce((sum, time) => sum + time, 0) / iterations;
      resultsByFormat[url] = average;
    });

    // Log results
    console.log('\nMount Time by URL Format:');
    Object.entries(resultsByFormat).forEach(([url, avgTime]) => {
      const format = url.includes('youtu.be') ? 'Short' : 
                     url.includes('embed') ? 'Embed' : 'Standard';
      console.log(`  ${format}: ${avgTime.toFixed(3)}ms`);
    });

    // Verify all formats are under 10ms
    Object.values(resultsByFormat).forEach(avgTime => {
      expect(avgTime).toBeLessThan(10);
    });

    // Verify variance between formats is reasonable (within 5ms)
    const times = Object.values(resultsByFormat);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const variance = maxTime - minTime;
    
    console.log(`  Variance: ${variance.toFixed(3)}ms`);
    expect(variance).toBeLessThan(5);
  });

  /**
   * Test: Component mount time with and without loading tracking
   * 
   * This test verifies that the trackLoading prop doesn't significantly
   * impact mount performance.
   */
  it('mount time is similar with and without loading tracking', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const iterations = 50;

    // Test with trackLoading=true
    const withTrackingTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      withTrackingTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    // Test with trackLoading=false
    const withoutTrackingTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      withoutTrackingTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const avgWithTracking = withTrackingTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const avgWithoutTracking = withoutTrackingTimes.reduce((sum, time) => sum + time, 0) / iterations;

    console.log('\nMount Time by Loading Tracking:');
    console.log(`  With tracking: ${avgWithTracking.toFixed(3)}ms`);
    console.log(`  Without tracking: ${avgWithoutTracking.toFixed(3)}ms`);
    console.log(`  Difference: ${Math.abs(avgWithTracking - avgWithoutTracking).toFixed(3)}ms`);

    // Both should be under 10ms
    expect(avgWithTracking).toBeLessThan(10);
    expect(avgWithoutTracking).toBeLessThan(10);

    // Difference should be minimal (within 3ms)
    expect(Math.abs(avgWithTracking - avgWithoutTracking)).toBeLessThan(3);
  });

  /**
   * Test: Resource cleanup completes within 5ms
   * 
   * This test verifies that unmounting the component and cleaning up
   * resources completes within the 5ms threshold specified in requirements.
   */
  it('cleanup completes within 5ms on average', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const iterations = 100;
    const cleanupTimes = [];

    for (let i = 0; i < iterations; i++) {
      // Mount the component
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Measure cleanup time
      const startTime = performance.now();
      unmount();
      const endTime = performance.now();
      
      cleanupTimes.push(endTime - startTime);
      cleanup();
    }

    // Calculate statistics
    const averageCleanupTime = cleanupTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxCleanupTime = Math.max(...cleanupTimes);
    const minCleanupTime = Math.min(...cleanupTimes);

    console.log(`\nYouTubeVideo Cleanup Performance (${iterations} iterations):`);
    console.log(`  Average: ${averageCleanupTime.toFixed(3)}ms`);
    console.log(`  Min: ${minCleanupTime.toFixed(3)}ms`);
    console.log(`  Max: ${maxCleanupTime.toFixed(3)}ms`);
    console.log(`  Threshold: 5ms`);

    // Verify average cleanup time is under 5ms threshold
    expect(averageCleanupTime).toBeLessThan(5);
  });

  /**
   * Test: Multiple instances mount efficiently
   * 
   * This test verifies that mounting multiple YouTubeVideo components
   * simultaneously doesn't cause performance degradation.
   */
  it('multiple instances mount efficiently', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2',
      'https://www.youtube.com/watch?v=video3',
      'https://www.youtube.com/watch?v=video4',
      'https://www.youtube.com/watch?v=video5'
    ];

    const iterations = 20;
    const mountTimes = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            {testUrls.map((url, index) => (
              <YouTubeVideo key={index} url={url} trackLoading={true} />
            ))}
          </div>
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      mountTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const averageMountTime = mountTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const averagePerComponent = averageMountTime / testUrls.length;

    console.log(`\nMultiple Instances Mount Performance (${testUrls.length} components, ${iterations} iterations):`);
    console.log(`  Total average: ${averageMountTime.toFixed(3)}ms`);
    console.log(`  Per component: ${averagePerComponent.toFixed(3)}ms`);
    console.log(`  Threshold per component: 10ms`);

    // Verify average per component is under 10ms
    expect(averagePerComponent).toBeLessThan(10);

    // Verify total time is reasonable (under 50ms for 5 components)
    expect(averageMountTime).toBeLessThan(50);
  });
});
