import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Property-Based Tests for YouTubeVideo component
 * 
 * Uses fast-check library to generate random test inputs and verify properties hold
 * for all valid inputs. This complements unit tests by testing a wider range of inputs.
 * 
 * Properties tested:
 * - Video ID extraction correctness for any valid YouTube URL format
 * - URL construction correctness for any valid videoId
 * - Validation throws for any falsy url
 * - Validation throws for any non-YouTube URL
 * - Dimensions render correctly for any positive numbers
 * - trackLoading boolean correctly enables/disables context
 * - Idempotency - same props produce same output
 */
describe('YouTubeVideo - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  /**
   * Property Test: Video ID extraction for any valid YouTube URL format
   * **Validates: Requirements 1.2, 1.3**
   * 
   * Validates that for any valid YouTube URL (standard, short, or embed format),
   * the component correctly extracts the video ID and constructs the proper embed URL.
   */
  it('property: extracts video ID correctly from any valid YouTube URL format', () => {
    // Mock context to prevent context-related errors
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    // Arbitrary generator for valid YouTube video IDs (11 characters, alphanumeric + underscore + hyphen)
    const videoIdArbitrary = fc.array(
      fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')
      ),
      { minLength: 11, maxLength: 11 }
    ).map(chars => chars.join(''));

    // Arbitrary generator for URL format (standard, short, or embed)
    const urlFormatArbitrary = fc.constantFrom('standard', 'short', 'embed');

    // Arbitrary generator for protocol (http or https)
    const protocolArbitrary = fc.constantFrom('http', 'https');

    // Arbitrary generator for optional query parameters
    const queryParamsArbitrary = fc.option(
      fc.constantFrom('&t=30s', '&t=1m30s', '&feature=share', '&si=abc123'),
      { nil: '' }
    );

    fc.assert(
      fc.property(
        videoIdArbitrary,
        urlFormatArbitrary,
        protocolArbitrary,
        queryParamsArbitrary,
        (videoId, format, protocol, queryParams) => {
          // Construct URL based on format
          let url;
          if (format === 'standard') {
            url = `${protocol}://www.youtube.com/watch?v=${videoId}${queryParams}`;
          } else if (format === 'short') {
            // For short URLs, query params start with ?
            const shortQueryParams = queryParams ? queryParams.replace('&', '?') : '';
            url = `${protocol}://youtu.be/${videoId}${shortQueryParams}`;
          } else {
            // For embed URLs, query params start with ?
            const embedQueryParams = queryParams ? queryParams.replace('&', '?') : '';
            url = `${protocol}://www.youtube.com/embed/${videoId}${embedQueryParams}`;
          }

          // Render component with generated URL
          const { container } = render(
            <LoadingTrackerContext.Provider value={mockContext}>
              <YouTubeVideo url={url} />
            </LoadingTrackerContext.Provider>
          );

          // Verify iframe is rendered with correct embed URL
          const iframe = container.querySelector('iframe');
          expect(iframe).toBeTruthy();
          expect(iframe.src).toBe(`https://www.youtube.com/embed/${videoId}`);

          // Clean up for next iteration
          cleanup();
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });

  /**
   * Property Test: URL construction for any valid videoId
   * **Validates: Requirements 1.1, 1.6**
   * 
   * Property 3 from Design: URL Construction Correctness
   * ∀ valid videoId: constructEmbedUrl(videoId) returns `https://www.youtube.com/embed/${videoId}`
   * 
   * Validates that for any valid non-empty string videoId, the component constructs
   * a proper YouTube embed URL with HTTPS protocol starting with "https://www.youtube.com/embed/"
   */
  it('property: constructs correct embed URL for any valid videoId', () => {
    // Mock context to prevent context-related errors
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    // Arbitrary generator for valid YouTube video IDs
    // YouTube video IDs are typically 11 characters, alphanumeric plus underscore and hyphen
    const videoIdArbitrary = fc.string({
      minLength: 1,
      maxLength: 20,
      unit: fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')
      )
    });

    fc.assert(
      fc.property(videoIdArbitrary, (videoId) => {
        // Use standard watch URL format
        const url = `https://www.youtube.com/watch?v=${videoId}`;

        // Render component with generated URL
        const { container } = render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={url} />
          </LoadingTrackerContext.Provider>
        );

        // Verify iframe src is correctly constructed
        const iframe = container.querySelector('iframe');
        expect(iframe).toBeTruthy();
        
        // Property 1: embed URL always starts with https://www.youtube.com/embed/
        expect(iframe.src).toMatch(/^https:\/\/www\.youtube\.com\/embed\//);
        
        // Property 2: embed URL contains the exact video ID
        expect(iframe.src).toBe(`https://www.youtube.com/embed/${videoId}`);
        
        // Property 3: URL uses HTTPS protocol (security requirement)
        expect(iframe.src).toMatch(/^https:/);

        // Clean up for next iteration
        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property Test: Validation throws for any falsy url
   * **Validates: Requirements 1.2**
   * 
   * Property 1 from Design: Valid Props Requirement
   * ∀ component instances: If url is null, undefined, or empty string, then component throws Error before rendering
   * 
   * Validates that for the specific falsy values mentioned in requirements (null, undefined, empty string),
   * the component throws an error with the expected message before attempting to render.
   */
  it('property: throws error for any falsy url value', () => {
    // Arbitrary generator for falsy values specified in requirements
    // Requirements 1.2 specifically mentions: null, undefined, and empty string
    const falsyArbitrary = fc.constantFrom(
      null,
      undefined,
      ''
    );

    fc.assert(
      fc.property(falsyArbitrary, (falsyUrl) => {
        // Expect component to throw error for any falsy url
        expect(() => {
          render(<YouTubeVideo url={falsyUrl} />);
        }).toThrow('YouTubeVideo requires a \'url\' prop');

        // Clean up for next iteration
        cleanup();
      }),
      { numRuns: 30 } // Run 30 test cases (10 for each falsy value)
    );
  });

  /**
   * Property Test: Validation throws for any non-YouTube URL
   * **Validates: Requirements 1.2, 1.7**
   * 
   * Property 4 from Design: URL Format Support
   * Validates that for any URL that doesn't match YouTube URL patterns,
   * the component throws an error with message "Invalid YouTube URL format"
   * 
   * Tests various non-YouTube domains and invalid URL formats to ensure
   * the component properly rejects them.
   */
  it('property: throws error for any non-YouTube URL', () => {
    // Mock context to prevent context-related errors
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    // Arbitrary generator for non-YouTube domains
    const nonYouTubeDomainArbitrary = fc.constantFrom(
      'google.com',
      'facebook.com',
      'twitter.com',
      'vimeo.com',
      'dailymotion.com',
      'example.com',
      'test.org',
      'notayoutube.com',
      'youtube-fake.com',
      'youtu.be.fake.com'
    );

    // Arbitrary generator for protocols
    const protocolArbitrary = fc.constantFrom('http', 'https', 'ftp');

    // Arbitrary generator for paths
    const pathArbitrary = fc.constantFrom(
      '/video/123',
      '/watch?v=abc123',
      '/embed/xyz789',
      '/content',
      ''
    );

    fc.assert(
      fc.property(
        nonYouTubeDomainArbitrary,
        protocolArbitrary,
        pathArbitrary,
        (domain, protocol, path) => {
          // Construct non-YouTube URL
          const url = `${protocol}://${domain}${path}`;

          // Expect component to throw error for non-YouTube URL
          expect(() => {
            render(
              <LoadingTrackerContext.Provider value={mockContext}>
                <YouTubeVideo url={url} />
              </LoadingTrackerContext.Provider>
            );
          }).toThrow('Invalid YouTube URL format');

          // Clean up for next iteration
          cleanup();
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });

  /**
   * Property Test: Dimensions render correctly for any positive numbers
   * **Validates: Requirements 1.3**
   * 
   * Property 5 from Design: Configurable Dimensions
   * ∀ positive numbers width and height: iframe renders with those exact dimensions
   * 
   * Validates that for any positive width and height values, the component correctly
   * renders an iframe with those exact dimensions as attributes.
   */
  it('property: dimensions render correctly for any positive numbers', () => {
    // Mock context to prevent context-related errors
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    // Arbitrary generator for positive dimensions (1 to 10000 pixels)
    // Using reasonable bounds for web content dimensions
    const dimensionArbitrary = fc.integer({ min: 1, max: 10000 });

    // Use a fixed valid YouTube URL for testing dimensions
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    fc.assert(
      fc.property(
        dimensionArbitrary,
        dimensionArbitrary,
        (width, height) => {
          // Render component with generated dimensions
          const { container } = render(
            <LoadingTrackerContext.Provider value={mockContext}>
              <YouTubeVideo url={testUrl} width={width} height={height} />
            </LoadingTrackerContext.Provider>
          );

          // Verify iframe is rendered
          const iframe = container.querySelector('iframe');
          expect(iframe).toBeTruthy();

          // Property 1: iframe width attribute matches provided width
          expect(iframe.getAttribute('width')).toBe(String(width));
          
          // Property 2: iframe height attribute matches provided height
          expect(iframe.getAttribute('height')).toBe(String(height));

          // Clean up for next iteration
          cleanup();
        }
      ),
      { numRuns: 100 } // Run 100 random test cases with different dimension combinations
    );
  });

  /**
   * Property Test: trackLoading boolean correctly enables/disables context
   * **Validates: Requirements 1.5**
   * 
   * Property 6 from Design: Loading Tracker Integration
   * ∀ component instances where trackLoading = true: 
   * - Resource is registered on mount
   * - Resource is marked complete on iframe load OR error OR unmount
   * 
   * ∀ component instances where trackLoading = false:
   * - Context methods are never called
   * 
   * Validates that the trackLoading boolean prop correctly controls whether
   * the component interacts with LoadingTrackerContext.
   */
  it('property: trackLoading boolean correctly enables/disables context', () => {
    // Arbitrary generator for boolean values
    const booleanArbitrary = fc.boolean();

    // Use a fixed valid YouTube URL for testing
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    fc.assert(
      fc.property(booleanArbitrary, (trackLoading) => {
        // Create mock context with spy functions
        const mockContext = {
          registerResource: vi.fn(),
          markResourceComplete: vi.fn()
        };

        // Render component with generated trackLoading value
        const { unmount } = render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={testUrl} trackLoading={trackLoading} />
          </LoadingTrackerContext.Provider>
        );

        if (trackLoading) {
          // Property 1: When trackLoading is true, registerResource should be called
          expect(mockContext.registerResource).toHaveBeenCalledTimes(1);
          expect(mockContext.registerResource).toHaveBeenCalledWith(
            expect.stringMatching(/^youtube-dQw4w9WgXcQ-/)
          );
        } else {
          // Property 2: When trackLoading is false, registerResource should NOT be called
          expect(mockContext.registerResource).not.toHaveBeenCalled();
        }

        // Unmount the component
        unmount();

        if (trackLoading) {
          // Property 3: When trackLoading is true, markResourceComplete should be called on unmount
          // (since iframe hasn't loaded in this test)
          expect(mockContext.markResourceComplete).toHaveBeenCalled();
        } else {
          // Property 4: When trackLoading is false, markResourceComplete should NOT be called
          expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
        }

        // Clean up for next iteration
        cleanup();
      }),
      { numRuns: 50 } // Run 50 test cases (approximately 25 true, 25 false)
    );
  });

  /**
   * Property Test: Idempotency - same props produce same output
   * **Validates: Requirements 1.1, 1.3, 1.4**
   * 
   * Property 9 from Design: Idempotency
   * ∀ component instances with same props: Multiple renders with identical props produce identical iframe elements
   * 
   * Validates that rendering the component multiple times with the same props produces
   * consistent output. The iframe src, width, height, and title should be identical across renders.
   */
  it('property: idempotency - same props produce same output', () => {
    // Mock context to prevent context-related errors
    const mockContext = {
      registerResource: vi.fn(),
      markResourceComplete: vi.fn()
    };

    // Arbitrary generator for valid YouTube video IDs
    const videoIdArbitrary = fc.array(
      fc.constantFrom(
        ...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')
      ),
      { minLength: 11, maxLength: 11 }
    ).map(chars => chars.join(''));

    // Arbitrary generator for dimensions
    const dimensionArbitrary = fc.integer({ min: 100, max: 1000 });

    // Arbitrary generator for title
    const titleArbitrary = fc.string({ minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(
        videoIdArbitrary,
        dimensionArbitrary,
        dimensionArbitrary,
        titleArbitrary,
        (videoId, width, height, title) => {
          // Construct URL
          const url = `https://www.youtube.com/watch?v=${videoId}`;

          // First render
          const { container: container1 } = render(
            <LoadingTrackerContext.Provider value={mockContext}>
              <YouTubeVideo url={url} width={width} height={height} title={title} />
            </LoadingTrackerContext.Provider>
          );

          const iframe1 = container1.querySelector('iframe');
          const src1 = iframe1.src;
          const width1 = iframe1.getAttribute('width');
          const height1 = iframe1.getAttribute('height');
          const title1 = iframe1.getAttribute('title');
          const allow1 = iframe1.getAttribute('allow');
          const allowFullScreen1 = iframe1.allowFullscreen;
          const frameBorder1 = iframe1.getAttribute('frameborder');

          cleanup();

          // Second render with identical props
          const { container: container2 } = render(
            <LoadingTrackerContext.Provider value={mockContext}>
              <YouTubeVideo url={url} width={width} height={height} title={title} />
            </LoadingTrackerContext.Provider>
          );

          const iframe2 = container2.querySelector('iframe');
          const src2 = iframe2.src;
          const width2 = iframe2.getAttribute('width');
          const height2 = iframe2.getAttribute('height');
          const title2 = iframe2.getAttribute('title');
          const allow2 = iframe2.getAttribute('allow');
          const allowFullScreen2 = iframe2.allowFullscreen;
          const frameBorder2 = iframe2.getAttribute('frameborder');

          // Property 1: iframe src is identical across renders
          expect(src1).toBe(src2);
          expect(src1).toBe(`https://www.youtube.com/embed/${videoId}`);

          // Property 2: iframe width is identical across renders
          expect(width1).toBe(width2);
          expect(width1).toBe(String(width));

          // Property 3: iframe height is identical across renders
          expect(height1).toBe(height2);
          expect(height1).toBe(String(height));

          // Property 4: iframe title is identical across renders
          expect(title1).toBe(title2);
          expect(title1).toBe(title);

          // Property 5: iframe allow attribute is identical across renders
          expect(allow1).toBe(allow2);

          // Property 6: iframe allowFullScreen is identical across renders
          expect(allowFullScreen1).toBe(allowFullScreen2);

          // Property 7: iframe frameBorder is identical across renders
          expect(frameBorder1).toBe(frameBorder2);

          // Clean up for next iteration
          cleanup();
        }
      ),
      { numRuns: 100 } // Run 100 random test cases
    );
  });
});

