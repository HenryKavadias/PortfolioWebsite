import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Page Load Performance Tests for YouTubeVideo component
 * 
 * Tests verify that multiple YouTube videos don't significantly impact
 * page load time and that the loading tracking system works correctly
 * with multiple videos.
 * 
 * Validates Requirements 2.1: Performance
 * Validates Requirements 7.2: Performance Metrics
 */
describe('YouTubeVideo - Page Load Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Test: Page with multiple videos loads within acceptable time
   * 
   * This test simulates a page with multiple YouTube videos and measures
   * the total time from initial render to all resources being registered.
   * 
   * Acceptance criteria:
   * - Initial render with 3 videos completes in under 50ms
   * - Initial render with 5 videos completes in under 100ms
   * - Each additional video adds less than 15ms to load time
   */
  it('page with 3 videos renders within 50ms', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2',
      'https://www.youtube.com/watch?v=video3'
    ];

    const iterations = 20;
    const renderTimes = [];

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
      renderTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    console.log(`\nPage Load with 3 Videos (${iterations} iterations):`);
    console.log(`  Average: ${averageRenderTime.toFixed(3)}ms`);
    console.log(`  Min: ${minRenderTime.toFixed(3)}ms`);
    console.log(`  Max: ${maxRenderTime.toFixed(3)}ms`);
    console.log(`  Threshold: 50ms`);

    // Verify average render time is under 50ms
    expect(averageRenderTime).toBeLessThan(50);

    // Verify all resources were registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(testUrls.length * iterations);
  });

  it('page with 5 videos renders within 100ms', () => {
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
    const renderTimes = [];

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
      renderTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const averageRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    console.log(`\nPage Load with 5 Videos (${iterations} iterations):`);
    console.log(`  Average: ${averageRenderTime.toFixed(3)}ms`);
    console.log(`  Min: ${minRenderTime.toFixed(3)}ms`);
    console.log(`  Max: ${maxRenderTime.toFixed(3)}ms`);
    console.log(`  Threshold: 100ms`);

    // Verify average render time is under 100ms
    expect(averageRenderTime).toBeLessThan(100);

    // Verify all resources were registered
    expect(mockContext.registerResource).toHaveBeenCalledTimes(testUrls.length * iterations);
  });

  /**
   * Test: Incremental cost per video is reasonable
   * 
   * This test measures how much each additional video adds to the page load time.
   * The incremental cost should be linear and minimal (under 15ms per video).
   */
  it('incremental cost per video is under 15ms', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const iterations = 20;
    const videoCountTests = [1, 2, 3, 4, 5, 6, 7, 8];
    const results = {};

    videoCountTests.forEach(videoCount => {
      const testUrls = Array.from({ length: videoCount }, (_, i) => 
        `https://www.youtube.com/watch?v=video${i + 1}`
      );

      const renderTimes = [];

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
        renderTimes.push(endTime - startTime);

        unmount();
        cleanup();
      }

      const average = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
      results[videoCount] = average;
    });

    console.log('\nIncremental Cost Analysis:');
    console.log('Videos | Avg Time | Per Video | Incremental');
    console.log('-------|----------|-----------|------------');

    let previousTime = 0;
    videoCountTests.forEach(count => {
      const avgTime = results[count];
      const perVideo = avgTime / count;
      const incremental = count === 1 ? avgTime : avgTime - previousTime;
      
      console.log(
        `${count.toString().padStart(6)} | ` +
        `${avgTime.toFixed(2).padStart(8)}ms | ` +
        `${perVideo.toFixed(2).padStart(9)}ms | ` +
        `${incremental.toFixed(2).padStart(11)}ms`
      );

      previousTime = avgTime;
    });

    // Calculate average incremental cost (excluding first video)
    const incrementalCosts = [];
    for (let i = 1; i < videoCountTests.length; i++) {
      const cost = results[videoCountTests[i]] - results[videoCountTests[i - 1]];
      incrementalCosts.push(cost);
    }

    const avgIncrementalCost = incrementalCosts.reduce((sum, cost) => sum + cost, 0) / incrementalCosts.length;
    console.log(`\nAverage incremental cost: ${avgIncrementalCost.toFixed(3)}ms per video`);

    // Verify incremental cost is under 15ms per video
    expect(avgIncrementalCost).toBeLessThan(15);
  });

  /**
   * Test: Loading tracker integration doesn't block rendering
   * 
   * This test verifies that the loading tracking system doesn't cause
   * synchronous blocking that would delay page rendering.
   */
  it('loading tracker integration is non-blocking', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const testUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2',
      'https://www.youtube.com/watch?v=video3'
    ];

    const iterations = 20;

    // Test with loading tracking enabled
    const withTrackingTimes = [];
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
      withTrackingTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    // Test with loading tracking disabled
    const withoutTrackingTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            {testUrls.map((url, index) => (
              <YouTubeVideo key={index} url={url} trackLoading={false} />
            ))}
          </div>
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      withoutTrackingTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const avgWithTracking = withTrackingTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const avgWithoutTracking = withoutTrackingTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const difference = avgWithTracking - avgWithoutTracking;
    const percentageIncrease = (difference / avgWithoutTracking) * 100;

    console.log('\nLoading Tracker Impact on Page Load:');
    console.log(`  With tracking: ${avgWithTracking.toFixed(3)}ms`);
    console.log(`  Without tracking: ${avgWithoutTracking.toFixed(3)}ms`);
    console.log(`  Difference: ${difference.toFixed(3)}ms (${percentageIncrease.toFixed(1)}%)`);

    // Verify tracking overhead is minimal (under 10ms or 50% increase)
    // Note: Percentage can vary due to small absolute times, but absolute difference is more important
    expect(difference).toBeLessThan(10);
    expect(percentageIncrease).toBeLessThan(50);
  });

  /**
   * Test: Mixed URL formats don't impact page load time
   * 
   * This test verifies that using different YouTube URL formats
   * on the same page doesn't cause performance issues.
   */
  it('mixed URL formats have consistent performance', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const mixedUrls = [
      'https://www.youtube.com/watch?v=video1',      // Standard
      'https://youtu.be/video2',                     // Short
      'https://www.youtube.com/embed/video3',        // Embed
      'https://www.youtube.com/watch?v=video4&t=30', // With params
      'https://youtu.be/video5?t=45'                 // Short with params
    ];

    const sameFormatUrls = [
      'https://www.youtube.com/watch?v=video1',
      'https://www.youtube.com/watch?v=video2',
      'https://www.youtube.com/watch?v=video3',
      'https://www.youtube.com/watch?v=video4',
      'https://www.youtube.com/watch?v=video5'
    ];

    const iterations = 20;

    // Test with mixed formats
    const mixedTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            {mixedUrls.map((url, index) => (
              <YouTubeVideo key={index} url={url} trackLoading={true} />
            ))}
          </div>
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      mixedTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    // Test with same format
    const sameTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            {sameFormatUrls.map((url, index) => (
              <YouTubeVideo key={index} url={url} trackLoading={true} />
            ))}
          </div>
        </LoadingTrackerContext.Provider>
      );
      
      const endTime = performance.now();
      sameTimes.push(endTime - startTime);

      unmount();
      cleanup();
    }

    const avgMixed = mixedTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const avgSame = sameTimes.reduce((sum, time) => sum + time, 0) / iterations;
    const difference = Math.abs(avgMixed - avgSame);

    console.log('\nMixed vs Same URL Format Performance:');
    console.log(`  Mixed formats: ${avgMixed.toFixed(3)}ms`);
    console.log(`  Same format: ${avgSame.toFixed(3)}ms`);
    console.log(`  Difference: ${difference.toFixed(3)}ms`);

    // Verify difference is minimal (under 5ms)
    expect(difference).toBeLessThan(5);
  });

  /**
   * Test: Page load time scales linearly with video count
   * 
   * This test verifies that adding more videos doesn't cause
   * exponential performance degradation (O(n) complexity).
   */
  it('page load time scales linearly with video count', () => {
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    const iterations = 15;
    const videoCountTests = [1, 2, 4, 8, 10];
    const results = {};

    videoCountTests.forEach(videoCount => {
      const testUrls = Array.from({ length: videoCount }, (_, i) => 
        `https://www.youtube.com/watch?v=video${i + 1}`
      );

      const renderTimes = [];

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
        renderTimes.push(endTime - startTime);

        unmount();
        cleanup();
      }

      const average = renderTimes.reduce((sum, time) => sum + time, 0) / iterations;
      results[videoCount] = average;
    });

    console.log('\nScalability Analysis:');
    console.log('Videos | Avg Time | Per Video | Expected (Linear)');
    console.log('-------|----------|-----------|------------------');

    const baselinePerVideo = results[1]; // Time for 1 video
    videoCountTests.forEach(count => {
      const avgTime = results[count];
      const perVideo = avgTime / count;
      const expectedLinear = baselinePerVideo * count;
      const deviation = ((avgTime - expectedLinear) / expectedLinear) * 100;
      
      console.log(
        `${count.toString().padStart(6)} | ` +
        `${avgTime.toFixed(2).padStart(8)}ms | ` +
        `${perVideo.toFixed(2).padStart(9)}ms | ` +
        `${expectedLinear.toFixed(2).padStart(8)}ms (${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%)`
      );
    });

    // Verify scaling is roughly linear (deviation under 50% for larger counts)
    videoCountTests.forEach(count => {
      if (count > 1) {
        const avgTime = results[count];
        const expectedLinear = baselinePerVideo * count;
        const deviation = Math.abs((avgTime - expectedLinear) / expectedLinear);
        
        // Allow up to 50% deviation from perfect linear scaling
        expect(deviation).toBeLessThan(0.5);
      }
    });
  });
});
