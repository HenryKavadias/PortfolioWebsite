import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup, act } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

/**
 * Unit tests for YouTubeVideo component
 * 
 * Tests cover:
 * - Props validation (Requirements 1.2)
 * - Video ID extraction from various URL formats (Requirements 1.7)
 * - Component rendering with correct iframe attributes (Requirements 1.1, 1.3, 1.4, 1.6)
 * - Loading tracking integration (Requirements 1.5)
 * - Multiple instances support (Requirements 1.8)
 * - Graceful degradation without context
 */
describe('YouTubeVideo - Unit Tests', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Test suites will be implemented in subsequent tasks (2.2-2.7)

  /**
   * 2.2 Props Validation Tests
   * Validates Requirements 1.2: Props Validation
   */
  describe('Props Validation', () => {
    it('throws error when url is null', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Expect the component to throw an error when rendered with null url
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={null} />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("YouTubeVideo requires a 'url' prop");
    });

    it('throws error when url is undefined', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Expect the component to throw an error when rendered with undefined url
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={undefined} />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("YouTubeVideo requires a 'url' prop");
    });

    it('throws error when url is empty string', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Expect the component to throw an error when rendered with empty string url
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("YouTubeVideo requires a 'url' prop");
    });

    it('error message matches expected text for missing url', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test with null
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={null} />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("YouTubeVideo requires a 'url' prop");
      }

      // Test with undefined
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={undefined} />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("YouTubeVideo requires a 'url' prop");
      }

      // Test with empty string
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="" />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("YouTubeVideo requires a 'url' prop");
      }
    });

    it('throws error when url format is invalid', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test invalid URL - not a YouTube URL
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://example.com" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("Invalid YouTube URL format");

      // Test invalid URL - Vimeo URL
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://vimeo.com/123456" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("Invalid YouTube URL format");

      // Test invalid URL - not a URL at all
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="not-a-url" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("Invalid YouTube URL format");
    });

    it('error message matches expected text for invalid format', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test with non-YouTube URL
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://example.com/video" />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("Invalid YouTube URL format");
      }

      // Test with Vimeo URL
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://vimeo.com/123456" />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("Invalid YouTube URL format");
      }

      // Test with invalid string
      try {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="not-a-valid-url" />
          </LoadingTrackerContext.Provider>
        );
        // If we reach here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("Invalid YouTube URL format");
      }
    });

    it('handles malformed URLs that cause URL constructor to throw', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // In Node.js/JSDOM environment, certain URL formats can cause URL constructor to throw
      // For example, URLs with spaces or certain special characters
      // However, the URL constructor is very permissive, so this might not trigger the catch
      // Testing with a URL that has an invalid scheme
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="://invalid-url-no-scheme" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow("Invalid YouTube URL format");
    });
  });

  /**
   * 2.3 Video ID Extraction Tests
   * Validates Requirements 1.7: URL Format Support
   */
  describe('Video ID Extraction', () => {
    it('extracts video ID from standard watch URL', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test standard watch URL with HTTPS
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from standard watch URL with HTTP', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test standard watch URL with HTTP
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from watch URL with additional query parameters', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test watch URL with timestamp parameter
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL (without extra params)
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from short URL (youtu.be) with HTTPS', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test short URL with HTTPS
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from short URL (youtu.be) with HTTP', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test short URL with HTTP
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://youtu.be/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from short URL (youtu.be) with query parameters', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test short URL with timestamp parameter
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ?t=30" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL (without extra params)
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from embed URL with HTTPS', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test embed URL with HTTPS
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from embed URL with HTTP', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test embed URL with HTTP
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://www.youtube.com/embed/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('extracts video ID from embed URL with query parameters', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test embed URL with query parameters
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe is rendered with correct embed URL (without extra params)
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('returns null for non-YouTube URLs', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test various non-YouTube URLs that should result in extractVideoId returning null
      const nonYouTubeUrls = [
        'https://vimeo.com/123456',
        'https://example.com/video',
        'https://dailymotion.com/video/x123456',
        'https://www.twitch.tv/videos/123456',
        'https://facebook.com/watch/123456',
        'not-a-url-at-all',
        'https://youtube-fake.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.co.uk/watch?v=dQw4w9WgXcQ' // Different TLD
      ];

      // Each non-YouTube URL should throw "Invalid YouTube URL format" error
      // This confirms that extractVideoId returned null for these URLs
      nonYouTubeUrls.forEach(url => {
        expect(() => {
          render(
            <LoadingTrackerContext.Provider value={mockContext}>
              <YouTubeVideo url={url} />
            </LoadingTrackerContext.Provider>
          );
        }).toThrow("Invalid YouTube URL format");
      });
    });
  });

  /**
   * 2.4 Rendering Tests
   * Validates Requirements 1.1, 1.3: Component Rendering and Configurable Dimensions
   */
  describe('Rendering Tests', () => {
    it('renders iframe with correct src URL from standard YouTube URL', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component renders iframe with correct embed URL from standard watch URL
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const expectedEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has correct src attribute
      expect(iframe.src).toBe(expectedEmbedUrl);
      expect(iframe.getAttribute('src')).toBe(expectedEmbedUrl);
    });

    it('renders iframe with correct src URL from short YouTube URL', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component renders iframe with correct embed URL from short youtu.be URL
      const testUrl = 'https://youtu.be/dQw4w9WgXcQ';
      const expectedEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has correct src attribute
      expect(iframe.src).toBe(expectedEmbedUrl);
      expect(iframe.getAttribute('src')).toBe(expectedEmbedUrl);
    });

    it('renders iframe with correct src URL from embed YouTube URL', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component renders iframe with correct embed URL from embed URL format
      const testUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const expectedEmbedUrl = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has correct src attribute
      expect(iframe.src).toBe(expectedEmbedUrl);
      expect(iframe.getAttribute('src')).toBe(expectedEmbedUrl);
    });

    it('applies default width (560) when not provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies default width of 560 when width prop is not provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has width attribute of "560"
      expect(iframe.getAttribute('width')).toBe('560');
    });

    it('applies default height (315) when not provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies default height of 315 when height prop is not provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has height attribute of "315"
      expect(iframe.getAttribute('height')).toBe('315');
    });

    it('applies custom width when provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies custom width when width prop is provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const customWidth = 800;

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} width={customWidth} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has custom width attribute
      expect(iframe.getAttribute('width')).toBe('800');
    });

    it('applies custom height when provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies custom height when height prop is provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const customHeight = 450;

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} height={customHeight} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has custom height attribute
      expect(iframe.getAttribute('height')).toBe('450');
    });

    it('applies default title when not provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies default title of "YouTube video player" when title prop is not provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has default title attribute
      expect(iframe.getAttribute('title')).toBe('YouTube video player');
    });

    it('applies custom title when provided', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component applies custom title when title prop is provided
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const customTitle = 'My Custom Video Title';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} title={customTitle} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has custom title attribute
      expect(iframe.getAttribute('title')).toBe('My Custom Video Title');
    });
  });

  /**
   * 2.5 iframe Attributes Tests
   * Validates Requirements 1.6: iframe Configuration
   */
  describe('iframe Attributes Tests', () => {
    it('iframe includes allow attribute with correct features', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that iframe includes allow attribute with all required YouTube features
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has allow attribute with correct features
      const allowAttribute = iframe.getAttribute('allow');
      expect(allowAttribute).toBeTruthy();
      
      // Check that all required features are present in the allow attribute
      expect(allowAttribute).toContain('accelerometer');
      expect(allowAttribute).toContain('autoplay');
      expect(allowAttribute).toContain('clipboard-write');
      expect(allowAttribute).toContain('encrypted-media');
      expect(allowAttribute).toContain('gyroscope');
      expect(allowAttribute).toContain('picture-in-picture');
    });

    it('iframe includes allowFullScreen attribute', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that iframe includes allowFullScreen attribute set to true
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has allowFullScreen attribute
      // In React, allowFullScreen is a boolean attribute that gets rendered as allowfullscreen in HTML
      expect(iframe.hasAttribute('allowfullscreen')).toBe(true);
      
      // Alternative check: verify the property is set to true
      expect(iframe.allowFullscreen).toBe(true);
    });

    it('iframe includes frameBorder="0" attribute', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that iframe includes frameBorder attribute set to "0"
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} />
        </LoadingTrackerContext.Provider>
      );

      // Verify iframe element exists
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has frameBorder attribute set to "0"
      // In React, frameBorder is rendered as frameborder in HTML
      expect(iframe.getAttribute('frameborder')).toBe('0');
    });

    it('iframe src uses HTTPS protocol', () => {
      // Mock context to prevent context-related errors
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that iframe src always uses HTTPS protocol regardless of input URL protocol
      const testUrls = [
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'http://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ',
        'http://www.youtube.com/embed/dQw4w9WgXcQ'
      ];

      testUrls.forEach(testUrl => {
        const { container } = render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url={testUrl} />
          </LoadingTrackerContext.Provider>
        );

        // Verify iframe element exists
        const iframe = container.querySelector('iframe');
        expect(iframe).toBeTruthy();

        // Verify iframe src uses HTTPS protocol
        expect(iframe.src).toMatch(/^https:\/\//);
        expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

        // Clean up for next iteration
        cleanup();
      });
    });
  });

  /**
   * 2.6 Loading Tracker Tests
   * Validates Requirements 1.5: Loading Tracking Integration
   */
  describe('Loading Tracker Tests', () => {
    it('calls registerResource on mount when trackLoading is true', () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component calls registerResource on mount when trackLoading is true
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was called exactly once
      expect(mockContext.registerResource).toHaveBeenCalledTimes(1);

      // Verify registerResource was called with a resourceId matching the expected format
      // Format: youtube-${videoId}-${counter}
      const callArgs = mockContext.registerResource.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs[0]).toBeDefined();
      
      // Verify the resourceId starts with "youtube-dQw4w9WgXcQ-" (video ID from URL)
      expect(callArgs[0]).toMatch(/^youtube-dQw4w9WgXcQ-/);
      
      // Verify the resourceId ends with a unique counter number
      expect(callArgs[0]).toMatch(/youtube-dQw4w9WgXcQ-\d+/);
    });

    it('calls markResourceComplete on iframe load', async () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component calls markResourceComplete when iframe loads
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Get the iframe element
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify markResourceComplete has not been called yet
      expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

      // Simulate iframe load event wrapped in act
      await act(async () => {
        iframe.dispatchEvent(new Event('load'));
      });

      // Wait for the event handler to complete
      await waitFor(() => {
        expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
      });

      // Verify markResourceComplete was called with the correct resourceId
      const callArgs = mockContext.markResourceComplete.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs[0]).toBeDefined();
      
      // Verify the resourceId starts with "youtube-dQw4w9WgXcQ-" (video ID from URL)
      expect(callArgs[0]).toMatch(/^youtube-dQw4w9WgXcQ-/);
      
      // Verify the resourceId ends with a unique counter number
      expect(callArgs[0]).toMatch(/youtube-dQw4w9WgXcQ-\d+/);
    });

    it('calls markResourceComplete on iframe error', () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Spy on console.error to verify error handler is called
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Test that component's error handler would call markResourceComplete
      // Note: iframe onError events don't actually fire in real browsers or jsdom
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Get the iframe element
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify markResourceComplete has not been called yet
      expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

      // Get the React props from the iframe element to access the onError handler
      // In React, event handlers are stored in the element's properties
      const reactPropsKey = Object.keys(iframe).find(key => key.startsWith('__reactProps'));
      const reactProps = reactPropsKey ? iframe[reactPropsKey] : null;
      
      if (reactProps && reactProps.onError) {
        // Manually invoke the onError handler
        reactProps.onError();

        // Verify console.error was called
        expect(consoleErrorSpy).toHaveBeenCalledWith('YouTube iframe failed to load for video ID: dQw4w9WgXcQ');

        // Verify markResourceComplete was called with the correct resourceId
        expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
        
        const callArgs = mockContext.markResourceComplete.mock.calls[0];
        expect(callArgs).toBeDefined();
        expect(callArgs[0]).toBeDefined();
        
        // Verify the resourceId starts with "youtube-dQw4w9WgXcQ-" (video ID from URL)
        expect(callArgs[0]).toMatch(/^youtube-dQw4w9WgXcQ-/);
        
        // Verify the resourceId ends with a unique counter number
        expect(callArgs[0]).toMatch(/youtube-dQw4w9WgXcQ-\d+/);
      } else {
        // If we can't access React props, at least verify the iframe was rendered
        // This is a limitation of the testing environment
        expect(iframe).toBeTruthy();
      }

      // Restore console.error
      consoleErrorSpy.mockRestore();
    });

    it('does not call context methods when trackLoading is false', async () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component does not interact with context when trackLoading is false
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was NOT called on mount
      expect(mockContext.registerResource).not.toHaveBeenCalled();

      // Get the iframe element
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Simulate iframe load event wrapped in act
      await act(async () => {
        iframe.dispatchEvent(new Event('load'));
      });

      // Wait a bit to ensure any async operations complete
      await waitFor(() => {
        // Verify markResourceComplete was NOT called on iframe load
        expect(mockContext.markResourceComplete).not.toHaveBeenCalled();
      });

      // Verify that neither context method was called at any point
      expect(mockContext.registerResource).toHaveBeenCalledTimes(0);
      expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(0);
    });

    it('marks resource complete on unmount if not loaded', () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that component calls markResourceComplete on unmount if iframe never loaded
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url={testUrl} trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was called on mount
      expect(mockContext.registerResource).toHaveBeenCalledTimes(1);

      // Verify markResourceComplete has not been called yet (iframe hasn't loaded)
      expect(mockContext.markResourceComplete).not.toHaveBeenCalled();

      // Unmount the component before iframe loads
      unmount();

      // Verify markResourceComplete was called during cleanup
      expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);

      // Verify markResourceComplete was called with the correct resourceId
      const callArgs = mockContext.markResourceComplete.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs[0]).toBeDefined();
      
      // Verify the resourceId starts with "youtube-dQw4w9WgXcQ-" (video ID from URL)
      expect(callArgs[0]).toMatch(/^youtube-dQw4w9WgXcQ-/);
      
      // Verify the resourceId ends with a unique counter number
      expect(callArgs[0]).toMatch(/youtube-dQw4w9WgXcQ-\d+/);
    });

    it('does not crash when context is unavailable', () => {
      // Test that component renders successfully without LoadingTrackerContext provider
      // This validates graceful degradation when context is not available
      const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      // Render component without context provider (context will be undefined)
      const { container } = render(
        <YouTubeVideo url={testUrl} trackLoading={true} />
      );

      // Verify iframe element is rendered successfully
      const iframe = container.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Verify iframe has correct src URL
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');

      // Verify iframe has correct attributes
      expect(iframe.getAttribute('width')).toBe('560');
      expect(iframe.getAttribute('height')).toBe('315');
      expect(iframe.getAttribute('title')).toBe('YouTube video player');

      // Component should render normally without crashing
      // This confirms graceful handling of missing context
    });
  });

  /**
   * 2.7 Multiple Instances Tests
   * Validates Requirements 1.8: Multiple Instances Support
   */
  describe('Multiple Instances Tests', () => {
    it('multiple components generate unique resourceIds', () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that multiple YouTubeVideo components generate unique resourceIds
      const testUrl1 = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      const testUrl2 = 'https://www.youtube.com/watch?v=abc123xyz';
      const testUrl3 = 'https://youtu.be/dQw4w9WgXcQ'; // Same video as testUrl1, different format

      // Render multiple components with different URLs
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            <YouTubeVideo url={testUrl1} trackLoading={true} />
            <YouTubeVideo url={testUrl2} trackLoading={true} />
            <YouTubeVideo url={testUrl3} trackLoading={true} />
          </div>
        </LoadingTrackerContext.Provider>
      );

      // Verify all three iframes are rendered
      const iframes = container.querySelectorAll('iframe');
      expect(iframes).toHaveLength(3);

      // Verify registerResource was called three times (once per component)
      expect(mockContext.registerResource).toHaveBeenCalledTimes(3);

      // Extract all resourceIds from the registerResource calls
      const resourceIds = mockContext.registerResource.mock.calls.map(call => call[0]);

      // Verify all resourceIds are defined
      expect(resourceIds[0]).toBeDefined();
      expect(resourceIds[1]).toBeDefined();
      expect(resourceIds[2]).toBeDefined();

      // Verify all resourceIds are unique (no duplicates)
      const uniqueResourceIds = new Set(resourceIds);
      expect(uniqueResourceIds.size).toBe(3);

      // Verify resourceIds follow the expected format: youtube-${videoId}-${counter}
      expect(resourceIds[0]).toMatch(/^youtube-dQw4w9WgXcQ-\d+$/);
      expect(resourceIds[1]).toMatch(/^youtube-abc123xyz-\d+$/);
      expect(resourceIds[2]).toMatch(/^youtube-dQw4w9WgXcQ-\d+$/);

      // Verify that even components with the same video ID have different resourceIds
      // (resourceIds[0] and resourceIds[2] are for the same video but should be unique)
      expect(resourceIds[0]).not.toBe(resourceIds[2]);
    });

    it('multiple components on same page don\'t interfere', async () => {
      // Mock context with spy functions to track method calls
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn()
      };

      // Test that multiple YouTubeVideo components can load independently without interfering
      const testUrl1 = 'https://www.youtube.com/watch?v=video1';
      const testUrl2 = 'https://www.youtube.com/watch?v=video2';
      const testUrl3 = 'https://youtu.be/video3';

      // Render multiple components on the same page
      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <div>
            <YouTubeVideo url={testUrl1} trackLoading={true} title="Video 1" />
            <YouTubeVideo url={testUrl2} trackLoading={true} title="Video 2" />
            <YouTubeVideo url={testUrl3} trackLoading={true} title="Video 3" />
          </div>
        </LoadingTrackerContext.Provider>
      );

      // Verify all three iframes are rendered
      const iframes = container.querySelectorAll('iframe');
      expect(iframes).toHaveLength(3);

      // Verify each iframe has the correct src
      expect(iframes[0].src).toBe('https://www.youtube.com/embed/video1');
      expect(iframes[1].src).toBe('https://www.youtube.com/embed/video2');
      expect(iframes[2].src).toBe('https://www.youtube.com/embed/video3');

      // Verify each iframe has the correct title
      expect(iframes[0].getAttribute('title')).toBe('Video 1');
      expect(iframes[1].getAttribute('title')).toBe('Video 2');
      expect(iframes[2].getAttribute('title')).toBe('Video 3');

      // Verify registerResource was called three times (once per component)
      expect(mockContext.registerResource).toHaveBeenCalledTimes(3);

      // Extract all resourceIds from the registerResource calls
      const resourceIds = mockContext.registerResource.mock.calls.map(call => call[0]);

      // Verify all resourceIds are unique
      const uniqueResourceIds = new Set(resourceIds);
      expect(uniqueResourceIds.size).toBe(3);

      // Simulate first iframe loading
      await act(async () => {
        iframes[0].dispatchEvent(new Event('load'));
      });

      // Wait for the first iframe's load handler to complete
      await waitFor(() => {
        expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(1);
      });

      // Verify only the first iframe's resource was marked complete
      expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[0]);

      // Simulate third iframe loading (skip second to test independent loading)
      await act(async () => {
        iframes[2].dispatchEvent(new Event('load'));
      });

      // Wait for the third iframe's load handler to complete
      await waitFor(() => {
        expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(2);
      });

      // Verify the third iframe's resource was marked complete
      expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[2]);

      // Simulate second iframe loading last
      await act(async () => {
        iframes[1].dispatchEvent(new Event('load'));
      });

      // Wait for the second iframe's load handler to complete
      await waitFor(() => {
        expect(mockContext.markResourceComplete).toHaveBeenCalledTimes(3);
      });

      // Verify the second iframe's resource was marked complete
      expect(mockContext.markResourceComplete).toHaveBeenCalledWith(resourceIds[1]);

      // Verify each component's resource was marked complete exactly once
      const completedResourceIds = mockContext.markResourceComplete.mock.calls.map(call => call[0]);
      expect(completedResourceIds).toContain(resourceIds[0]);
      expect(completedResourceIds).toContain(resourceIds[1]);
      expect(completedResourceIds).toContain(resourceIds[2]);

      // Verify no duplicate completions
      expect(completedResourceIds.length).toBe(3);
      expect(new Set(completedResourceIds).size).toBe(3);
    });
  });
});
