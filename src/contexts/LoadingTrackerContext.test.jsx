import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useContext } from 'react';
import { LoadingTrackerContext, LoadingTrackerProvider } from './LoadingTrackerContext';

describe('LoadingTrackerContext', () => {
  // Helper to render hook with provider
  const renderWithProvider = () => {
    return renderHook(() => useContext(LoadingTrackerContext), {
      wrapper: LoadingTrackerProvider
    });
  };

  describe('Resource Registration', () => {
    it('should register a resource and set isLoading to true', () => {
      const { result } = renderWithProvider();

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.registerResource('resource-1');
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should register multiple resources', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
        result.current.registerResource('resource-2');
        result.current.registerResource('resource-3');
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should handle duplicate registrations without issues', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
        result.current.registerResource('resource-1');
        result.current.registerResource('resource-1');
      });

      expect(result.current.isLoading).toBe(true);

      // Should only need to complete once
      act(() => {
        result.current.markResourceComplete('resource-1');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Resource Completion', () => {
    it('should mark a resource as complete and update isLoading', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('resource-1');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle completion of non-existent resources without errors', () => {
      const { result } = renderWithProvider();

      expect(() => {
        act(() => {
          result.current.markResourceComplete('non-existent-resource');
        });
      }).not.toThrow();

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle multiple completions of the same resource', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
      });

      expect(() => {
        act(() => {
          result.current.markResourceComplete('resource-1');
          result.current.markResourceComplete('resource-1');
          result.current.markResourceComplete('resource-1');
        });
      }).not.toThrow();

      expect(result.current.isLoading).toBe(false);
    });

    it('should only set isLoading to false when all resources are complete', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
        result.current.registerResource('resource-2');
        result.current.registerResource('resource-3');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('resource-1');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('resource-2');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('resource-3');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Loading State Calculation', () => {
    it('should start with isLoading as false', () => {
      const { result } = renderWithProvider();

      expect(result.current.isLoading).toBe(false);
    });

    it('should maintain invariant: isLoading = (pendingResources.size > 0)', () => {
      const { result } = renderWithProvider();

      // No resources: isLoading should be false
      expect(result.current.isLoading).toBe(false);

      // Add resource: isLoading should be true
      act(() => {
        result.current.registerResource('resource-1');
      });
      expect(result.current.isLoading).toBe(true);

      // Add more resources: isLoading should remain true
      act(() => {
        result.current.registerResource('resource-2');
      });
      expect(result.current.isLoading).toBe(true);

      // Remove one resource: isLoading should remain true
      act(() => {
        result.current.markResourceComplete('resource-1');
      });
      expect(result.current.isLoading).toBe(true);

      // Remove last resource: isLoading should be false
      act(() => {
        result.current.markResourceComplete('resource-2');
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle rapid register/complete cycles', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('resource-1');
        result.current.markResourceComplete('resource-1');
      });

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.registerResource('resource-2');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('resource-2');
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Context API', () => {
    it('should provide registerResource function', () => {
      const { result } = renderWithProvider();

      expect(result.current.registerResource).toBeDefined();
      expect(typeof result.current.registerResource).toBe('function');
    });

    it('should provide markResourceComplete function', () => {
      const { result } = renderWithProvider();

      expect(result.current.markResourceComplete).toBeDefined();
      expect(typeof result.current.markResourceComplete).toBe('function');
    });

    it('should provide isLoading boolean', () => {
      const { result } = renderWithProvider();

      expect(result.current.isLoading).toBeDefined();
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string resource IDs', () => {
      const { result } = renderWithProvider();

      act(() => {
        result.current.registerResource('');
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete('');
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle special characters in resource IDs', () => {
      const { result } = renderWithProvider();

      const specialIds = [
        'resource-with-dashes',
        'resource_with_underscores',
        'resource.with.dots',
        'resource/with/slashes',
        'resource@with#special$chars'
      ];

      act(() => {
        specialIds.forEach(id => result.current.registerResource(id));
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        specialIds.forEach(id => result.current.markResourceComplete(id));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle very long resource IDs', () => {
      const { result } = renderWithProvider();

      const longId = 'a'.repeat(1000);

      act(() => {
        result.current.registerResource(longId);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.markResourceComplete(longId);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
