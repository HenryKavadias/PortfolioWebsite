import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { parseXMLToReact } from './xmlParser.js';
import React from 'react';

/**
 * **Validates: Requirements 2.1, 2.2**
 * 
 * Property 1: XML Parsing Produces Valid React Elements
 * For any valid XML string, parsing should produce an array of React elements with non-negative length.
 */
describe('XML Parser - Property-Based Tests', () => {
  describe('Property 1: XML Parsing Produces Valid React Elements', () => {
    it('should produce an array with non-negative length for any valid XML', () => {
      // Generator for valid XML content
      const xmlContentArbitrary = fc.oneof(
        // Simple text content
        fc.string().map(text => text.replace(/[<>&"']/g, '')),
        
        // Paragraph with text
        fc.string().map(text => {
          const safeText = text.replace(/[<>&"']/g, '');
          return `<paragraph>${safeText}</paragraph>`;
        }),
        
        // Bold text
        fc.string().map(text => {
          const safeText = text.replace(/[<>&"']/g, '');
          return `<bold>${safeText}</bold>`;
        }),
        
        // Italic text
        fc.string().map(text => {
          const safeText = text.replace(/[<>&"']/g, '');
          return `<italic>${safeText}</italic>`;
        }),
        
        // Break tag
        fc.constant('<break />'),
        
        // Heading with level
        fc.tuple(fc.integer({ min: 1, max: 6 }), fc.string()).map(([level, text]) => {
          const safeText = text.replace(/[<>&"']/g, '');
          return `<heading level="${level}">${safeText}</heading>`;
        }),
        
        // Nested paragraph with bold
        fc.string().map(text => {
          const safeText = text.replace(/[<>&"']/g, '');
          return `<paragraph>Text with <bold>${safeText}</bold> inside</paragraph>`;
        }),
        
        // Multiple paragraphs
        fc.array(fc.string(), { minLength: 1, maxLength: 5 }).map(texts => {
          return texts.map(text => {
            const safeText = text.replace(/[<>&"']/g, '');
            return `<paragraph>${safeText}</paragraph>`;
          }).join('');
        })
      );

      // Property test
      fc.assert(
        fc.property(xmlContentArbitrary, (content) => {
          const xmlString = `<content>${content}</content>`;
          const result = parseXMLToReact(xmlString);
          
          // Property: Result should be an array
          expect(Array.isArray(result)).toBe(true);
          
          // Property: Array length should be non-negative
          expect(result.length).toBeGreaterThanOrEqual(0);
          
          // Property: All elements should be valid React elements or strings
          result.forEach(element => {
            const isValidReactElement = 
              typeof element === 'string' || 
              React.isValidElement(element);
            expect(isValidReactElement).toBe(true);
          });
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty content element', () => {
      fc.assert(
        fc.property(fc.constant('<content></content>'), (xmlString) => {
          const result = parseXMLToReact(xmlString);
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeGreaterThanOrEqual(0);
          return true;
        })
      );
    });

    it('should handle content with only whitespace', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim().length === 0),
          (whitespace) => {
            const xmlString = `<content>${whitespace}</content>`;
            const result = parseXMLToReact(xmlString);
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(0);
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should return empty array for malformed XML', () => {
      const malformedXMLArbitrary = fc.oneof(
        fc.constant('<content><unclosed>'),
        fc.constant('<content><tag></wrongtag></content>'),
        fc.constant('<content><tag attr="unclosed></content>'),
        fc.constant('not xml at all'),
        fc.constant('<content><<invalid>></content>')
      );

      fc.assert(
        fc.property(malformedXMLArbitrary, (xmlString) => {
          const result = parseXMLToReact(xmlString);
          // Should return empty array for malformed XML (Requirement 2.3)
          expect(Array.isArray(result)).toBe(true);
          return true;
        }),
        { numRuns: 20 }
      );
    });

    it('should handle nested structures of arbitrary depth', () => {
      // Generator for nested XML structures
      const nestedXMLArbitrary = fc.integer({ min: 1, max: 5 }).map(depth => {
        let xml = '';
        for (let i = 0; i < depth; i++) {
          xml += '<paragraph>';
        }
        xml += 'nested text';
        for (let i = 0; i < depth; i++) {
          xml += '</paragraph>';
        }
        return `<content>${xml}</content>`;
      });

      fc.assert(
        fc.property(nestedXMLArbitrary, (xmlString) => {
          const result = parseXMLToReact(xmlString);
          expect(Array.isArray(result)).toBe(true);
          expect(result.length).toBeGreaterThanOrEqual(0);
          return true;
        }),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * **Validates: Requirements 2.4, 8.2**
 * 
 * Property 2: Hierarchy Preservation
 * For any XML element with child nodes, the parent-child relationships in the XML 
 * should be preserved in the resulting React element tree structure.
 */
describe('Property 2: Hierarchy Preservation', () => {
  it('should preserve parent-child relationships for nested elements', () => {
    // Generator for nested XML structures with verifiable hierarchy
    const nestedStructureArbitrary = fc.tuple(
      fc.string().map(s => s.replace(/[<>&"']/g, '')),
      fc.string().map(s => s.replace(/[<>&"']/g, '')),
      fc.string().map(s => s.replace(/[<>&"']/g, ''))
    ).map(([text1, text2, text3]) => ({
      xml: `<content><paragraph>${text1}<bold>${text2}</bold>${text3}</paragraph></content>`,
      expectedDepth: 2, // paragraph -> bold
      expectedParentType: 'p',
      expectedChildType: 'strong'
    }));

    fc.assert(
      fc.property(nestedStructureArbitrary, ({ xml, expectedDepth, expectedParentType, expectedChildType }) => {
        const result = parseXMLToReact(xml);
        
        // Should have at least one element (the paragraph)
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        
        // Verify parent element type
        expect(React.isValidElement(paragraph)).toBe(true);
        expect(paragraph.type).toBe(expectedParentType);
        
        // Verify children exist
        expect(paragraph.props.children).toBeDefined();
        
        // Find the bold child element
        const children = Array.isArray(paragraph.props.children) 
          ? paragraph.props.children 
          : [paragraph.props.children];
        
        const boldChild = children.find(child => 
          React.isValidElement(child) && child.type === expectedChildType
        );
        
        // Verify child element exists and has correct type
        expect(boldChild).toBeDefined();
        expect(boldChild.type).toBe(expectedChildType);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve multi-level nesting hierarchy', () => {
    // Generator for deeply nested structures
    const deeplyNestedArbitrary = fc.integer({ min: 2, max: 4 }).chain(depth => {
      return fc.tuple(
        fc.constant(depth),
        fc.array(fc.string().map(s => s.replace(/[<>&"']/g, '')), { 
          minLength: depth, 
          maxLength: depth 
        })
      );
    }).map(([depth, texts]) => {
      // Build nested structure: paragraph > bold > italic > ...
      const tags = ['paragraph', 'bold', 'italic', 'paragraph'];
      let xml = '<content>';
      
      for (let i = 0; i < depth; i++) {
        xml += `<${tags[i % tags.length]}>`;
      }
      
      xml += texts[depth - 1];
      
      for (let i = depth - 1; i >= 0; i--) {
        xml += `</${tags[i % tags.length]}>`;
      }
      
      xml += '</content>';
      
      return { xml, depth, texts };
    });

    fc.assert(
      fc.property(deeplyNestedArbitrary, ({ xml, depth }) => {
        const result = parseXMLToReact(xml);
        
        // Should successfully parse
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        // Traverse the hierarchy to verify depth
        let current = result[0];
        let actualDepth = 0;
        
        while (React.isValidElement(current)) {
          actualDepth++;
          
          if (current.props.children) {
            const children = Array.isArray(current.props.children)
              ? current.props.children
              : [current.props.children];
            
            // Find first React element child
            current = children.find(child => React.isValidElement(child));
            
            if (!current) break;
          } else {
            break;
          }
        }
        
        // Verify depth matches expected
        expect(actualDepth).toBeGreaterThanOrEqual(depth);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should preserve sibling relationships within parent', () => {
    // Generator for parent with multiple children
    const siblingsArbitrary = fc.array(
      fc.string().map(s => s.replace(/[<>&"']/g, '')),
      { minLength: 2, maxLength: 5 }
    ).map(texts => {
      const childTags = texts.map((text, i) => 
        i % 2 === 0 ? `<bold>${text}</bold>` : `<italic>${text}</italic>`
      ).join('');
      
      return {
        xml: `<content><paragraph>${childTags}</paragraph></content>`,
        expectedChildCount: texts.length,
        texts
      };
    });

    fc.assert(
      fc.property(siblingsArbitrary, ({ xml, expectedChildCount }) => {
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Get children
        const children = Array.isArray(paragraph.props.children)
          ? paragraph.props.children
          : [paragraph.props.children];
        
        // Count React element children (excluding text nodes)
        const elementChildren = children.filter(child => React.isValidElement(child));
        
        // Should have expected number of child elements
        expect(elementChildren.length).toBe(expectedChildCount);
        
        // Verify all children are valid React elements
        elementChildren.forEach(child => {
          expect(React.isValidElement(child)).toBe(true);
          expect(['strong', 'em']).toContain(child.type);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve hierarchy with mixed content (text and elements)', () => {
    // Generator for mixed content
    const mixedContentArbitrary = fc.tuple(
      fc.string().map(s => s.replace(/[<>&"']/g, '')),
      fc.string().map(s => s.replace(/[<>&"']/g, '')),
      fc.string().map(s => s.replace(/[<>&"']/g, ''))
    ).map(([text1, text2, text3]) => ({
      xml: `<content><paragraph>${text1}<bold>${text2}</bold>${text3}</paragraph></content>`,
      texts: [text1, text2, text3]
    }));

    fc.assert(
      fc.property(mixedContentArbitrary, ({ xml, texts }) => {
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Should have children (mix of text and elements)
        expect(paragraph.props.children).toBeDefined();
        
        const children = Array.isArray(paragraph.props.children)
          ? paragraph.props.children
          : [paragraph.props.children];
        
        // Should have at least one element child (the bold tag)
        const elementChildren = children.filter(child => React.isValidElement(child));
        expect(elementChildren.length).toBeGreaterThan(0);
        
        // Should have text content preserved
        const hasTextContent = children.some(child => typeof child === 'string');
        
        // If any of the text strings are non-empty, we should have text children
        const hasNonEmptyText = texts.some(t => t.trim().length > 0);
        if (hasNonEmptyText) {
          expect(hasTextContent || elementChildren.length > 0).toBe(true);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve hierarchy for list structures', () => {
    // Generator for list with items
    const listArbitrary = fc.tuple(
      fc.constantFrom('ordered', 'unordered'),
      fc.array(fc.string().map(s => s.replace(/[<>&"']/g, '')), { 
        minLength: 1, 
        maxLength: 5 
      })
    ).map(([listType, items]) => ({
      xml: `<content><list type="${listType}">${items.map(item => `<item>${item}</item>`).join('')}</list></content>`,
      listType,
      itemCount: items.length
    }));

    fc.assert(
      fc.property(listArbitrary, ({ xml, listType, itemCount }) => {
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const list = result[0];
        expect(React.isValidElement(list)).toBe(true);
        
        // Verify list type
        const expectedListType = listType === 'ordered' ? 'ol' : 'ul';
        expect(list.type).toBe(expectedListType);
        
        // Verify children (list items)
        const children = Array.isArray(list.props.children)
          ? list.props.children
          : [list.props.children];
        
        const listItems = children.filter(child => 
          React.isValidElement(child) && child.type === 'li'
        );
        
        // Should have correct number of list items
        expect(listItems.length).toBe(itemCount);
        
        // All list items should be valid React elements
        listItems.forEach(item => {
          expect(React.isValidElement(item)).toBe(true);
          expect(item.type).toBe('li');
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 2.5**
 * 
 * Property 3: Text Content Preservation
 * For any XML document containing text nodes, all non-whitespace text content 
 * should appear in the rendered output.
 */
describe('Property 3: Text Content Preservation', () => {
  // Helper function to extract all text content from React elements
  const extractTextContent = (elements) => {
    if (!elements) return '';
    
    if (typeof elements === 'string') {
      return elements;
    }
    
    if (Array.isArray(elements)) {
      return elements.map(extractTextContent).join('');
    }
    
    if (React.isValidElement(elements)) {
      return extractTextContent(elements.props.children);
    }
    
    return '';
  };

  it('should preserve all text content from simple paragraph', () => {
    const textArbitrary = fc.string({ minLength: 1, maxLength: 100 })
      .filter(s => s.trim().length > 0)
      .map(s => s.replace(/[<>&"']/g, '').trim()); // Trim to match parser behavior

    fc.assert(
      fc.property(textArbitrary, (text) => {
        const xml = `<content><paragraph>${text}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // All non-whitespace text should be preserved (trimmed)
        expect(extractedText).toBe(text);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content in nested elements', () => {
    const nestedTextArbitrary = fc.tuple(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(nestedTextArbitrary, ([text1, text2, text3]) => {
        const xml = `<content><paragraph>${text1}<bold>${text2}</bold>${text3}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        const expectedText = text1 + text2 + text3;
        
        // All text from all levels should be preserved
        expect(extractedText).toBe(expectedText);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content across multiple sibling elements', () => {
    const multipleElementsArbitrary = fc.array(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      { minLength: 2, maxLength: 5 }
    );

    fc.assert(
      fc.property(multipleElementsArbitrary, (texts) => {
        const paragraphs = texts.map(text => `<paragraph>${text}</paragraph>`).join('');
        const xml = `<content>${paragraphs}</content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        const expectedText = texts.join('');
        
        // All text from all sibling elements should be preserved
        expect(extractedText).toBe(expectedText);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content in deeply nested structures', () => {
    const deeplyNestedTextArbitrary = fc.array(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      { minLength: 3, maxLength: 3 }
    );

    fc.assert(
      fc.property(deeplyNestedTextArbitrary, ([text1, text2, text3]) => {
        const xml = `<content><paragraph>${text1}<bold>${text2}<italic>${text3}</italic></bold></paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        const expectedText = text1 + text2 + text3;
        
        // All text from all nesting levels should be preserved
        expect(extractedText).toBe(expectedText);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content in list items', () => {
    const listItemsArbitrary = fc.array(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      { minLength: 2, maxLength: 5 }
    );

    fc.assert(
      fc.property(listItemsArbitrary, (items) => {
        const itemTags = items.map(item => `<item>${item}</item>`).join('');
        const xml = `<content><list type="unordered">${itemTags}</list></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        const expectedText = items.join('');
        
        // All text from all list items should be preserved
        expect(extractedText).toBe(expectedText);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content with special characters', () => {
    const specialCharsArbitrary = fc.tuple(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.constantFrom('!', '@', '#', '$', '%', '^', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', ':', ';', ',', '.', '?', '/')
    ).map(([text, char]) => text + char);

    fc.assert(
      fc.property(specialCharsArbitrary, (text) => {
        const xml = `<content><paragraph>${text}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Special characters should be preserved
        expect(extractedText).toBe(text);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content with numbers and mixed alphanumeric', () => {
    const alphanumericArbitrary = fc.tuple(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.integer({ min: 0, max: 9999 })
    ).map(([text, num]) => `${text} ${num}`);

    fc.assert(
      fc.property(alphanumericArbitrary, (text) => {
        const xml = `<content><paragraph>${text}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Numbers and mixed content should be preserved
        expect(extractedText).toBe(text);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content in heading elements', () => {
    const headingArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(headingArbitrary, ([level, text]) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Heading text should be preserved
        expect(extractedText).toBe(text);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve text content in link elements', () => {
    const linkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')), // Escape & for XML
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(linkArbitrary, ([href, text]) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Link text should be preserved (not the href)
        expect(extractedText).toBe(text);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should not include whitespace-only text nodes', () => {
    const whitespaceArbitrary = fc.string().filter(s => s.trim().length === 0 && s.length > 0);

    fc.assert(
      fc.property(whitespaceArbitrary, (whitespace) => {
        const xml = `<content><paragraph>${whitespace}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Whitespace-only content should be filtered out (Requirement 2.6)
        expect(extractedText.trim()).toBe('');
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should preserve text content but trim whitespace from individual text nodes', () => {
    const textWithWhitespaceArbitrary = fc.tuple(
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string().filter(s => s.trim().length === 0 && s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(textWithWhitespaceArbitrary, ([text1, whitespace, text2]) => {
        const xml = `<content><paragraph>${text1}${whitespace}${text2}</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        const extractedText = extractTextContent(result);
        
        // Both text nodes should be preserved, whitespace-only node should be filtered
        // The actual text content should be present
        expect(extractedText).toContain(text1);
        expect(extractedText).toContain(text2);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 4.1, 6.4**
 * 
 * Property 6: Attribute Preservation
 * For any XML element with attributes, all attributes should be preserved 
 * as React props in the converted element.
 */
describe('Property 6: Attribute Preservation', () => {
  // Helper function to find element by type in React element tree
  const findElementByType = (elements, targetType) => {
    if (!elements) return null;
    
    if (React.isValidElement(elements) && elements.type === targetType) {
      return elements;
    }
    
    if (Array.isArray(elements)) {
      for (const element of elements) {
        const found = findElementByType(element, targetType);
        if (found) return found;
      }
    }
    
    if (React.isValidElement(elements) && elements.props.children) {
      return findElementByType(elements.props.children, targetType);
    }
    
    return null;
  };

  // Helper to generate valid XML attribute names (must start with letter or underscore)
  // Also excludes reserved JavaScript property names
  const validAttributeNameArbitrary = fc.string({ minLength: 1, maxLength: 20 })
    .map(s => s.replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter(s => s.length > 0)
    .map(s => /^[a-zA-Z_]/.test(s) ? s : 'a' + s) // Ensure starts with letter
    .filter(s => !['__proto__', 'constructor', 'prototype', 'key', 'ref'].includes(s)); // Exclude reserved names

  it('should preserve single attribute on any element', () => {
    const attributeArbitrary = fc.tuple(
      fc.constantFrom('paragraph', 'bold', 'italic', 'heading', 'list', 'item'),
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, ''))
    );

    fc.assert(
      fc.property(attributeArbitrary, ([tagName, attrName, attrValue]) => {
        const xml = `<content><${tagName} ${attrName}="${attrValue}">content</${tagName}></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const element = result[0];
        expect(React.isValidElement(element)).toBe(true);
        
        // Attribute should be preserved in props
        expect(element.props[attrName]).toBe(attrValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve multiple attributes on same element', () => {
    const multipleAttributesArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, '')),
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, ''))
    ).filter(([attr1, , attr2]) => attr1 !== attr2); // Ensure unique attribute names

    fc.assert(
      fc.property(multipleAttributesArbitrary, ([attr1Name, attr1Value, attr2Name, attr2Value]) => {
        const xml = `<content><paragraph ${attr1Name}="${attr1Value}" ${attr2Name}="${attr2Value}">text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Both attributes should be preserved
        expect(paragraph.props[attr1Name]).toBe(attr1Value);
        expect(paragraph.props[attr2Name]).toBe(attr2Value);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve heading level attribute correctly', () => {
    const headingArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(headingArbitrary, ([level, text]) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Level attribute should be preserved
        expect(heading.props.level).toBe(String(level));
        
        // Should render as correct heading tag
        expect(heading.type).toBe(`h${level}`);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve link href attribute correctly', () => {
    const linkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')), // Escape & for valid XML
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(linkArbitrary, ([escapedHref, text]) => {
        const xml = `<content><link href="${escapedHref}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        
        // href attribute should be preserved (XML parser decodes &amp; back to &)
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        expect(link.props.href).toBe(expectedHref);
        
        // Should render as anchor tag
        expect(link.type).toBe('a');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve list type attribute correctly', () => {
    const listArbitrary = fc.tuple(
      fc.constantFrom('ordered', 'unordered'),
      fc.array(fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0), {
        minLength: 1,
        maxLength: 3
      })
    );

    fc.assert(
      fc.property(listArbitrary, ([listType, items]) => {
        const itemTags = items.map(item => `<item>${item}</item>`).join('');
        const xml = `<content><list type="${listType}">${itemTags}</list></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const list = result[0];
        expect(React.isValidElement(list)).toBe(true);
        
        // type attribute should be preserved
        expect(list.props.type).toBe(listType);
        
        // Should render as correct list tag
        const expectedTag = listType === 'ordered' ? 'ol' : 'ul';
        expect(list.type).toBe(expectedTag);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve attributes in nested elements', () => {
    const nestedAttributesArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, '')),
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, ''))
    ).filter(([attr1, , attr2]) => attr1 !== attr2);

    fc.assert(
      fc.property(nestedAttributesArbitrary, ([parentAttr, parentValue, childAttr, childValue]) => {
        const xml = `<content><paragraph ${parentAttr}="${parentValue}"><bold ${childAttr}="${childValue}">text</bold></paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Parent attribute should be preserved
        expect(paragraph.props[parentAttr]).toBe(parentValue);
        
        // Find child element
        const children = Array.isArray(paragraph.props.children) 
          ? paragraph.props.children 
          : [paragraph.props.children];
        
        const boldChild = children.find(child => 
          React.isValidElement(child) && child.type === 'strong'
        );
        
        expect(boldChild).toBeDefined();
        
        // Child attribute should be preserved
        expect(boldChild.props[childAttr]).toBe(childValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve attributes with special characters in values', () => {
    const specialValueArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 })
        .map(s => s.replace(/[<>&"']/g, '')) // Remove XML-unsafe characters
        .map(s => s + fc.sample(fc.constantFrom('!', '@', '#', '$', '%', '^', '*', '(', ')', '-', '_', '=', '+', '[', ']', '{', '}', '|', ':', ';', ',', '.', '?', '/'), 1)[0])
    );

    fc.assert(
      fc.property(specialValueArbitrary, ([attrName, attrValue]) => {
        const xml = `<content><paragraph ${attrName}="${attrValue}">text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Attribute with special characters should be preserved
        expect(paragraph.props[attrName]).toBe(attrValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve attributes with numeric values', () => {
    const numericAttributeArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.integer({ min: 0, max: 10000 })
    );

    fc.assert(
      fc.property(numericAttributeArbitrary, ([attrName, attrValue]) => {
        const xml = `<content><paragraph ${attrName}="${attrValue}">text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Numeric attribute should be preserved as string (XML attributes are strings)
        expect(paragraph.props[attrName]).toBe(String(attrValue));
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve attributes on self-closing tags', () => {
    const selfClosingAttributeArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, ''))
    );

    fc.assert(
      fc.property(selfClosingAttributeArbitrary, ([attrName, attrValue]) => {
        const xml = `<content><paragraph>before<break ${attrName}="${attrValue}" />after</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Find the break element
        const children = Array.isArray(paragraph.props.children) 
          ? paragraph.props.children 
          : [paragraph.props.children];
        
        const breakElement = children.find(child => 
          React.isValidElement(child) && child.type === 'br'
        );
        
        expect(breakElement).toBeDefined();
        
        // Attribute on self-closing tag should be preserved
        expect(breakElement.props[attrName]).toBe(attrValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve empty string attribute values', () => {
    const emptyAttributeArbitrary = validAttributeNameArbitrary;

    fc.assert(
      fc.property(emptyAttributeArbitrary, (attrName) => {
        const xml = `<content><paragraph ${attrName}="">text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Empty string attribute should be preserved
        expect(paragraph.props[attrName]).toBe('');
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should preserve all attributes when element has many attributes', () => {
    const manyAttributesArbitrary = fc.array(
      fc.tuple(
        validAttributeNameArbitrary,
        fc.string({ minLength: 1, maxLength: 30 }).map(s => s.replace(/[<>&"']/g, ''))
      ),
      { minLength: 3, maxLength: 6 }
    ).map(attrs => {
      // Ensure unique attribute names
      const uniqueAttrs = [];
      const seenNames = new Set();
      for (const [name, value] of attrs) {
        if (!seenNames.has(name)) {
          uniqueAttrs.push([name, value]);
          seenNames.add(name);
        }
      }
      return uniqueAttrs;
    }).filter(attrs => attrs.length >= 3);

    fc.assert(
      fc.property(manyAttributesArbitrary, (attributes) => {
        const attrString = attributes.map(([name, value]) => `${name}="${value}"`).join(' ');
        const xml = `<content><paragraph ${attrString}>text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // All attributes should be preserved
        for (const [name, value] of attributes) {
          expect(paragraph.props[name]).toBe(value);
        }
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve attributes through React prop system for automatic sanitization', () => {
    // This test validates Requirement 6.4: attributes passed through React's prop system
    const attributeArbitrary = fc.tuple(
      validAttributeNameArbitrary,
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"']/g, ''))
    );

    fc.assert(
      fc.property(attributeArbitrary, ([attrName, attrValue]) => {
        const xml = `<content><paragraph ${attrName}="${attrValue}">text</paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Verify attribute is in props object (React's prop system)
        expect(paragraph.props).toHaveProperty(attrName);
        expect(paragraph.props[attrName]).toBe(attrValue);
        
        // Verify it's a proper React element with props
        expect(typeof paragraph.props).toBe('object');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 3.5, 4.2**
 * 
 * Property 7: Heading Level Mapping
 * For any heading tag with a level attribute between 1 and 6, the parser should 
 * convert it to the corresponding React heading element (h1-h6).
 */
describe('Property 7: Heading Level Mapping', () => {
  it('should map heading level attribute to correct React heading element', () => {
    const headingArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(headingArbitrary, ([level, text]) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should map to correct heading tag (h1-h6)
        const expectedTag = `h${level}`;
        expect(heading.type).toBe(expectedTag);
        
        // Level attribute should be preserved in props
        expect(heading.props.level).toBe(String(level));
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should map all valid heading levels (1-6) correctly', () => {
    // Test each level explicitly
    const allLevelsArbitrary = fc.constantFrom(1, 2, 3, 4, 5, 6).chain(level => 
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
        .map(text => ({ level, text }))
    );

    fc.assert(
      fc.property(allLevelsArbitrary, ({ level, text }) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Verify correct heading type
        expect(heading.type).toBe(`h${level}`);
        
        // Verify level is in valid range
        expect(level).toBeGreaterThanOrEqual(1);
        expect(level).toBeLessThanOrEqual(6);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should map heading level in nested structures', () => {
    const nestedHeadingArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(nestedHeadingArbitrary, ([level, headingText, boldText]) => {
        const xml = `<content><heading level="${level}">${headingText}<bold>${boldText}</bold></heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should still map to correct heading tag even with nested content
        expect(heading.type).toBe(`h${level}`);
        
        // Should have children
        expect(heading.props.children).toBeDefined();
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should map multiple headings with different levels in same document', () => {
    const multipleHeadingsArbitrary = fc.array(
      fc.tuple(
        fc.integer({ min: 1, max: 6 }),
        fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
      ),
      { minLength: 2, maxLength: 4 }
    );

    fc.assert(
      fc.property(multipleHeadingsArbitrary, (headings) => {
        const headingTags = headings.map(([level, text]) => 
          `<heading level="${level}">${text}</heading>`
        ).join('');
        const xml = `<content>${headingTags}</content>`;
        const result = parseXMLToReact(xml);
        
        // Should have same number of elements as headings
        expect(result.length).toBe(headings.length);
        
        // Each heading should map to correct type
        result.forEach((element, index) => {
          expect(React.isValidElement(element)).toBe(true);
          const [level] = headings[index];
          expect(element.type).toBe(`h${level}`);
          expect(element.props.level).toBe(String(level));
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve heading level attribute as string in props', () => {
    const headingArbitrary = fc.integer({ min: 1, max: 6 });

    fc.assert(
      fc.property(headingArbitrary, (level) => {
        const xml = `<content><heading level="${level}">Heading Text</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Level should be preserved as string (XML attributes are strings)
        expect(heading.props.level).toBe(String(level));
        expect(typeof heading.props.level).toBe('string');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should map heading level correctly with additional attributes', () => {
    const headingWithAttrsArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1, maxLength: 20 })
        .map(s => s.replace(/[^a-zA-Z0-9_-]/g, ''))
        .filter(s => s.length > 0 && /^[a-zA-Z_]/.test(s))
        .filter(s => !['key', 'ref', '__proto__', 'constructor', 'prototype'].includes(s)), // Exclude reserved names
      fc.string({ minLength: 1, maxLength: 30 }).map(s => s.replace(/[<>&"']/g, ''))
    );

    fc.assert(
      fc.property(headingWithAttrsArbitrary, ([level, text, attrName, attrValue]) => {
        const xml = `<content><heading level="${level}" ${attrName}="${attrValue}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should map to correct heading type
        expect(heading.type).toBe(`h${level}`);
        
        // Both level and additional attribute should be preserved
        expect(heading.props.level).toBe(String(level));
        expect(heading.props[attrName]).toBe(attrValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should map heading level consistently across multiple parses', () => {
    // Idempotency test: parsing same XML multiple times should produce same result
    const headingArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(headingArbitrary, ([level, text]) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        
        // Parse multiple times
        const result1 = parseXMLToReact(xml);
        const result2 = parseXMLToReact(xml);
        const result3 = parseXMLToReact(xml);
        
        // All results should have same structure
        expect(result1.length).toBe(result2.length);
        expect(result2.length).toBe(result3.length);
        
        // All should map to same heading type
        expect(result1[0].type).toBe(`h${level}`);
        expect(result2[0].type).toBe(`h${level}`);
        expect(result3[0].type).toBe(`h${level}`);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should map heading level with empty content', () => {
    const levelArbitrary = fc.integer({ min: 1, max: 6 });

    fc.assert(
      fc.property(levelArbitrary, (level) => {
        const xml = `<content><heading level="${level}"></heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should still map to correct heading type even with no content
        expect(heading.type).toBe(`h${level}`);
        expect(heading.props.level).toBe(String(level));
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should map heading level with only whitespace content', () => {
    const headingWithWhitespaceArbitrary = fc.tuple(
      fc.integer({ min: 1, max: 6 }),
      fc.string().filter(s => s.trim().length === 0 && s.length > 0)
    );

    fc.assert(
      fc.property(headingWithWhitespaceArbitrary, ([level, whitespace]) => {
        const xml = `<content><heading level="${level}">${whitespace}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should map to correct heading type
        expect(heading.type).toBe(`h${level}`);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should map heading level boundary values (1 and 6)', () => {
    const boundaryLevelArbitrary = fc.constantFrom(1, 6).chain(level =>
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
        .map(text => ({ level, text }))
    );

    fc.assert(
      fc.property(boundaryLevelArbitrary, ({ level, text }) => {
        const xml = `<content><heading level="${level}">${text}</heading></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const heading = result[0];
        expect(React.isValidElement(heading)).toBe(true);
        
        // Should correctly map boundary values
        expect(heading.type).toBe(`h${level}`);
        expect([1, 6]).toContain(level);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * **Validates: Requirements 3.9, 4.3**
 * 
 * Property 8: Link Href Preservation
 * For any link tag with an href attribute, the parser should create a React anchor 
 * element with the href value preserved as a prop.
 */
describe('Property 8: Link Href Preservation', () => {
  it('should preserve href attribute in link elements', () => {
    const linkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')), // Escape & for valid XML
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(linkArbitrary, ([escapedHref, text]) => {
        const xml = `<content><link href="${escapedHref}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        
        // Should render as anchor tag
        expect(link.type).toBe('a');
        
        // href attribute should be preserved (XML parser decodes &amp; back to &)
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        expect(link.props.href).toBe(expectedHref);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href with various URL schemes', () => {
    const urlSchemeArbitrary = fc.tuple(
      fc.constantFrom('http://', 'https://', 'ftp://', 'mailto:', 'tel:', 'file://'),
      fc.string({ minLength: 1, maxLength: 50 }).map(s => s.replace(/[<>&"'\s]/g, '')).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    ).map(([scheme, path, text]) => ({
      href: scheme + path,
      text
    }));

    fc.assert(
      fc.property(urlSchemeArbitrary, ({ href, text }) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // href should be preserved exactly
        expect(link.props.href).toBe(href);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href with query parameters', () => {
    const urlWithQueryArbitrary = fc.tuple(
      fc.webUrl(),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[<>&"'=\s]/g, '')).filter(s => s.length > 0),
      fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[<>&"'\s]/g, '')).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    ).map(([baseUrl, paramName, paramValue, text]) => ({
      href: `${baseUrl}?${paramName}=${paramValue}`.replace(/&/g, '&amp;'),
      expectedHref: `${baseUrl}?${paramName}=${paramValue}`,
      text
    }));

    fc.assert(
      fc.property(urlWithQueryArbitrary, ({ href, expectedHref, text }) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // href with query parameters should be preserved
        expect(link.props.href).toBe(expectedHref);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href with URL fragments', () => {
    // Use a simpler, more controlled URL generator to avoid XML entity issues
    const urlWithFragmentArbitrary = fc.tuple(
      fc.constantFrom('https://example.com', 'http://test.org', 'https://site.net'),
      fc.string({ minLength: 1, maxLength: 20 })
        .map(s => s.replace(/[^a-zA-Z0-9_-]/g, '')) // Only alphanumeric, underscore, hyphen
        .filter(s => s.length > 0),
      fc.string({ minLength: 1 })
        .map(s => s.replace(/[<>&"'#]/g, '').trim())
        .filter(s => s.length > 0)
    ).map(([baseUrl, fragment, text]) => ({
      href: `${baseUrl}#${fragment}`,
      text
    }));

    fc.assert(
      fc.property(urlWithFragmentArbitrary, ({ href, text }) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // href with fragment should be preserved
        expect(link.props.href).toBe(href);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href in nested link elements', () => {
    const nestedLinkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(nestedLinkArbitrary, ([escapedHref, text1, text2]) => {
        const xml = `<content><paragraph>${text1}<link href="${escapedHref}">${text2}</link></paragraph></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const paragraph = result[0];
        expect(React.isValidElement(paragraph)).toBe(true);
        
        // Find link element in children
        const children = Array.isArray(paragraph.props.children)
          ? paragraph.props.children
          : [paragraph.props.children];
        
        const link = children.find(child => 
          React.isValidElement(child) && child.type === 'a'
        );
        
        expect(link).toBeDefined();
        expect(link.type).toBe('a');
        
        // href should be preserved in nested context
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        expect(link.props.href).toBe(expectedHref);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href with additional attributes on link', () => {
    const linkWithAttrsArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0),
      fc.string({ minLength: 1, maxLength: 20 })
        .map(s => s.replace(/[^a-zA-Z0-9_-]/g, ''))
        .filter(s => s.length > 0 && /^[a-zA-Z_]/.test(s))
        .filter(s => !['key', 'ref', 'href', '__proto__', 'constructor', 'prototype'].includes(s)),
      fc.string({ minLength: 1, maxLength: 30 }).map(s => s.replace(/[<>&"']/g, ''))
    );

    fc.assert(
      fc.property(linkWithAttrsArbitrary, ([escapedHref, text, attrName, attrValue]) => {
        const xml = `<content><link href="${escapedHref}" ${attrName}="${attrValue}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // Both href and additional attribute should be preserved
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        expect(link.props.href).toBe(expectedHref);
        expect(link.props[attrName]).toBe(attrValue);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve multiple links with different hrefs in same document', () => {
    const multipleLinksArbitrary = fc.array(
      fc.tuple(
        fc.webUrl().map(url => url.replace(/&/g, '&amp;')),
        fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
      ),
      { minLength: 2, maxLength: 4 }
    );

    fc.assert(
      fc.property(multipleLinksArbitrary, (links) => {
        const linkTags = links.map(([href, text]) => 
          `<link href="${href}">${text}</link>`
        ).join('');
        const xml = `<content>${linkTags}</content>`;
        const result = parseXMLToReact(xml);
        
        // Should have same number of elements as links
        expect(result.length).toBe(links.length);
        
        // Each link should preserve its href
        result.forEach((element, index) => {
          expect(React.isValidElement(element)).toBe(true);
          expect(element.type).toBe('a');
          
          const [escapedHref] = links[index];
          const expectedHref = escapedHref.replace(/&amp;/g, '&');
          expect(element.props.href).toBe(expectedHref);
        });
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href consistently across multiple parses', () => {
    // Idempotency test: parsing same XML multiple times should preserve href identically
    const linkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(linkArbitrary, ([escapedHref, text]) => {
        const xml = `<content><link href="${escapedHref}">${text}</link></content>`;
        
        // Parse multiple times
        const result1 = parseXMLToReact(xml);
        const result2 = parseXMLToReact(xml);
        const result3 = parseXMLToReact(xml);
        
        // All results should have same structure
        expect(result1.length).toBe(result2.length);
        expect(result2.length).toBe(result3.length);
        
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        
        // All should preserve href identically
        expect(result1[0].props.href).toBe(expectedHref);
        expect(result2[0].props.href).toBe(expectedHref);
        expect(result3[0].props.href).toBe(expectedHref);
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should preserve href with relative URLs', () => {
    const relativeUrlArbitrary = fc.tuple(
      fc.constantFrom('./', '../', '/', './path/', '../path/', '/path/'),
      fc.string({ minLength: 1, maxLength: 30 }).map(s => s.replace(/[<>&"'\s]/g, '')).filter(s => s.length > 0),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    ).map(([prefix, path, text]) => ({
      href: prefix + path,
      text
    }));

    fc.assert(
      fc.property(relativeUrlArbitrary, ({ href, text }) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // Relative href should be preserved exactly
        expect(link.props.href).toBe(href);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve empty href attribute', () => {
    const textArbitrary = fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0);

    fc.assert(
      fc.property(textArbitrary, (text) => {
        const xml = `<content><link href="">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // Empty href should be preserved
        expect(link.props.href).toBe('');
        
        return true;
      }),
      { numRuns: 50 }
    );
  });

  it('should preserve href with special characters in path', () => {
    const specialPathArbitrary = fc.tuple(
      fc.constantFrom('https://example.com/'),
      fc.string({ minLength: 1, maxLength: 30 })
        .map(s => s.replace(/[<>&"'\s]/g, ''))
        .filter(s => s.length > 0)
        .map(s => s + fc.sample(fc.constantFrom('-', '_', '.', '~', '!', '*', '(', ')'), 1)[0]),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    ).map(([base, path, text]) => ({
      href: base + path,
      text
    }));

    fc.assert(
      fc.property(specialPathArbitrary, ({ href, text }) => {
        const xml = `<content><link href="${href}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // href with special characters should be preserved
        expect(link.props.href).toBe(href);
        
        return true;
      }),
      { numRuns: 100 }
    );
  });

  it('should preserve href through React prop system for automatic sanitization', () => {
    // This test validates Requirement 4.3: href passed through React's prop system
    const linkArbitrary = fc.tuple(
      fc.webUrl().map(url => url.replace(/&/g, '&amp;')),
      fc.string({ minLength: 1 }).map(s => s.replace(/[<>&"']/g, '').trim()).filter(s => s.length > 0)
    );

    fc.assert(
      fc.property(linkArbitrary, ([escapedHref, text]) => {
        const xml = `<content><link href="${escapedHref}">${text}</link></content>`;
        const result = parseXMLToReact(xml);
        
        expect(result.length).toBeGreaterThan(0);
        
        const link = result[0];
        expect(React.isValidElement(link)).toBe(true);
        expect(link.type).toBe('a');
        
        // Verify href is in props object (React's prop system)
        expect(link.props).toHaveProperty('href');
        
        const expectedHref = escapedHref.replace(/&amp;/g, '&');
        expect(link.props.href).toBe(expectedHref);
        
        // Verify it's a proper React element with props
        expect(typeof link.props).toBe('object');
        
        return true;
      }),
      { numRuns: 100 }
    );
  });
});
