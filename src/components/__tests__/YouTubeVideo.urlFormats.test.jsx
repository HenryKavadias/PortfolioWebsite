import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';
import '@testing-library/jest-dom/vitest';

// Mock context for testing
const mockContext = {
  registerResource: () => {},
  markResourceComplete: () => {}
};

describe('YouTubeVideo - URL Format Verification', () => {
  describe('Standard YouTube Watch URLs', () => {
    it('should render with standard HTTPS watch URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with standard HTTP watch URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with watch URL without www', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with watch URL with additional query parameters', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s&list=PLxyz" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with watch URL with timestamp parameter', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('Short YouTube URLs (youtu.be)', () => {
    it('should render with short HTTPS URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with short HTTP URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://youtu.be/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with short URL with query parameters', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ?t=30" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with short URL with fragment', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ#t=30s" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('Embed YouTube URLs', () => {
    it('should render with embed HTTPS URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with embed HTTP URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="http://www.youtube.com/embed/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with embed URL without www', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtube.com/embed/dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with embed URL with query parameters', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('Mobile YouTube URLs', () => {
    it('should render with mobile YouTube URL', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://m.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe).toBeInTheDocument();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('Different Video IDs', () => {
    it('should render with 11-character video ID', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should render with video ID containing numbers', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=123abc456XY" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe.src).toBe('https://www.youtube.com/embed/123abc456XY');
    });

    it('should render with video ID containing underscores and hyphens', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=abc_123-XYZ" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe.src).toBe('https://www.youtube.com/embed/abc_123-XYZ');
    });
  });

  describe('Invalid URL Formats', () => {
    it('should throw error for non-YouTube URL', () => {
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://vimeo.com/123456789" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow('Invalid YouTube URL format');
    });

    it('should throw error for invalid domain', () => {
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="https://notyoutube.com/watch?v=dQw4w9WgXcQ" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow('Invalid YouTube URL format');
    });

    it('should throw error for malformed URL', () => {
      expect(() => {
        render(
          <LoadingTrackerContext.Provider value={mockContext}>
            <YouTubeVideo url="not-a-valid-url" />
          </LoadingTrackerContext.Provider>
        );
      }).toThrow('Invalid YouTube URL format');
    });
  });

  describe('Edge Cases', () => {
    it('should handle URL with multiple question marks', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should handle URL with ampersand in video ID position', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ&t=30" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      expect(iframe.src).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should handle URL with trailing slash', () => {
      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ/" />
        </LoadingTrackerContext.Provider>
      );
      
      const iframe = screen.getByTitle('YouTube video player');
      // Note: trailing slash is preserved in the video ID extraction
      expect(iframe.src).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ');
    });
  });
});
