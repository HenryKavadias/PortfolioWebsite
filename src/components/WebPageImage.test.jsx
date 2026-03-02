import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup, fireEvent } from '@testing-library/react';
import WebPageImage from './WebPageImage';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';

/**
 * Unit tests for WebPageImage component with loading tracking integration
 * 
 * Tests cover:
 * - Resource registration on mount (Requirement 2.3)
 * - Completion on image load (Requirement 2.4)
 * - Completion on image error (Requirement 3.2)
 * - Completion on unmount (Requirement 4.1)
 * - trackLoading prop behavior (Requirement 8.2, 8.3)
 * - Graceful degradation without context (Requirement 9.2)
 */
describe('WebPageImage - Unit Tests', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Resource registration on mount (Requirement 2.3)', () => {
    it('should register resource with LoadingTracker on mount when trackLoading is true', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" trackLoading={true} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was called
      expect(registerResource).toHaveBeenCalledTimes(1);
      
      // Verify resource ID format includes 'img-' prefix and src
      const resourceId = registerResource.mock.calls[0][0];
      expect(resourceId).toMatch(/^img-\/test\/image\.png-/);
    });

    it('should register resource with default trackLoading (true)', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      // Should register by default
      expect(registerResource).toHaveBeenCalledTimes(1);
    });

    it('should generate stable resource ID across re-renders', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { rerender } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" size={400} />
        </LoadingTrackerContext.Provider>
      );

      const firstResourceId = registerResource.mock.calls[0][0];

      // Re-render with different size (but same src)
      rerender(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" size={600} />
        </LoadingTrackerContext.Provider>
      );

      // Resource ID should remain stable (only registered once)
      expect(registerResource).toHaveBeenCalledTimes(1);
      expect(registerResource.mock.calls[0][0]).toBe(firstResourceId);
    });
  });

  describe('Completion on image load (Requirement 2.4)', () => {
    it('should mark resource complete when image loads successfully', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test Image" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image load
      fireEvent.load(img);

      // Verify markResourceComplete was called
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify it was called with the same resource ID that was registered
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);
    });

    it('should render image with correct attributes', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage 
            src="/test/image.png" 
            alt="Test Image" 
            size={400}
            padding={20}
          />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      expect(img).toBeTruthy();
      expect(img.src).toContain('/test/image.png');
      expect(img.alt).toBe('Test Image');
      expect(img.className).toBe('web-link-image');
      expect(img.style.maxWidth).toBe('400px');
      expect(img.style.padding).toBe('20px');
    });

    it('should apply fixedSize style when fixedSize prop is true', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage 
            src="/test/image.png" 
            alt="Test" 
            size={300}
            fixedSize={true}
          />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      expect(img.style.width).toBe('300px');
      expect(img.style.height).toBe('300px');
    });

    it('should apply responsive style when fixedSize prop is false', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage 
            src="/test/image.png" 
            alt="Test" 
            size={300}
            fixedSize={false}
          />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      expect(img.style.maxWidth).toBe('300px');
      expect(img.style.height).toBe('auto');
    });
  });

  describe('Completion on image error (Requirement 3.2)', () => {
    it('should mark resource complete when image fails to load', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/missing.png" alt="Missing" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image error
      fireEvent.error(img);

      // Verify markResourceComplete was called even on error
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify same resource ID
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);
    });

    it('should still render img element when error occurs', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/missing.png" alt="Missing Image" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate error
      fireEvent.error(img);

      // Image element should still be present
      expect(img).toBeTruthy();
      expect(img.src).toContain('/test/missing.png');
      expect(img.alt).toBe('Missing Image');
    });
  });

  describe('Completion on unmount (Requirement 4.1)', () => {
    it('should mark resource complete when component unmounts before image loads', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      // Verify registration happened
      expect(registerResource).toHaveBeenCalledTimes(1);
      
      // Unmount before image loads
      unmount();

      // Verify cleanup called markResourceComplete
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
      
      // Verify same resource ID
      const registeredId = registerResource.mock.calls[0][0];
      const completedId = markResourceComplete.mock.calls[0][0];
      expect(completedId).toBe(registeredId);
    });

    it('should not call markResourceComplete on unmount if image already loaded', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container, unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image load
      fireEvent.load(img);

      // markResourceComplete called once after load
      expect(markResourceComplete).toHaveBeenCalledTimes(1);

      // Unmount
      unmount();

      // markResourceComplete should still be called only once (not again on cleanup)
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call markResourceComplete on unmount if image errored', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container, unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/missing.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image error
      fireEvent.error(img);

      // markResourceComplete called once after error
      expect(markResourceComplete).toHaveBeenCalledTimes(1);

      // Unmount
      unmount();

      // markResourceComplete should still be called only once (not again on cleanup)
      expect(markResourceComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('trackLoading prop behavior (Requirements 8.2, 8.3)', () => {
    it('should not register resource when trackLoading is false', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Verify registerResource was NOT called
      expect(registerResource).not.toHaveBeenCalled();
    });

    it('should not mark complete on load when trackLoading is false', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image load
      fireEvent.load(img);

      // Verify markResourceComplete was NOT called
      expect(markResourceComplete).not.toHaveBeenCalled();
    });

    it('should not mark complete on error when trackLoading is false', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/missing.png" alt="Test" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Simulate image error
      fireEvent.error(img);

      // Verify markResourceComplete was NOT called
      expect(markResourceComplete).not.toHaveBeenCalled();
    });

    it('should still render image normally when trackLoading is false', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage 
            src="/test/image.png" 
            alt="Untracked Image" 
            trackLoading={false}
            size={500}
          />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      
      // Image should still render normally
      expect(img).toBeTruthy();
      expect(img.src).toContain('/test/image.png');
      expect(img.alt).toBe('Untracked Image');
      expect(img.style.maxWidth).toBe('500px');
    });

    it('should not call markResourceComplete on unmount when trackLoading is false', () => {
      const registerResource = vi.fn();
      const markResourceComplete = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete,
        isLoading: true
      };

      const { unmount } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" trackLoading={false} />
        </LoadingTrackerContext.Provider>
      );

      // Unmount
      unmount();

      // Verify markResourceComplete was never called
      expect(markResourceComplete).not.toHaveBeenCalled();
    });
  });

  describe('Graceful degradation without context (Requirement 9.2)', () => {
    it('should render normally when LoadingTrackerContext is not provided', () => {
      const { container } = render(
        <WebPageImage src="/test/image.png" alt="Standalone" />
      );

      const img = container.querySelector('img');
      
      // Should render without crashing
      expect(img).toBeTruthy();
      expect(img.src).toContain('/test/image.png');
      expect(img.alt).toBe('Standalone');
    });

    it('should handle image load without context', () => {
      const { container } = render(
        <WebPageImage src="/test/image.png" alt="Test" />
      );

      const img = container.querySelector('img');
      
      // Should not crash when load event fires
      expect(() => {
        fireEvent.load(img);
      }).not.toThrow();
    });

    it('should handle image error without context', () => {
      const { container } = render(
        <WebPageImage src="/test/missing.png" alt="Test" />
      );

      const img = container.querySelector('img');
      
      // Should not crash when error event fires
      expect(() => {
        fireEvent.error(img);
      }).not.toThrow();
    });

    it('should not crash on unmount without context', () => {
      const { unmount } = render(
        <WebPageImage src="/test/image.png" alt="Test" />
      );

      // Should not crash on unmount
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('should work with trackLoading=true even without context', () => {
      const { container } = render(
        <WebPageImage src="/test/image.png" alt="Test" trackLoading={true} />
      );

      const img = container.querySelector('img');
      
      // Should still work normally
      expect(img).toBeTruthy();
      
      // Should not crash on load
      expect(() => {
        fireEvent.load(img);
      }).not.toThrow();
    });
  });

  describe('Resource identifier format (Requirement 10.4)', () => {
    it('should generate resource ID with img prefix and src', () => {
      const registerResource = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/images/Purger/PurgerIcon.png" alt="Purger" />
        </LoadingTrackerContext.Provider>
      );

      expect(registerResource).toHaveBeenCalledTimes(1);
      
      const resourceId = registerResource.mock.calls[0][0];
      
      // Should start with 'img-'
      expect(resourceId).toMatch(/^img-/);
      
      // Should include the src
      expect(resourceId).toContain('/images/Purger/PurgerIcon.png');
      
      // Should have a random component for uniqueness
      expect(resourceId).toMatch(/^img-\/images\/Purger\/PurgerIcon\.png-0\.\d+$/);
    });

    it('should generate unique IDs for different instances of same src', () => {
      const registerResource = vi.fn();
      
      const mockContext = {
        registerResource,
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      // Render two instances with same src
      const { unmount: unmount1 } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="First" />
        </LoadingTrackerContext.Provider>
      );

      const firstId = registerResource.mock.calls[0][0];

      unmount1();
      registerResource.mockClear();

      const { unmount: unmount2 } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Second" />
        </LoadingTrackerContext.Provider>
      );

      const secondId = registerResource.mock.calls[0][0];

      // IDs should be different (due to random component)
      expect(firstId).not.toBe(secondId);
      
      // But both should have same prefix and src
      expect(firstId).toMatch(/^img-\/test\/image\.png-/);
      expect(secondId).toMatch(/^img-\/test\/image\.png-/);

      unmount2();
    });
  });

  describe('Default prop values', () => {
    it('should use default size of 600', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      expect(img.style.maxWidth).toBe('600px');
    });

    it('should use default padding of 10', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      expect(img.style.padding).toBe('10px');
    });

    it('should use default fixedSize of false', () => {
      const mockContext = {
        registerResource: vi.fn(),
        markResourceComplete: vi.fn(),
        isLoading: true
      };

      const { container } = render(
        <LoadingTrackerContext.Provider value={mockContext}>
          <WebPageImage src="/test/image.png" alt="Test" />
        </LoadingTrackerContext.Provider>
      );

      const img = container.querySelector('img');
      expect(img.style.maxWidth).toBe('600px');
      expect(img.style.height).toBe('auto');
    });
  });
});
