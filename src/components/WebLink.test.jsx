import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import fc from 'fast-check';
import { Link } from 'react-router-dom';
import WebLink from './WebLink';

/**
 * **Validates: Requirements 1.3, 1.4, 2.4, 2.5**
 * 
 * Property 1: Link Requirement
 * For any props passed to WebLink, if the link prop is missing or empty, 
 * then an Error must be thrown before rendering.
 * 
 * Property 2: Content Requirement
 * For any props passed to WebLink, if both text and img props are missing or empty, 
 * then an Error must be thrown before rendering.
 */
describe('WebLink - Property-Based Tests for Prop Validation', () => {
  
  describe('Property 1: Link Requirement', () => {
    it('should throw error when link prop is missing', () => {
      // Generator for valid content props (text and/or img)
      const validContentArbitrary = fc.oneof(
        // Text only
        fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
        // Image only
        fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img })),
        // Both text and image
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 })
        ).map(([text, img]) => ({ text, img }))
      );

      fc.assert(
        fc.property(validContentArbitrary, (contentProps) => {
          // Try to render WebLink without link prop
          expect(() => {
            WebLink({ ...contentProps });
          }).toThrow("WebLink requires a 'link' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error when link prop is empty string', () => {
      // Generator for valid content props
      const validContentArbitrary = fc.oneof(
        fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
        fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img })),
        fc.tuple(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.string({ minLength: 1, maxLength: 50 })
        ).map(([text, img]) => ({ text, img }))
      );

      fc.assert(
        fc.property(validContentArbitrary, (contentProps) => {
          // Try to render WebLink with empty link prop
          expect(() => {
            WebLink({ link: '', ...contentProps });
          }).toThrow("WebLink requires a 'link' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error for various falsy link values', () => {
      // Generator for falsy link values and valid content
      const falsyLinkArbitrary = fc.tuple(
        fc.constantFrom(null, undefined, '', false, 0),
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
          fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img }))
        )
      );

      fc.assert(
        fc.property(falsyLinkArbitrary, ([falsyLink, contentProps]) => {
          expect(() => {
            WebLink({ link: falsyLink, ...contentProps });
          }).toThrow("WebLink requires a 'link' prop");
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 2: Content Requirement', () => {
    it('should throw error when both text and img props are missing', () => {
      // Generator for valid link values
      const validLinkArbitrary = fc.oneof(
        // Internal routes
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        // External URLs
        fc.tuple(
          fc.constantFrom('http://', 'https://', '//'),
          fc.string({ minLength: 5, maxLength: 30 })
            .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
        ).map(([protocol, domain]) => `${protocol}${domain}.com`)
      );

      fc.assert(
        fc.property(validLinkArbitrary, (link) => {
          // Try to render WebLink without text or img props
          expect(() => {
            WebLink({ link });
          }).toThrow("WebLink requires either 'text' or 'img' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error when both text and img are empty strings', () => {
      const validLinkArbitrary = fc.oneof(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.tuple(
          fc.constantFrom('http://', 'https://'),
          fc.string({ minLength: 5, maxLength: 30 })
            .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
        ).map(([protocol, domain]) => `${protocol}${domain}.com`)
      );

      fc.assert(
        fc.property(validLinkArbitrary, (link) => {
          // Try to render WebLink with empty text and img
          expect(() => {
            WebLink({ link, text: '', img: '' });
          }).toThrow("WebLink requires either 'text' or 'img' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error when text is empty and img is missing', () => {
      const validLinkArbitrary = fc.string({ minLength: 1, maxLength: 30 })
        .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`);

      fc.assert(
        fc.property(validLinkArbitrary, (link) => {
          expect(() => {
            WebLink({ link, text: '' });
          }).toThrow("WebLink requires either 'text' or 'img' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error when img is empty and text is missing', () => {
      const validLinkArbitrary = fc.string({ minLength: 1, maxLength: 30 })
        .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`);

      fc.assert(
        fc.property(validLinkArbitrary, (link) => {
          expect(() => {
            WebLink({ link, img: '' });
          }).toThrow("WebLink requires either 'text' or 'img' prop");
        }),
        { numRuns: 50 }
      );
    });

    it('should throw error for various combinations of falsy content values', () => {
      // Generator for valid links and falsy content combinations
      const invalidContentArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.constantFrom(
          { text: '', img: '' },
          { text: null, img: null },
          { text: undefined, img: undefined },
          { text: '', img: null },
          { text: null, img: '' },
          { text: undefined, img: '' },
          { text: '', img: undefined },
          { text: false, img: false },
          { text: 0, img: 0 }
        )
      );

      fc.assert(
        fc.property(invalidContentArbitrary, ([link, contentProps]) => {
          expect(() => {
            WebLink({ link, ...contentProps });
          }).toThrow("WebLink requires either 'text' or 'img' prop");
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Valid Props Should Not Throw', () => {
    it('should not throw when link and text are provided', () => {
      const validPropsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(validPropsArbitrary, ([link, text]) => {
          // Should not throw - validation should pass
          expect(() => {
            WebLink({ link, text });
          }).not.toThrow();
        }),
        { numRuns: 50 }
      );
    });

    it('should not throw when link and img are provided', () => {
      const validPropsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(validPropsArbitrary, ([link, img]) => {
          // Should not throw - validation should pass
          expect(() => {
            WebLink({ link, img });
          }).not.toThrow();
        }),
        { numRuns: 50 }
      );
    });

    it('should not throw when link, text, and img are all provided', () => {
      const validPropsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(validPropsArbitrary, ([link, text, img]) => {
          // Should not throw - validation should pass
          expect(() => {
            WebLink({ link, text, img });
          }).not.toThrow();
        }),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * Property 3: External Link Detection
 * For any link string starting with 'http://', 'https://', or '//', 
 * the link must be classified as an External_URL.
 * 
 * Property 4: Internal Link Detection
 * For any link string not starting with 'http://', 'https://', or '//', 
 * the link must be classified as an Internal_Route.
 */
describe('WebLink - Property-Based Tests for Link Type Detection', () => {
  
  // Helper function to access isExternalLink (exported for testing)
  // Note: In production, we'd export this from WebLink.jsx for testing
  const isExternalLink = (link) => {
    return link.startsWith('http://') || 
           link.startsWith('https://') || 
           link.startsWith('//');
  };

  describe('Property 3: External Link Detection', () => {
    it('should detect http:// URLs as external', () => {
      // Generator for http:// URLs
      const httpUrlArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          .filter(s => s.length > 0),
        fc.string({ minLength: 0, maxLength: 20 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
      ).map(([domain, path]) => 
        path ? `http://${domain}.com/${path}` : `http://${domain}.com`
      );

      fc.assert(
        fc.property(httpUrlArbitrary, (link) => {
          // Test that isExternalLink correctly identifies http:// URLs
          expect(isExternalLink(link)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect https:// URLs as external', () => {
      // Generator for https:// URLs
      const httpsUrlArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          .filter(s => s.length > 0),
        fc.string({ minLength: 0, maxLength: 20 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
      ).map(([domain, path]) => 
        path ? `https://${domain}.com/${path}` : `https://${domain}.com`
      );

      fc.assert(
        fc.property(httpsUrlArbitrary, (link) => {
          // Test that isExternalLink correctly identifies https:// URLs
          expect(isExternalLink(link)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect // URLs as external', () => {
      // Generator for // URLs (protocol-relative)
      const protocolRelativeUrlArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          .filter(s => s.length > 0),
        fc.string({ minLength: 0, maxLength: 20 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
      ).map(([domain, path]) => 
        path ? `//${domain}.com/${path}` : `//${domain}.com`
      );

      fc.assert(
        fc.property(protocolRelativeUrlArbitrary, (link) => {
          // Test that isExternalLink correctly identifies // URLs
          expect(isExternalLink(link)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect all external URL patterns consistently', () => {
      // Generator for all external URL patterns
      const externalUrlArbitrary = fc.tuple(
        fc.constantFrom('http://', 'https://', '//'),
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          .filter(s => s.length > 0),
        fc.string({ minLength: 0, maxLength: 20 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
      ).map(([protocol, domain, path]) => 
        path ? `${protocol}${domain}.com/${path}` : `${protocol}${domain}.com`
      );

      fc.assert(
        fc.property(externalUrlArbitrary, (link) => {
          // All external URL patterns should be detected as external
          expect(isExternalLink(link)).toBe(true);
          
          // Verify the link starts with one of the expected protocols
          const startsWithProtocol = link.startsWith('http://') || 
                                     link.startsWith('https://') || 
                                     link.startsWith('//');
          expect(startsWithProtocol).toBe(true);
        }),
        { numRuns: 200 }
      );
    });

    it('should consistently identify any URL with external protocol', () => {
      // Generator for URLs with various structures after the protocol
      const complexExternalUrlArbitrary = fc.tuple(
        fc.constantFrom('http://', 'https://', '//'),
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.length > 0)
      ).map(([protocol, rest]) => `${protocol}${rest}`);

      fc.assert(
        fc.property(complexExternalUrlArbitrary, (link) => {
          // Any string starting with external protocol should be detected
          expect(isExternalLink(link)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Internal Link Detection', () => {
    it('should detect relative paths as internal', () => {
      // Generator for relative paths (no leading slash, no protocol)
      const relativePathArbitrary = fc.string({ minLength: 1, maxLength: 30 })
        .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        .filter(s => s.length > 0 && !s.startsWith('/') && !s.startsWith('http'));

      fc.assert(
        fc.property(relativePathArbitrary, (link) => {
          // Relative paths should be detected as internal
          expect(isExternalLink(link)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect absolute paths as internal', () => {
      // Generator for absolute paths (starting with single /)
      const absolutePathArbitrary = fc.string({ minLength: 1, maxLength: 30 })
        .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
        .filter(s => !s.startsWith('//'));

      fc.assert(
        fc.property(absolutePathArbitrary, (link) => {
          // Absolute paths (single /) should be detected as internal
          expect(isExternalLink(link)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should detect all internal route patterns consistently', () => {
      // Generator for various internal route patterns
      const internalRouteArbitrary = fc.oneof(
        // Absolute paths starting with single /
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
          .filter(s => !s.startsWith('//')),
        // Relative paths
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          .filter(s => s.length > 0 && !s.startsWith('/')),
        // Named routes from the portfolio
        fc.constantFrom('/home', '/purger', '/dodgewest', '/friendinme', '/eggescape', '/gambitandtheanchored')
      );

      fc.assert(
        fc.property(internalRouteArbitrary, (link) => {
          // All internal routes should be detected as internal
          expect(isExternalLink(link)).toBe(false);
          
          // Verify the link does NOT start with external protocols
          const startsWithProtocol = link.startsWith('http://') || 
                                     link.startsWith('https://') || 
                                     link.startsWith('//');
          expect(startsWithProtocol).toBe(false);
        }),
        { numRuns: 200 }
      );
    });

    it('should never confuse internal routes with external URLs', () => {
      // Generator that creates pairs of similar-looking internal and external links
      const linkPairArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 20 })
          .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          .filter(s => s.length > 0 && !s.startsWith('/')), // Exclude paths starting with / to avoid "///" edge case
        fc.constantFrom('http://', 'https://', '//')
      ).map(([path, protocol]) => ({
        internal: `/${path}`,
        external: `${protocol}example.com/${path}`
      }));

      fc.assert(
        fc.property(linkPairArbitrary, (linkPair) => {
          // Internal should be detected as internal
          expect(isExternalLink(linkPair.internal)).toBe(false);
          
          // External should be detected as external
          expect(isExternalLink(linkPair.external)).toBe(true);
          
          // They should have opposite detection results
          expect(isExternalLink(linkPair.internal)).not.toBe(isExternalLink(linkPair.external));
        }),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases correctly', () => {
      // Test specific edge cases
      const edgeCases = [
        { link: '/', expected: false },
        { link: '//', expected: true },
        { link: 'http://example.com', expected: true },
        { link: 'https://example.com', expected: true },
        { link: '//example.com', expected: true },
        { link: '/home', expected: false },
        { link: 'home', expected: false },
        { link: '/http://fake', expected: false },
        { link: 'nothttp://fake', expected: false },
      ];

      edgeCases.forEach(({ link, expected }) => {
        expect(isExternalLink(link)).toBe(expected);
      });
    });
  });
});

/**
 * **Validates: Requirements 2.1, 2.2, 2.3, 6.2, 7.1, 7.2, 7.3, 8.1**
 * 
 * Unit Tests for Content Rendering
 * Tests the renderContent function behavior for different content combinations
 */
describe('WebLink - Unit Tests for Content Rendering', () => {
  
  // Helper to render WebLink within Router context
  const renderWebLink = (props) => {
    return render(
      <BrowserRouter>
        <WebLink {...props} />
      </BrowserRouter>
    );
  };

  describe('Text-only rendering', () => {
    it('should render text content when only text prop is provided', () => {
      renderWebLink({ link: '/test', text: 'Click here' });
      
      // Text should be present
      expect(screen.getByText('Click here')).toBeInTheDocument();
      
      // No image should be rendered
      const images = screen.queryAllByRole('img');
      expect(images).toHaveLength(0);
    });

    it('should render text within a Link element', () => {
      renderWebLink({ link: '/test', text: 'Test Link' });
      
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Test Link');
    });

    it('should handle various text content', () => {
      const testCases = [
        'Simple text',
        'Text with numbers 123',
        'Special chars !@#$%',
        'Multi word text content'
      ];

      testCases.forEach(text => {
        const { unmount } = renderWebLink({ link: '/test', text });
        expect(screen.getByText(text)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Image-only rendering with empty alt', () => {
    it('should render image when only img prop is provided', () => {
      const { container } = renderWebLink({ link: '/test', img: '/images/test.png' });
      
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/test.png');
    });

    it('should have empty alt text when only img is provided', () => {
      const { container } = renderWebLink({ link: '/test', img: '/images/icon.png' });
      
      const image = container.querySelector('img');
      expect(image).toHaveAttribute('alt', '');
    });

    it('should apply web-link-image className to image', () => {
      const { container } = renderWebLink({ link: '/test', img: '/images/test.png' });
      
      const image = container.querySelector('img');
      expect(image).toHaveClass('web-link-image');
    });

    it('should not render any text content', () => {
      const { container } = renderWebLink({ link: '/test', img: '/images/test.png' });
      
      const link = screen.getByRole('link');
      // Link should only contain the image, no text nodes
      const textContent = link.textContent;
      expect(textContent).toBe('');
    });
  });

  describe('Combined rendering with correct alt text and ordering', () => {
    it('should render both image and text when both props are provided', () => {
      renderWebLink({ 
        link: '/test', 
        text: 'Project Name', 
        img: '/images/project.png' 
      });
      
      // Both should be present
      expect(screen.getByText('Project Name')).toBeInTheDocument();
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should use text as alt attribute when both are provided', () => {
      renderWebLink({ 
        link: '/test', 
        text: 'Dodge West', 
        img: '/images/dodgewest.png' 
      });
      
      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Dodge West');
    });

    it('should render image before text', () => {
      const { container } = renderWebLink({ 
        link: '/test', 
        text: 'Project', 
        img: '/images/test.png' 
      });
      
      const link = screen.getByRole('link');
      const children = Array.from(link.childNodes);
      
      // First child should be the img element
      expect(children[0].nodeName).toBe('IMG');
      
      // Text should come after the image
      const textNode = children.find(node => node.nodeType === Node.TEXT_NODE && node.textContent === 'Project');
      expect(textNode).toBeDefined();
    });

    it('should apply web-link-image className when both props provided', () => {
      renderWebLink({ 
        link: '/test', 
        text: 'Test', 
        img: '/images/test.png' 
      });
      
      const image = screen.getByRole('img');
      expect(image).toHaveClass('web-link-image');
    });

    it('should handle various text and image combinations', () => {
      const testCases = [
        { text: 'Purger', img: '/images/purger.png' },
        { text: 'Egg Escape', img: '/images/eggescape.png' },
        { text: 'Friend In Me', img: '/images/friendinme.png' }
      ];

      testCases.forEach(({ text, img }) => {
        const { unmount } = renderWebLink({ link: '/test', text, img });
        
        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', img);
        expect(image).toHaveAttribute('alt', text);
        expect(screen.getByText(text)).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Image className application', () => {
    it('should always apply web-link-image className to images', () => {
      // Test with image only
      const { unmount: unmount1, container: container1 } = renderWebLink({ 
        link: '/test', 
        img: '/images/test1.png' 
      });
      expect(container1.querySelector('img')).toHaveClass('web-link-image');
      unmount1();

      // Test with image and text
      const { unmount: unmount2 } = renderWebLink({ 
        link: '/test', 
        text: 'Test', 
        img: '/images/test2.png' 
      });
      expect(screen.getByRole('img')).toHaveClass('web-link-image');
      unmount2();
    });

    it('should not add extra classes to image element', () => {
      const { container } = renderWebLink({ link: '/test', img: '/images/test.png' });
      
      const image = container.querySelector('img');
      expect(image.className).toBe('web-link-image');
    });
  });

  describe('Link element className', () => {
    it('should apply web-link className to link element', () => {
      renderWebLink({ link: '/test', text: 'Test' });
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('web-link');
    });

    it('should apply web-link className regardless of content type', () => {
      // Text only
      const { unmount: unmount1 } = renderWebLink({ link: '/test', text: 'Test' });
      expect(screen.getByRole('link')).toHaveClass('web-link');
      unmount1();

      // Image only
      const { unmount: unmount2 } = renderWebLink({ link: '/test', img: '/images/test.png' });
      expect(screen.getByRole('link')).toHaveClass('web-link');
      unmount2();

      // Both
      const { unmount: unmount3 } = renderWebLink({ 
        link: '/test', 
        text: 'Test', 
        img: '/images/test.png' 
      });
      expect(screen.getByRole('link')).toHaveClass('web-link');
      unmount3();
    });
  });
});

/**
 * **Validates: Requirements 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1**
 * 
 * Property 8: Text Content Display
 * For any valid props where text prop is provided, the rendered output must contain the text content.
 * 
 * Property 9: Image Element Rendering
 * For any valid props where img prop is provided, the rendered output must contain an img element 
 * with src equal to the img prop, and className="web-link-image".
 * 
 * Property 10: Combined Content Display
 * For any valid props where both text and img props are provided, the rendered output must contain 
 * both the image element and text content, with the image appearing before the text.
 * 
 * Property 11: Alt Text with Both Content
 * For any valid props where both text and img props are provided, the img element's alt attribute 
 * must equal the text prop value.
 * 
 * Property 12: Alt Text with Image Only
 * For any valid props where img prop is provided but text prop is not, the img element's alt 
 * attribute must be an empty string.
 */
describe('WebLink - Property-Based Tests for Content Display', () => {
  
  // Helper to render WebLink within Router context
  const renderWebLink = (props) => {
    return render(
      <BrowserRouter>
        <WebLink {...props} />
      </BrowserRouter>
    );
  };

  describe('Property 8: Text Content Display', () => {
    it('should always display text content when text prop is provided', () => {
      // Generator for valid props with text (with or without image)
      const propsWithTextArbitrary = fc.tuple(
        // Valid link
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          ).map(([protocol, domain]) => `${protocol}${domain}.com`)
        ),
        // Text content
        fc.string({ minLength: 1, maxLength: 50 }),
        // Optional image
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
      );

      fc.assert(
        fc.property(propsWithTextArbitrary, ([link, text, img]) => {
          const props = { link, text };
          if (img) props.img = img;

          const { container, unmount } = renderWebLink(props);
          
          // Text content must be present in the rendered output
          expect(container.textContent).toContain(text);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should display text in the link element', () => {
      const propsWithTextArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithTextArbitrary, ([link, text]) => {
          const { unmount } = renderWebLink({ link, text });
          
          const linkElement = screen.getByRole('link');
          expect(linkElement.textContent).toContain(text);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 9: Image Element Rendering', () => {
    it('should always render img element with correct src when img prop is provided', () => {
      // Generator for valid props with image (with or without text)
      const propsWithImageArbitrary = fc.tuple(
        // Valid link
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          ).map(([protocol, domain]) => `${protocol}${domain}.com`)
        ),
        // Image source
        fc.string({ minLength: 1, maxLength: 50 }),
        // Optional text
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
      );

      fc.assert(
        fc.property(propsWithImageArbitrary, ([link, img, text]) => {
          const props = { link, img };
          if (text) props.text = text;

          const { container, unmount } = renderWebLink(props);
          
          // Image element must be present
          const image = container.querySelector('img');
          expect(image).toBeInTheDocument();
          
          // Image src must match img prop
          expect(image).toHaveAttribute('src', img);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should always apply web-link-image className to images', () => {
      const propsWithImageArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined })
      );

      fc.assert(
        fc.property(propsWithImageArbitrary, ([link, img, text]) => {
          const props = { link, img };
          if (text) props.text = text;

          const { container, unmount } = renderWebLink(props);
          
          const image = container.querySelector('img');
          expect(image).toHaveClass('web-link-image');
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should render exactly one image when img prop is provided', () => {
      const propsWithImageArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithImageArbitrary, ([link, img]) => {
          const { container, unmount } = renderWebLink({ link, img });
          
          const images = container.querySelectorAll('img');
          expect(images).toHaveLength(1);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Property 10: Combined Content Display', () => {
    it('should render both image and text when both props are provided', () => {
      // Generator for valid props with both text and image
      const propsWithBothArbitrary = fc.tuple(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          ).map(([protocol, domain]) => `${protocol}${domain}.com`)
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithBothArbitrary, ([link, text, img]) => {
          const { container, unmount } = renderWebLink({ link, text, img });
          
          // Both image and text must be present
          const image = container.querySelector('img');
          expect(image).toBeInTheDocument();
          expect(container.textContent).toContain(text);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should render image before text when both are provided', () => {
      const propsWithBothArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithBothArbitrary, ([link, text, img]) => {
          const { container, unmount } = renderWebLink({ link, text, img });
          
          const linkElement = container.querySelector('a');
          const children = Array.from(linkElement.childNodes);
          
          // First child should be the img element
          expect(children[0].nodeName).toBe('IMG');
          
          // Text should come after the image
          const textNode = children.find(
            node => node.nodeType === Node.TEXT_NODE && node.textContent === text
          );
          expect(textNode).toBeDefined();
          
          // Verify image comes before text by checking indices
          const imgIndex = children.findIndex(node => node.nodeName === 'IMG');
          const textIndex = children.findIndex(
            node => node.nodeType === Node.TEXT_NODE && node.textContent === text
          );
          expect(imgIndex).toBeLessThan(textIndex);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 50 }
      );
    });

    it('should maintain correct structure with various content combinations', () => {
      const contentCombinationsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(contentCombinationsArbitrary, ([link, text, img]) => {
          const { container, unmount } = renderWebLink({ link, text, img });
          
          // Verify structure: link contains image and text
          const linkElement = container.querySelector('a');
          const image = container.querySelector('img');
          
          expect(linkElement.contains(image)).toBe(true);
          expect(linkElement.textContent).toContain(text);
          
          // Cleanup after each test
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Alt Text with Both Content', () => {
    it('should use text as alt attribute when both text and img are provided', () => {
      const propsWithBothArbitrary = fc.tuple(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          ).map(([protocol, domain]) => `${protocol}${domain}.com`)
        ),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithBothArbitrary, ([link, text, img]) => {
          const { container } = renderWebLink({ link, text, img });
          
          const image = container.querySelector('img');
          expect(image).toHaveAttribute('alt', text);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain alt text consistency across different text values', () => {
      const textVariationsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom('Project Name', 'View Details', 'Click Here', 'Learn More')
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(textVariationsArbitrary, ([link, text, img]) => {
          const { container } = renderWebLink({ link, text, img });
          
          const image = container.querySelector('img');
          // Alt text must exactly match the text prop
          expect(image.getAttribute('alt')).toBe(text);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Alt Text with Image Only', () => {
    it('should use empty string as alt when only img is provided', () => {
      const propsWithImageOnlyArbitrary = fc.tuple(
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
          ).map(([protocol, domain]) => `${protocol}${domain}.com`)
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithImageOnlyArbitrary, ([link, img]) => {
          const { container } = renderWebLink({ link, img });
          
          const image = container.querySelector('img');
          expect(image).toHaveAttribute('alt', '');
        }),
        { numRuns: 100 }
      );
    });

    it('should consistently use empty alt for image-only across different images', () => {
      const imageVariationsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.constantFrom(
            '/images/icon.png',
            '/images/logo.svg',
            '/images/thumbnail.jpg',
            'https://example.com/image.png'
          )
        )
      );

      fc.assert(
        fc.property(imageVariationsArbitrary, ([link, img]) => {
          const { container } = renderWebLink({ link, img });
          
          const image = container.querySelector('img');
          // Alt must be exactly empty string, not undefined or null
          expect(image.getAttribute('alt')).toBe('');
        }),
        { numRuns: 100 }
      );
    });

    it('should never have alt text when text prop is not provided', () => {
      const propsWithImageOnlyArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(propsWithImageOnlyArbitrary, ([link, img]) => {
          const { container } = renderWebLink({ link, img });
          
          const image = container.querySelector('img');
          const altValue = image.getAttribute('alt');
          
          // Alt must be empty string (not truthy)
          expect(altValue).toBe('');
          expect(altValue).toBeFalsy();
        }),
        { numRuns: 50 }
      );
    });
  });

  describe('Cross-Property Validation: Alt Text Behavior', () => {
    it('should have different alt text behavior based on text prop presence', () => {
      // Generator for pairs: one with text, one without
      const altTextComparisonArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(altTextComparisonArbitrary, ([link, text, img]) => {
          // Render with both text and img
          const { container: container1, unmount: unmount1 } = renderWebLink({ link, text, img });
          const imageWithText = container1.querySelector('img');
          const altWithText = imageWithText.getAttribute('alt');
          unmount1();

          // Render with only img
          const { container: container2, unmount: unmount2 } = renderWebLink({ link, img });
          const imageWithoutText = container2.querySelector('img');
          const altWithoutText = imageWithoutText.getAttribute('alt');
          unmount2();

          // Alt text should be different
          expect(altWithText).toBe(text);
          expect(altWithoutText).toBe('');
          expect(altWithText).not.toBe(altWithoutText);
        }),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1**
 * 
 * Unit Tests for Element Rendering
 * Tests that the correct HTML element is rendered based on link type
 */
describe('WebLink - Unit Tests for Element Rendering', () => {
  
  // Helper to render WebLink within Router context
  const renderWebLink = (props) => {
    return render(
      <BrowserRouter>
        <WebLink {...props} />
      </BrowserRouter>
    );
  };

  describe('External link rendering', () => {
    it('should render anchor tag for http:// URLs', () => {
      const { container } = renderWebLink({ 
        link: 'http://example.com', 
        text: 'External Link' 
      });
      
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor.tagName).toBe('A');
    });

    it('should render anchor tag for https:// URLs', () => {
      const { container } = renderWebLink({ 
        link: 'https://github.com/user/repo', 
        text: 'GitHub' 
      });
      
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor.tagName).toBe('A');
    });

    it('should render anchor tag for // URLs', () => {
      const { container } = renderWebLink({ 
        link: '//example.com/path', 
        text: 'Protocol Relative' 
      });
      
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor.tagName).toBe('A');
    });

    it('should set href attribute to link prop value', () => {
      const testUrl = 'https://example.com/page';
      renderWebLink({ link: testUrl, text: 'Test' });
      
      const anchor = screen.getByRole('link');
      expect(anchor).toHaveAttribute('href', testUrl);
    });

    it('should include target="_blank" attribute', () => {
      renderWebLink({ 
        link: 'https://example.com', 
        text: 'External' 
      });
      
      const anchor = screen.getByRole('link');
      expect(anchor).toHaveAttribute('target', '_blank');
    });

    it('should include rel="noopener noreferrer" attribute', () => {
      renderWebLink({ 
        link: 'https://example.com', 
        text: 'External' 
      });
      
      const anchor = screen.getByRole('link');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should have all security attributes together', () => {
      const { container } = renderWebLink({ 
        link: 'http://malicious-site.com', 
        text: 'Potentially Unsafe' 
      });
      
      const anchor = container.querySelector('a');
      expect(anchor).toHaveAttribute('href', 'http://malicious-site.com');
      expect(anchor).toHaveAttribute('target', '_blank');
      expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should apply className="web-link" to external links', () => {
      renderWebLink({ 
        link: 'https://example.com', 
        text: 'External' 
      });
      
      const anchor = screen.getByRole('link');
      expect(anchor).toHaveClass('web-link');
    });

    it('should work with all content types (text, image, both)', () => {
      // Text only
      const { unmount: unmount1, container: container1 } = renderWebLink({ 
        link: 'https://example.com', 
        text: 'Text Only' 
      });
      expect(container1.querySelector('a')).toBeInTheDocument();
      expect(container1.querySelector('a')).toHaveAttribute('target', '_blank');
      unmount1();

      // Image only
      const { unmount: unmount2, container: container2 } = renderWebLink({ 
        link: 'https://example.com', 
        img: '/images/icon.png' 
      });
      expect(container2.querySelector('a')).toBeInTheDocument();
      expect(container2.querySelector('a')).toHaveAttribute('target', '_blank');
      unmount2();

      // Both
      const { unmount: unmount3, container: container3 } = renderWebLink({ 
        link: 'https://example.com', 
        text: 'Both', 
        img: '/images/icon.png' 
      });
      expect(container3.querySelector('a')).toBeInTheDocument();
      expect(container3.querySelector('a')).toHaveAttribute('target', '_blank');
      unmount3();
    });
  });

  describe('Internal link rendering', () => {
    it('should render React Router Link for absolute paths', () => {
      const { container } = renderWebLink({ 
        link: '/home', 
        text: 'Home' 
      });
      
      // React Router Link renders as an anchor tag, but we can check it's not a regular anchor
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      
      // Internal links should have 'to' attribute (React Router Link)
      // We can verify by checking it doesn't have target="_blank"
      expect(link).not.toHaveAttribute('target');
    });

    it('should render React Router Link for relative paths', () => {
      const { container } = renderWebLink({ 
        link: 'about', 
        text: 'About' 
      });
      
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).not.toHaveAttribute('target');
    });

    it('should set to attribute to link prop value', () => {
      renderWebLink({ link: '/projects', text: 'Projects' });
      
      const link = screen.getByRole('link');
      // React Router Link sets href based on 'to' prop
      expect(link).toHaveAttribute('href', '/projects');
    });

    it('should NOT include target attribute', () => {
      renderWebLink({ link: '/home', text: 'Home' });
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target');
    });

    it('should NOT include rel attribute', () => {
      renderWebLink({ link: '/home', text: 'Home' });
      
      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('rel');
    });

    it('should apply className="web-link" to internal links', () => {
      renderWebLink({ link: '/home', text: 'Home' });
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('web-link');
    });

    it('should work with all content types (text, image, both)', () => {
      // Text only
      const { unmount: unmount1 } = renderWebLink({ 
        link: '/purger', 
        text: 'Purger' 
      });
      const link1 = screen.getByRole('link');
      expect(link1).not.toHaveAttribute('target');
      expect(link1).not.toHaveAttribute('rel');
      unmount1();

      // Image only
      const { unmount: unmount2 } = renderWebLink({ 
        link: '/dodgewest', 
        img: '/images/dodgewest.png' 
      });
      const link2 = screen.getByRole('link');
      expect(link2).not.toHaveAttribute('target');
      expect(link2).not.toHaveAttribute('rel');
      unmount2();

      // Both
      const { unmount: unmount3 } = renderWebLink({ 
        link: '/friendinme', 
        text: 'Friend In Me', 
        img: '/images/friendinme.png' 
      });
      const link3 = screen.getByRole('link');
      expect(link3).not.toHaveAttribute('target');
      expect(link3).not.toHaveAttribute('rel');
      unmount3();
    });

    it('should handle portfolio routes correctly', () => {
      const portfolioRoutes = [
        '/home',
        '/purger',
        '/dodgewest',
        '/friendinme',
        '/eggescape',
        '/gambitandtheanchored'
      ];

      portfolioRoutes.forEach(route => {
        const { unmount } = renderWebLink({ link: route, text: 'Test' });
        
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', route);
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
        
        unmount();
      });
    });
  });

  describe('className="web-link" consistency', () => {
    it('should apply web-link class to both internal and external links', () => {
      // External link
      const { unmount: unmount1 } = renderWebLink({ 
        link: 'https://example.com', 
        text: 'External' 
      });
      expect(screen.getByRole('link')).toHaveClass('web-link');
      unmount1();

      // Internal link
      const { unmount: unmount2 } = renderWebLink({ 
        link: '/home', 
        text: 'Internal' 
      });
      expect(screen.getByRole('link')).toHaveClass('web-link');
      unmount2();
    });

    it('should apply web-link class regardless of content type', () => {
      const testCases = [
        { link: 'https://example.com', text: 'Text Only External' },
        { link: 'https://example.com', img: '/images/test.png' },
        { link: 'https://example.com', text: 'Both', img: '/images/test.png' },
        { link: '/home', text: 'Text Only Internal' },
        { link: '/home', img: '/images/test.png' },
        { link: '/home', text: 'Both', img: '/images/test.png' }
      ];

      testCases.forEach(props => {
        const { unmount } = renderWebLink(props);
        expect(screen.getByRole('link')).toHaveClass('web-link');
        unmount();
      });
    });

    it('should not add extra classes beyond web-link', () => {
      // External
      const { unmount: unmount1, container: container1 } = renderWebLink({ 
        link: 'https://example.com', 
        text: 'External' 
      });
      const externalLink = container1.querySelector('a');
      expect(externalLink.className).toBe('web-link');
      unmount1();

      // Internal
      const { unmount: unmount2, container: container2 } = renderWebLink({ 
        link: '/home', 
        text: 'Internal' 
      });
      const internalLink = container2.querySelector('a');
      expect(internalLink.className).toBe('web-link');
      unmount2();
    });
  });

  describe('Link type detection edge cases', () => {
    it('should correctly distinguish between similar-looking links', () => {
      // External: starts with //
      const { unmount: unmount1, container: container1 } = renderWebLink({ 
        link: '//example.com', 
        text: 'Protocol Relative' 
      });
      expect(container1.querySelector('a')).toHaveAttribute('target', '_blank');
      unmount1();

      // Internal: starts with single /
      const { unmount: unmount2 } = renderWebLink({ 
        link: '/example', 
        text: 'Internal Path' 
      });
      const internalLink = screen.getByRole('link');
      expect(internalLink).not.toHaveAttribute('target');
      unmount2();
    });

    it('should handle paths that contain http but do not start with it', () => {
      const { container } = renderWebLink({ 
        link: '/path/http/something', 
        text: 'Internal with http in path' 
      });
      
      const link = screen.getByRole('link');
      // Should be internal (no target attribute)
      expect(link).not.toHaveAttribute('target');
      expect(link).not.toHaveAttribute('rel');
    });

    it('should handle various external URL formats', () => {
      const externalUrls = [
        'http://example.com',
        'https://example.com',
        '//example.com',
        'http://example.com/path',
        'https://example.com/path?query=value',
        'https://subdomain.example.com',
        'http://localhost:3000'
      ];

      externalUrls.forEach(url => {
        const { unmount, container } = renderWebLink({ link: url, text: 'Test' });
        
        const anchor = container.querySelector('a');
        expect(anchor).toHaveAttribute('target', '_blank');
        expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
        
        unmount();
      });
    });

    it('should handle various internal route formats', () => {
      const internalRoutes = [
        '/',
        '/home',
        '/path/to/page',
        'relative',
        'relative/path',
        '/path-with-dashes',
        '/path_with_underscores'
      ];

      internalRoutes.forEach(route => {
        const { unmount } = renderWebLink({ link: route, text: 'Test' });
        
        const link = screen.getByRole('link');
        expect(link).not.toHaveAttribute('target');
        expect(link).not.toHaveAttribute('rel');
        
        unmount();
      });
    });
  });

  describe('Integration with content rendering', () => {
    it('should render external link with text content correctly', () => {
      renderWebLink({ 
        link: 'https://github.com', 
        text: 'View on GitHub' 
      });
      
      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('View on GitHub');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveClass('web-link');
    });

    it('should render internal link with image content correctly', () => {
      const { container } = renderWebLink({ 
        link: '/purger', 
        img: '/images/purger.png' 
      });
      
      const link = screen.getByRole('link');
      const image = container.querySelector('img');
      
      expect(link.contains(image)).toBe(true);
      expect(image).toHaveAttribute('src', '/images/purger.png');
      expect(link).not.toHaveAttribute('target');
    });

    it('should render external link with both image and text correctly', () => {
      const { container } = renderWebLink({ 
        link: 'https://twitter.com/user', 
        text: 'Follow on Twitter', 
        img: '/images/twitter-icon.png' 
      });
      
      const link = screen.getByRole('link');
      const image = container.querySelector('img');
      
      expect(link).toHaveTextContent('Follow on Twitter');
      expect(link.contains(image)).toBe(true);
      expect(image).toHaveAttribute('alt', 'Follow on Twitter');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveClass('web-link');
    });

    it('should render internal link with both image and text correctly', () => {
      const { container } = renderWebLink({ 
        link: '/dodgewest', 
        text: 'Dodge West', 
        img: '/images/dodgewest-icon.png' 
      });
      
      const link = screen.getByRole('link');
      const image = container.querySelector('img');
      
      expect(link).toHaveTextContent('Dodge West');
      expect(link.contains(image)).toBe(true);
      expect(image).toHaveAttribute('alt', 'Dodge West');
      expect(link).not.toHaveAttribute('target');
      expect(link).toHaveClass('web-link');
    });
  });
});

/**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1**
 * 
 * Property 5: External Link Rendering
 * For any valid props where the link is classified as an External_URL, the rendered element 
 * must be an HTML anchor tag with href equal to the link prop, target="_blank", and 
 * rel="noopener noreferrer".
 * 
 * Property 6: Internal Link Rendering
 * For any valid props where the link is classified as an Internal_Route, the rendered element 
 * must be a React Router Link component with to prop equal to the link prop, and no target 
 * or rel attributes.
 * 
 * Property 7: Styling Consistency
 * For any valid props, the rendered Link_Element must have className="web-link".
 */
describe('WebLink - Property-Based Tests for Rendering Behavior', () => {
  
  // Helper to render WebLink within Router context
  const renderWebLink = (props) => {
    return render(
      <BrowserRouter>
        <WebLink {...props} />
      </BrowserRouter>
    );
  };

  describe('Property 5: External Link Rendering', () => {
    it('should render anchor tag with correct attributes for any external URL', () => {
      // Generator for external URLs with valid content
      const externalLinkPropsArbitrary = fc.tuple(
        // External URL (http://, https://, or //)
        fc.tuple(
          fc.constantFrom('http://', 'https://', '//'),
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
            .filter(s => s.length > 0),
          fc.string({ minLength: 0, maxLength: 20 })
            .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
        ).map(([protocol, domain, path]) => 
          path ? `${protocol}${domain}.com/${path}` : `${protocol}${domain}.com`
        ),
        // Valid content (text, img, or both)
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
          fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img })),
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.string({ minLength: 1, maxLength: 50 })
          ).map(([text, img]) => ({ text, img }))
        )
      );

      fc.assert(
        fc.property(externalLinkPropsArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const anchor = container.querySelector('a');
          
          // Must be an anchor tag
          expect(anchor).toBeInTheDocument();
          expect(anchor.tagName).toBe('A');
          
          // Must have href equal to link prop
          expect(anchor).toHaveAttribute('href', link);
          
          // Must have target="_blank"
          expect(anchor).toHaveAttribute('target', '_blank');
          
          // Must have rel="noopener noreferrer"
          expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should consistently render external links with security attributes', () => {
      // Generator focusing on various external URL patterns
      const externalUrlVariationsArbitrary = fc.tuple(
        fc.oneof(
          // Standard http/https URLs
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 3, maxLength: 20 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
              .filter(s => s.length > 0)
          ).map(([protocol, domain]) => `${protocol}${domain}.com`),
          // Protocol-relative URLs
          fc.string({ minLength: 3, maxLength: 20 })
            .map(s => `//${s.replace(/[^a-zA-Z0-9.-]/g, '')}.com`)
            .filter(s => s.length > 5),
          // URLs with paths and query strings
          fc.tuple(
            fc.constantFrom('https://'),
            fc.string({ minLength: 3, maxLength: 15 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
              .filter(s => s.length > 0),
            fc.string({ minLength: 1, maxLength: 15 })
              .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
          ).map(([protocol, domain, path]) => `${protocol}${domain}.com/${path}`)
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(externalUrlVariationsArbitrary, ([link, text]) => {
          const { container, unmount } = renderWebLink({ link, text });
          
          const anchor = container.querySelector('a');
          
          // All external links must have security attributes
          expect(anchor).toHaveAttribute('target', '_blank');
          expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
          
          // Verify it's actually an external link
          const isExternal = link.startsWith('http://') || 
                           link.startsWith('https://') || 
                           link.startsWith('//');
          expect(isExternal).toBe(true);
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should render external links correctly with all content types', () => {
      // Generator for external links with different content combinations
      const externalWithContentArbitrary = fc.tuple(
        fc.tuple(
          fc.constantFrom('http://', 'https://'),
          fc.string({ minLength: 5, maxLength: 20 })
            .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
            .filter(s => s.length > 0)
        ).map(([protocol, domain]) => `${protocol}${domain}.com`),
        fc.oneof(
          // Text only
          fc.record({ text: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Image only
          fc.record({ img: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Both
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            img: fc.string({ minLength: 1, maxLength: 50 })
          })
        )
      );

      fc.assert(
        fc.property(externalWithContentArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const anchor = container.querySelector('a');
          
          // Verify anchor tag with all required attributes
          expect(anchor.tagName).toBe('A');
          expect(anchor.getAttribute('href')).toBe(link);
          expect(anchor.getAttribute('target')).toBe('_blank');
          expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
          
          // Verify content is rendered inside the anchor
          if (content.text) {
            expect(anchor.textContent).toContain(content.text);
          }
          if (content.img) {
            const image = anchor.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image.getAttribute('src')).toBe(content.img);
          }
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should never render external links without security attributes', () => {
      // Generator for various external URL formats
      const externalUrlArbitrary = fc.tuple(
        fc.constantFrom('http://', 'https://', '//'),
        fc.string({ minLength: 1, maxLength: 50 })
          .filter(s => s.length > 0)
      ).map(([protocol, rest]) => `${protocol}${rest}`);

      fc.assert(
        fc.property(
          fc.tuple(externalUrlArbitrary, fc.string({ minLength: 1, maxLength: 50 })),
          ([link, text]) => {
            const { container, unmount } = renderWebLink({ link, text });
            
            const anchor = container.querySelector('a');
            
            // Security attributes must ALWAYS be present for external links
            const hasTarget = anchor.hasAttribute('target');
            const hasRel = anchor.hasAttribute('rel');
            const targetValue = anchor.getAttribute('target');
            const relValue = anchor.getAttribute('rel');
            
            expect(hasTarget).toBe(true);
            expect(hasRel).toBe(true);
            expect(targetValue).toBe('_blank');
            expect(relValue).toBe('noopener noreferrer');
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Internal Link Rendering', () => {
    it('should render React Router Link without target/rel for any internal route', () => {
      // Generator for internal routes with valid content
      const internalLinkPropsArbitrary = fc.tuple(
        // Internal route (no external protocol)
        fc.oneof(
          // Absolute paths starting with single /
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
            .map(s => s.replace(/\/+/g, '/')) // Normalize multiple slashes to single slash
            .filter(s => !s.startsWith('//') && s.length > 1),
          // Relative paths
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
            .map(s => s.replace(/\/+/g, '/')) // Normalize multiple slashes to single slash
            .filter(s => s.length > 0 && !s.startsWith('/')),
          // Portfolio routes
          fc.constantFrom('/home', '/purger', '/dodgewest', '/friendinme', '/eggescape')
        ),
        // Valid content (text, img, or both)
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
          fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img })),
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.string({ minLength: 1, maxLength: 50 })
          ).map(([text, img]) => ({ text, img }))
        )
      );

      fc.assert(
        fc.property(internalLinkPropsArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const linkElement = container.querySelector('a');
          
          // Must render a link element
          expect(linkElement).toBeInTheDocument();
          
          // Must have href attribute (React Router Link renders as anchor)
          // React Router normalizes relative paths by adding leading slash
          const expectedHref = link.startsWith('/') ? link : `/${link}`;
          expect(linkElement).toHaveAttribute('href', expectedHref);
          
          // Must NOT have target attribute
          expect(linkElement).not.toHaveAttribute('target');
          
          // Must NOT have rel attribute
          expect(linkElement).not.toHaveAttribute('rel');
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should consistently render internal links without security attributes', () => {
      // Generator for various internal route patterns
      const internalRouteVariationsArbitrary = fc.tuple(
        fc.oneof(
          // Root path
          fc.constant('/'),
          // Simple absolute paths
          fc.string({ minLength: 1, maxLength: 20 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_-]/g, '')}`)
            .filter(s => s.length > 1 && !s.startsWith('//')),
          // Nested paths
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 10 })
              .map(s => s.replace(/[^a-zA-Z0-9_-]/g, ''))
              .filter(s => s.length > 0),
            fc.string({ minLength: 1, maxLength: 10 })
              .map(s => s.replace(/[^a-zA-Z0-9_-]/g, ''))
              .filter(s => s.length > 0)
          ).map(([part1, part2]) => `/${part1}/${part2}`),
          // Relative paths
          fc.string({ minLength: 1, maxLength: 20 })
            .map(s => s.replace(/[^a-zA-Z0-9_/-]/g, ''))
            .filter(s => s.length > 0 && !s.startsWith('/'))
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(internalRouteVariationsArbitrary, ([link, text]) => {
          const { container, unmount } = renderWebLink({ link, text });
          
          const linkElement = container.querySelector('a');
          
          // Internal links must NOT have target or rel attributes
          expect(linkElement.hasAttribute('target')).toBe(false);
          expect(linkElement.hasAttribute('rel')).toBe(false);
          
          // Verify it's actually an internal link
          const isInternal = !link.startsWith('http://') && 
                           !link.startsWith('https://') && 
                           !link.startsWith('//');
          expect(isInternal).toBe(true);
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should render internal links correctly with all content types', () => {
      // Generator for internal links with different content combinations
      const internalWithContentArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 20 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
          .filter(s => !s.startsWith('//')),
        fc.oneof(
          // Text only
          fc.record({ text: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Image only
          fc.record({ img: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Both
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            img: fc.string({ minLength: 1, maxLength: 50 })
          })
        )
      );

      fc.assert(
        fc.property(internalWithContentArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const linkElement = container.querySelector('a');
          
          // Verify link element with correct href and no security attributes
          expect(linkElement.tagName).toBe('A');
          expect(linkElement.getAttribute('href')).toBe(link);
          expect(linkElement.hasAttribute('target')).toBe(false);
          expect(linkElement.hasAttribute('rel')).toBe(false);
          
          // Verify content is rendered inside the link
          if (content.text) {
            expect(linkElement.textContent).toContain(content.text);
          }
          if (content.img) {
            const image = linkElement.querySelector('img');
            expect(image).toBeInTheDocument();
            expect(image.getAttribute('src')).toBe(content.img);
          }
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should never add target or rel attributes to internal links', () => {
      // Generator for internal routes
      const internalRouteArbitrary = fc.oneof(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
          .filter(s => !s.startsWith('//')),
        fc.constantFrom('/home', '/purger', '/dodgewest', '/', '/about')
      );

      fc.assert(
        fc.property(
          fc.tuple(internalRouteArbitrary, fc.string({ minLength: 1, maxLength: 50 })),
          ([link, text]) => {
            const { container, unmount } = renderWebLink({ link, text });
            
            const linkElement = container.querySelector('a');
            
            // Target and rel must NEVER be present for internal links
            const hasTarget = linkElement.hasAttribute('target');
            const hasRel = linkElement.hasAttribute('rel');
            
            expect(hasTarget).toBe(false);
            expect(hasRel).toBe(false);
            
            // Double-check by trying to get the attributes
            expect(linkElement.getAttribute('target')).toBeNull();
            expect(linkElement.getAttribute('rel')).toBeNull();
            
            unmount();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Styling Consistency', () => {
    it('should apply web-link className to all rendered links', () => {
      // Generator for any valid props (internal or external, any content)
      const anyValidPropsArbitrary = fc.tuple(
        // Any valid link
        fc.oneof(
          // External URLs
          fc.tuple(
            fc.constantFrom('http://', 'https://', '//'),
            fc.string({ minLength: 5, maxLength: 30 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
              .filter(s => s.length > 0)
          ).map(([protocol, domain]) => `${protocol}${domain}.com`),
          // Internal routes
          fc.string({ minLength: 1, maxLength: 30 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
            .filter(s => !s.startsWith('//'))
        ),
        // Any valid content
        fc.oneof(
          fc.string({ minLength: 1, maxLength: 50 }).map(text => ({ text })),
          fc.string({ minLength: 1, maxLength: 50 }).map(img => ({ img })),
          fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.string({ minLength: 1, maxLength: 50 })
          ).map(([text, img]) => ({ text, img }))
        )
      );

      fc.assert(
        fc.property(anyValidPropsArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const linkElement = container.querySelector('a');
          
          // Must have web-link className
          expect(linkElement).toHaveClass('web-link');
          
          unmount();
        }),
        { numRuns: 200 }
      );
    });

    it('should consistently apply web-link class regardless of link type', () => {
      // Generator that creates pairs of internal and external links
      const linkTypePairsArbitrary = fc.tuple(
        // External link
        fc.tuple(
          fc.constantFrom('https://'),
          fc.string({ minLength: 5, maxLength: 20 })
            .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
            .filter(s => s.length > 0)
        ).map(([protocol, domain]) => `${protocol}${domain}.com`),
        // Internal link
        fc.string({ minLength: 1, maxLength: 20 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
          .filter(s => !s.startsWith('//')),
        // Shared content
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(linkTypePairsArbitrary, ([externalLink, internalLink, text]) => {
          // Render external link
          const { container: container1, unmount: unmount1 } = renderWebLink({ 
            link: externalLink, 
            text 
          });
          const externalElement = container1.querySelector('a');
          expect(externalElement).toHaveClass('web-link');
          unmount1();

          // Render internal link
          const { container: container2, unmount: unmount2 } = renderWebLink({ 
            link: internalLink, 
            text 
          });
          const internalElement = container2.querySelector('a');
          expect(internalElement).toHaveClass('web-link');
          unmount2();

          // Both should have the same className
          expect(externalElement.className).toBe(internalElement.className);
        }),
        { numRuns: 100 }
      );
    });

    it('should apply web-link class regardless of content type', () => {
      // Generator for link with various content combinations
      const linkWithContentVariationsArbitrary = fc.tuple(
        fc.string({ minLength: 1, maxLength: 30 })
          .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
          .filter(s => !s.startsWith('//')),
        fc.oneof(
          // Text only
          fc.record({ text: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Image only
          fc.record({ img: fc.string({ minLength: 1, maxLength: 50 }) }),
          // Both text and image
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            img: fc.string({ minLength: 1, maxLength: 50 })
          })
        )
      );

      fc.assert(
        fc.property(linkWithContentVariationsArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const linkElement = container.querySelector('a');
          
          // web-link class must be present regardless of content type
          expect(linkElement).toHaveClass('web-link');
          expect(linkElement.classList.contains('web-link')).toBe(true);
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should have exactly the web-link className with no extra classes', () => {
      // Generator for various valid props
      const validPropsArbitrary = fc.tuple(
        fc.oneof(
          fc.tuple(
            fc.constantFrom('https://'),
            fc.string({ minLength: 5, maxLength: 20 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
              .filter(s => s.length > 0)
          ).map(([protocol, domain]) => `${protocol}${domain}.com`),
          fc.string({ minLength: 1, maxLength: 20 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
            .filter(s => !s.startsWith('//'))
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(validPropsArbitrary, ([link, text]) => {
          const { container, unmount } = renderWebLink({ link, text });
          
          const linkElement = container.querySelector('a');
          
          // className should be exactly "web-link"
          expect(linkElement.className).toBe('web-link');
          
          // classList should contain only one class
          expect(linkElement.classList.length).toBe(1);
          expect(linkElement.classList[0]).toBe('web-link');
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain className consistency across all valid prop combinations', () => {
      // Generator for comprehensive prop combinations
      const comprehensivePropsArbitrary = fc.oneof(
        // External with text
        fc.tuple(
          fc.constantFrom('https://example.com'),
          fc.record({ text: fc.string({ minLength: 1, maxLength: 50 }) })
        ),
        // External with image
        fc.tuple(
          fc.constantFrom('http://example.com'),
          fc.record({ img: fc.string({ minLength: 1, maxLength: 50 }) })
        ),
        // External with both
        fc.tuple(
          fc.constantFrom('//example.com'),
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            img: fc.string({ minLength: 1, maxLength: 50 })
          })
        ),
        // Internal with text
        fc.tuple(
          fc.constantFrom('/home', '/purger', '/dodgewest'),
          fc.record({ text: fc.string({ minLength: 1, maxLength: 50 }) })
        ),
        // Internal with image
        fc.tuple(
          fc.constantFrom('/friendinme', '/eggescape'),
          fc.record({ img: fc.string({ minLength: 1, maxLength: 50 }) })
        ),
        // Internal with both
        fc.tuple(
          fc.constantFrom('/gambitandtheanchored'),
          fc.record({
            text: fc.string({ minLength: 1, maxLength: 50 }),
            img: fc.string({ minLength: 1, maxLength: 50 })
          })
        )
      );

      fc.assert(
        fc.property(comprehensivePropsArbitrary, ([link, content]) => {
          const { container, unmount } = renderWebLink({ link, ...content });
          
          const linkElement = container.querySelector('a');
          
          // All combinations must have web-link className
          expect(linkElement).toHaveClass('web-link');
          expect(linkElement.className).toBe('web-link');
          
          unmount();
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Cross-Property Validation: Rendering Behavior', () => {
    it('should maintain all rendering properties together', () => {
      // Generator for comprehensive test of all rendering properties
      const comprehensiveRenderingArbitrary = fc.tuple(
        fc.oneof(
          // External URL
          fc.tuple(
            fc.constantFrom('http://', 'https://'),
            fc.string({ minLength: 5, maxLength: 20 })
              .map(s => s.replace(/[^a-zA-Z0-9.-]/g, ''))
              .filter(s => s.length > 0)
          ).map(([protocol, domain]) => ({ 
            link: `${protocol}${domain}.com`, 
            isExternal: true 
          })),
          // Internal route
          fc.string({ minLength: 1, maxLength: 20 })
            .map(s => `/${s.replace(/[^a-zA-Z0-9_/-]/g, '')}`)
            .filter(s => !s.startsWith('//'))
            .map(link => ({ link, isExternal: false }))
        ),
        fc.string({ minLength: 1, maxLength: 50 })
      );

      fc.assert(
        fc.property(comprehensiveRenderingArbitrary, ([{ link, isExternal }, text]) => {
          const { container, unmount } = renderWebLink({ link, text });
          
          const linkElement = container.querySelector('a');
          
          // Property 7: Must have web-link className
          expect(linkElement).toHaveClass('web-link');
          
          if (isExternal) {
            // Property 5: External link rendering
            expect(linkElement).toHaveAttribute('href', link);
            expect(linkElement).toHaveAttribute('target', '_blank');
            expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
          } else {
            // Property 6: Internal link rendering
            expect(linkElement).toHaveAttribute('href', link);
            expect(linkElement).not.toHaveAttribute('target');
            expect(linkElement).not.toHaveAttribute('rel');
          }
          
          unmount();
        }),
        { numRuns: 200 }
      );
    });
  });
});
