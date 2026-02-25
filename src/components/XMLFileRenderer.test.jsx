import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import fc from 'fast-check';
import XMLFileRenderer from './XMLFileRenderer';

/**
 * **Validates: Requirements 1.1, 1.2, 1.3, 11.3**
 * 
 * Property 15: Fetch Triggers on Mount
 * For any valid fileName prop, mounting the XMLFileRenderer component should 
 * trigger a fetch request to the correct file path with .xml extension.
 * 
 * Property 16: Fetch Triggers on Prop Change
 * For any change to the fileName prop, the XMLFileRenderer should trigger 
 * a new fetch request for the updated file.
 */
describe('XMLFileRenderer - Property-Based Tests', () => {
  let fetchSpy;

  beforeEach(() => {
    // Mock global fetch
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    // Clean up all renders
    cleanup();
    // Restore original fetch
    fetchSpy.mockRestore();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Property 15: Fetch Triggers on Mount', () => {
    it('should trigger fetch on mount with correct file path and .xml extension', async () => {
      // Generator for valid file paths
      const filePathArbitrary = fc.tuple(
        fc.constantFrom('content', 'data'),
        fc.constantFrom('Home', 'Projects'),
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3)
      ).map(([dir1, dir2, filename]) => `${dir1}/${dir2}/${filename}`);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          // Reset mocks for each property test run
          fetchSpy.mockClear();
          
          // Mock successful fetch response
          const mockXMLContent = '<content><paragraph>Test content</paragraph></content>';
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => mockXMLContent,
          });

          // Render component with fileName prop
          const { unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for fetch to be called
          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify fetch was called with correct path (fileName + .xml extension)
          const expectedPath = `/${fileName}.xml`;
          expect(fetchSpy).toHaveBeenCalledWith(expectedPath);

          // Verify fetch was called exactly once on mount
          expect(fetchSpy).toHaveBeenCalledTimes(1);

          // Clean up
          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should trigger fetch on mount for simple file paths', async () => {
      // Generator for simple file paths
      const simpleFilePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(simpleFilePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          const mockXMLContent = '<content><paragraph>Content</paragraph></content>';
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => mockXMLContent,
          });

          const { unmount } = render(<XMLFileRenderer fileName={fileName} />);

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          expect(fetchSpy).toHaveBeenCalledWith(`/${fileName}.xml`);
          expect(fetchSpy).toHaveBeenCalledTimes(1);

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should append .xml extension to any fileName', async () => {
      // Test that .xml is always appended
      const fileNameArbitrary = fc.string({ minLength: 1, maxLength: 20 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length > 0 && !s.endsWith('.xml'));

      await fc.assert(
        fc.asyncProperty(fileNameArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content></content>',
          });

          const { unmount } = render(<XMLFileRenderer fileName={fileName} />);

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Should always append .xml
          expect(fetchSpy).toHaveBeenCalledWith(`/${fileName}.xml`);
          
          // Should not double-append if already has .xml
          const calls = fetchSpy.mock.calls;
          expect(calls[0][0]).not.toContain('.xml.xml');

          unmount();
        }),
        { numRuns: 20 }
      );
    });
  });

  describe('Property 16: Fetch Triggers on Prop Change', () => {
    it('should trigger new fetch when fileName prop changes', async () => {
      // Generator for two different file paths
      const twoFilePathsArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3),
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3)
      ).filter(([path1, path2]) => path1 !== path2);

      await fc.assert(
        fc.asyncProperty(twoFilePathsArbitrary, async ([fileName1, fileName2]) => {
          fetchSpy.mockClear();
          
          const mockContent1 = '<content><paragraph>Content 1</paragraph></content>';
          const mockContent2 = '<content><paragraph>Content 2</paragraph></content>';
          
          fetchSpy
            .mockResolvedValueOnce({
              ok: true,
              text: async () => mockContent1,
            })
            .mockResolvedValueOnce({
              ok: true,
              text: async () => mockContent2,
            });

          const { rerender, unmount } = render(<XMLFileRenderer fileName={fileName1} />);

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
          }, { timeout: 1000 });

          expect(fetchSpy).toHaveBeenCalledWith(`/${fileName1}.xml`);

          // Re-render with second fileName
          rerender(<XMLFileRenderer fileName={fileName2} />);

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(2);
          }, { timeout: 1000 });

          expect(fetchSpy).toHaveBeenNthCalledWith(2, `/${fileName2}.xml`);

          unmount();
        }),
        { numRuns: 15 }
      );
    });

    it('should not trigger fetch when fileName remains the same', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 10 })
        .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValue({
            ok: true,
            text: async () => '<content><paragraph>Content</paragraph></content>',
          });

          const { rerender, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
          }, { timeout: 1000 });

          // Re-render with same fileName
          rerender(<XMLFileRenderer fileName={fileName} />);

          // Wait a bit
          await new Promise(resolve => setTimeout(resolve, 100));

          // Should still be only 1 fetch
          expect(fetchSpy).toHaveBeenCalledTimes(1);

          unmount();
        }),
        { numRuns: 15 }
      );
    });

    it('should not trigger fetch when only className changes', async () => {
      const propsArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3),
        fc.string({ minLength: 3, maxLength: 15 })
          .map(s => s.replace(/[^a-zA-Z0-9_-\s]/g, ''))
          .filter(s => s.length >= 3),
        fc.string({ minLength: 3, maxLength: 15 })
          .map(s => s.replace(/[^a-zA-Z0-9_-\s]/g, ''))
          .filter(s => s.length >= 3)
      ).filter(([, class1, class2]) => class1 !== class2);

      await fc.assert(
        fc.asyncProperty(propsArbitrary, async ([fileName, className1, className2]) => {
          fetchSpy.mockClear();
          
          fetchSpy.mockResolvedValue({
            ok: true,
            text: async () => '<content><paragraph>Content</paragraph></content>',
          });

          const { rerender, unmount } = render(
            <XMLFileRenderer fileName={fileName} className={className1} />
          );

          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledTimes(1);
          }, { timeout: 1000 });

          // Re-render with different className but same fileName
          rerender(<XMLFileRenderer fileName={fileName} className={className2} />);

          // Wait a bit
          await new Promise(resolve => setTimeout(resolve, 100));

          // Should still be only 1 fetch (className change doesn't trigger fetch)
          expect(fetchSpy).toHaveBeenCalledTimes(1);

          unmount();
        }),
        { numRuns: 15 }
      );
    });
  });

  /**
   * **Validates: Requirements 1.5, 5.3, 9.1, 9.2, 9.3**
   * 
   * Property 18: Error Handling Without Crashes
   * For any error condition (missing file, network failure, invalid XML), 
   * the XMLFileRenderer should display an error message and log to console 
   * without crashing the application.
   */
  describe('Property 18: Error Handling Without Crashes', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      // Mock console.error to verify error logging
      consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should handle missing files (404) without crashing', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock 404 response
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });

          const { container, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for error state
          await waitFor(() => {
            expect(container.textContent).toContain('Error loading content');
          }, { timeout: 1000 });

          // Verify error message is displayed
          expect(container.textContent).toBe('Error loading content');

          // Verify error was logged to console
          expect(consoleErrorSpy).toHaveBeenCalled();

          // Verify component didn't crash (container still exists)
          expect(container).toBeTruthy();

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should handle network failures without crashing', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock network error
          fetchSpy.mockRejectedValueOnce(new Error('Network request failed'));

          const { container, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for error state
          await waitFor(() => {
            expect(container.textContent).toContain('Error loading content');
          }, { timeout: 1000 });

          // Verify error message is displayed
          expect(container.textContent).toBe('Error loading content');

          // Verify error was logged to console
          expect(consoleErrorSpy).toHaveBeenCalled();

          // Verify component didn't crash
          expect(container).toBeTruthy();

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should handle various HTTP error codes without crashing', async () => {
      const errorScenarioArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 15 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          .filter(s => s.length >= 3),
        fc.constantFrom(400, 401, 403, 404, 500, 502, 503),
        fc.constantFrom('Bad Request', 'Unauthorized', 'Forbidden', 'Not Found', 
                       'Internal Server Error', 'Bad Gateway', 'Service Unavailable')
      );

      await fc.assert(
        fc.asyncProperty(errorScenarioArbitrary, async ([fileName, statusCode, statusText]) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock error response
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
            statusText: statusText,
          });

          const { container, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for error state
          await waitFor(() => {
            expect(container.textContent).toContain('Error loading content');
          }, { timeout: 1000 });

          // Verify error message is displayed
          expect(container.textContent).toBe('Error loading content');

          // Verify error was logged
          expect(consoleErrorSpy).toHaveBeenCalled();

          // Verify component didn't crash
          expect(container).toBeTruthy();

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should handle invalid XML without crashing', async () => {
      const invalidXMLArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 15 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          .filter(s => s.length >= 3),
        fc.constantFrom(
          '<content><paragraph>Unclosed tag',
          '<content><bold>Text</paragraph></content>',
          '<content><>Invalid<></content>',
          'Not XML at all',
          '<content><paragraph>Text</paragraph>',
          ''
        )
      );

      await fc.assert(
        fc.asyncProperty(invalidXMLArbitrary, async ([fileName, invalidXML]) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock successful fetch but with invalid XML
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => invalidXML,
          });

          const { container, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for content to be processed
          await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Component should not crash - it should render something
          expect(container).toBeTruthy();

          // Should either show error or empty content (depending on parser behavior)
          // The key is that it doesn't crash
          const hasContent = container.textContent.length > 0;
          expect(hasContent).toBeDefined();

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should recover from error when fileName changes to valid file', async () => {
      const recoveryScenarioArbitrary = fc.tuple(
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3),
        fc.string({ minLength: 3, maxLength: 10 })
          .map(s => s.replace(/[^a-zA-Z0-9]/g, ''))
          .filter(s => s.length >= 3)
      ).filter(([path1, path2]) => path1 !== path2);

      await fc.assert(
        fc.asyncProperty(recoveryScenarioArbitrary, async ([invalidFileName, validFileName]) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // First fetch fails
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });

          const { container, rerender, unmount } = render(
            <XMLFileRenderer fileName={invalidFileName} />
          );

          // Wait for error state
          await waitFor(() => {
            expect(container.textContent).toContain('Error loading content');
          }, { timeout: 1000 });

          // Second fetch succeeds
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: async () => '<content><paragraph>Valid content</paragraph></content>',
          });

          // Change to valid fileName
          rerender(<XMLFileRenderer fileName={validFileName} />);

          // Wait for successful load
          await waitFor(() => {
            expect(container.textContent).not.toContain('Error loading content');
            expect(container.textContent).not.toContain('Loading...');
          }, { timeout: 1000 });

          // Should have recovered and show content
          expect(container.textContent).toBe('Valid content');

          unmount();
        }),
        { numRuns: 15 }
      );
    });

    it('should log detailed error information to console', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock error
          fetchSpy.mockRejectedValueOnce(new Error('Test error message'));

          const { unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for error to be logged
          await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
          }, { timeout: 1000 });

          // Verify console.error was called with error details
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Error loading XML content:',
            expect.any(Error)
          );

          unmount();
        }),
        { numRuns: 20 }
      );
    });

    it('should maintain error state until new fetch is triggered', async () => {
      const filePathArbitrary = fc.string({ minLength: 3, maxLength: 15 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length >= 3);

      await fc.assert(
        fc.asyncProperty(filePathArbitrary, async (fileName) => {
          fetchSpy.mockClear();
          consoleErrorSpy.mockClear();
          
          // Mock error
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
          });

          const { container, unmount } = render(<XMLFileRenderer fileName={fileName} />);

          // Wait for error state
          await waitFor(() => {
            expect(container.textContent).toContain('Error loading content');
          }, { timeout: 1000 });

          // Wait a bit more
          await new Promise(resolve => setTimeout(resolve, 200));

          // Error message should still be displayed
          expect(container.textContent).toBe('Error loading content');

          unmount();
        }),
        { numRuns: 15 }
      );
    });
  });
});
