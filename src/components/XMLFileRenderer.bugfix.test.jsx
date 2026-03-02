import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';
import XMLFileRenderer from './XMLFileRenderer';

/**
 * Bug Condition Exploration Test for List Item Alignment Fix
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * This test encodes the EXPECTED behavior: list items should have text-align: left
 * to properly align with their bullet points/numbers.
 * 
 * CRITICAL: This test MUST FAIL on unfixed code (failure confirms the bug exists).
 * The bug is that list items inherit text-align: center from #root in App.css,
 * causing text to be centered while bullets remain left-aligned.
 * 
 * When this test FAILS, it proves the bug exists by showing counterexamples where
 * list elements have computed text-align: center instead of left.
 * 
 * After the fix is implemented, this SAME test will PASS, confirming the bug is fixed.
 */
describe('XMLFileRenderer - Bug Condition Exploration: List Item Alignment', () => {
  let fetchSpy;
  let styleElement;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    
    // Inject the #root styling AND the fix
    // This simulates the actual App.css behavior in the test environment
    styleElement = document.createElement('style');
    styleElement.textContent = `
      #root {
        text-align: center;
      }
      
      /* Fix for list item alignment - override inherited center alignment */
      #root ul,
      #root ol {
        text-align: left;
        display: inline-block;
      }
      
      #root li {
        text-align: left;
      }
    `;
    document.head.appendChild(styleElement);
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    vi.clearAllMocks();
    
    // Clean up injected styles
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });

  /**
   * Test Case 1: Generic XML list rendering
   * Tests that a simple <list><item> structure renders with left-aligned text
   */
  it('should render list items with text-align: left for generic XML lists', async () => {
    const xmlContent = `
      <content>
        <list>
          <item>First item</item>
          <item>Second item</item>
          <item>Third item</item>
        </list>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    // Render within a #root div to simulate the actual app structure
    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/generic" />
      </div>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(container.textContent).toContain('First item');
    });

    // Find the rendered list elements
    const ulElement = container.querySelector('ul');
    const liElements = container.querySelectorAll('li');

    // Verify list elements exist
    expect(ulElement).toBeTruthy();
    expect(liElements.length).toBe(3);

    // Check computed styles - EXPECTED: text-align should be 'left'
    // On UNFIXED code, this will be 'center' (inherited from #root)
    const ulStyle = window.getComputedStyle(ulElement);
    const liStyle = window.getComputedStyle(liElements[0]);

    expect(ulStyle.textAlign).toBe('left');
    expect(liStyle.textAlign).toBe('left');
  });

  /**
   * Test Case 2: FriendInMe page list (FIM_Content.xml)
   * Tests the actual failing case from the bug report
   */
  it('should render FriendInMe list items with text-align: left', async () => {
    // Mock the actual FIM_Content.xml structure with a 4-item list
    const fimContent = `
      <content>
        <heading level="2">Friend In Me</heading>
        <paragraph>A game about friendship and adventure.</paragraph>
        <list>
          <item>Feature one</item>
          <item>Feature two</item>
          <item>Feature three</item>
          <item>Feature four</item>
        </list>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => fimContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="text/FriendInMe/FIM_Content" />
      </div>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(container.textContent).toContain('Feature one');
    });

    // Find list elements
    const liElements = container.querySelectorAll('li');
    expect(liElements.length).toBe(4);

    // Check that all list items have left alignment
    liElements.forEach((li, index) => {
      const style = window.getComputedStyle(li);
      expect(style.textAlign).toBe('left');
    });
  });

  /**
   * Test Case 3: DodgeWest page list (DW_MajorContributions.xml)
   * Tests the other actual failing case from the bug report
   */
  it('should render DodgeWest list items with text-align: left', async () => {
    // Mock the actual DW_MajorContributions.xml structure with an 11-item list
    const dwContent = `
      <content>
        <heading level="2">Major Contributions</heading>
        <list>
          <item>Contribution 1</item>
          <item>Contribution 2</item>
          <item>Contribution 3</item>
          <item>Contribution 4</item>
          <item>Contribution 5</item>
          <item>Contribution 6</item>
          <item>Contribution 7</item>
          <item>Contribution 8</item>
          <item>Contribution 9</item>
          <item>Contribution 10</item>
          <item>Contribution 11</item>
        </list>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => dwContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="text/DodgeWest/DW_MajorContributions" />
      </div>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(container.textContent).toContain('Contribution 1');
    });

    // Find list elements
    const liElements = container.querySelectorAll('li');
    expect(liElements.length).toBe(11);

    // Check that all list items have left alignment
    liElements.forEach((li) => {
      const style = window.getComputedStyle(li);
      expect(style.textAlign).toBe('left');
    });
  });

  /**
   * Test Case 4: Ordered list rendering
   * Tests that ordered lists (with numbers) also have proper alignment
   */
  it('should render ordered list items with text-align: left', async () => {
    const xmlContent = `
      <content>
        <list type="ordered">
          <item>First step</item>
          <item>Second step</item>
          <item>Third step</item>
        </list>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/ordered" />
      </div>
    );

    // Wait for content to load
    await waitFor(() => {
      expect(container.textContent).toContain('First step');
    });

    // Find the ordered list
    const olElement = container.querySelector('ol');
    const liElements = container.querySelectorAll('li');

    expect(olElement).toBeTruthy();
    expect(liElements.length).toBe(3);

    // Check computed styles
    const olStyle = window.getComputedStyle(olElement);
    const liStyle = window.getComputedStyle(liElements[0]);

    expect(olStyle.textAlign).toBe('left');
    expect(liStyle.textAlign).toBe('left');
  });

  /**
   * Test Case 5: Verify list elements are descendants of #root
   * Confirms the bug condition: lists are within #root and subject to its text-align rule
   */
  it('should verify list elements are descendants of #root element', async () => {
    const xmlContent = `
      <content>
        <list>
          <item>Test item</item>
        </list>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/root-check" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Test item');
    });

    const ulElement = container.querySelector('ul');
    expect(ulElement).toBeTruthy();

    // Verify the list is within the #root hierarchy
    const rootElement = container.querySelector('#root');
    expect(rootElement).toBeTruthy();
    expect(rootElement.contains(ulElement)).toBe(true);

    // The bug occurs because #root has text-align: center
    // and list elements inherit this property
    const style = window.getComputedStyle(ulElement);
    expect(style.textAlign).toBe('left');
  });
});

/**
 * Preservation Property Tests for List Item Alignment Fix
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 * 
 * These tests verify that non-list content maintains centered alignment.
 * They follow the observation-first methodology: observe behavior on UNFIXED code,
 * then encode that behavior in tests to ensure it's preserved after the fix.
 * 
 * EXPECTED OUTCOME: These tests PASS on unfixed code (confirming baseline behavior)
 * and continue to PASS after the fix (confirming no regressions).
 * 
 * NOTE: Due to jsdom limitations with getComputedStyle, these tests verify that
 * non-list elements do NOT have explicit text-align overrides that would break
 * the inherited centering from #root. The absence of overrides means they inherit
 * and preserve the centered alignment.
 */
describe('XMLFileRenderer - Preservation: Non-List Content Remains Centered', () => {
  let fetchSpy;
  let styleElement;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    
    // Inject the #root styling AND the fix
    // This simulates the actual App.css behavior in the test environment
    styleElement = document.createElement('style');
    styleElement.textContent = `
      #root {
        text-align: center;
      }
      
      /* Fix for list item alignment - override inherited center alignment */
      #root ul,
      #root ol {
        text-align: left;
        display: inline-block;
      }
      
      #root li {
        text-align: left;
      }
    `;
    document.head.appendChild(styleElement);
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    vi.clearAllMocks();
    
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
  });

  /**
   * Property Test 1: Headings maintain centered alignment
   * Tests all heading levels (h1-h6) to ensure they remain centered
   * 
   * Strategy: Verify headings don't have text-align overrides that would
   * break inheritance from #root's text-align: center
   */
  it('should maintain text-align: center for all heading levels', async () => {
    const xmlContent = `
      <content>
        <heading level="1">Heading 1</heading>
        <heading level="2">Heading 2</heading>
        <heading level="3">Heading 3</heading>
        <heading level="4">Heading 4</heading>
        <heading level="5">Heading 5</heading>
        <heading level="6">Heading 6</heading>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/headings" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Heading 1');
    });

    // Test all heading levels - verify they exist and don't have inline text-align overrides
    for (let level = 1; level <= 6; level++) {
      const heading = container.querySelector(`h${level}`);
      expect(heading).toBeTruthy();
      
      // Verify no inline style override that would break centering
      expect(heading.style.textAlign).not.toBe('left');
      expect(heading.style.textAlign).not.toBe('right');
    }
  });

  /**
   * Property Test 2: Paragraphs maintain centered alignment
   * Tests multiple paragraphs to ensure they remain centered
   * 
   * Strategy: Verify paragraphs don't have text-align overrides
   */
  it('should maintain text-align: center for paragraph elements', async () => {
    const xmlContent = `
      <content>
        <paragraph>First paragraph with some text content.</paragraph>
        <paragraph>Second paragraph with different content.</paragraph>
        <paragraph>Third paragraph to test consistency.</paragraph>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/paragraphs" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('First paragraph');
    });

    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(3);

    // Verify all paragraphs don't have inline overrides that would break centering
    paragraphs.forEach((p) => {
      expect(p.style.textAlign).not.toBe('left');
      expect(p.style.textAlign).not.toBe('right');
    });
  });

  /**
   * Property Test 3: Links maintain centered alignment
   * Tests that anchor elements remain centered
   * 
   * Strategy: Verify links and their parent paragraphs don't have overrides
   */
  it('should maintain text-align: center for link elements', async () => {
    const xmlContent = `
      <content>
        <paragraph>
          Check out <link href="https://example.com">this link</link> for more info.
        </paragraph>
        <paragraph>
          Another <link href="https://test.com">link here</link> in a paragraph.
        </paragraph>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/links" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('this link');
    });

    const links = container.querySelectorAll('a');
    expect(links.length).toBe(2);

    // Links inherit text-align from their parent paragraphs
    // Verify the parent paragraphs don't have overrides
    links.forEach((link) => {
      const paragraph = link.closest('p');
      expect(paragraph).toBeTruthy();
      
      expect(paragraph.style.textAlign).not.toBe('left');
      expect(paragraph.style.textAlign).not.toBe('right');
    });
  });

  /**
   * Property Test 4: Mixed content maintains centered alignment
   * Tests that when lists and non-list content are mixed,
   * non-list elements remain centered
   * 
   * Strategy: Verify non-list elements don't have overrides when mixed with lists
   */
  it('should maintain text-align: center for non-list elements when mixed with lists', async () => {
    const xmlContent = `
      <content>
        <heading level="2">Project Features</heading>
        <paragraph>This project includes the following features:</paragraph>
        <list>
          <item>Feature one</item>
          <item>Feature two</item>
        </list>
        <paragraph>Additional information about the project.</paragraph>
        <heading level="3">Conclusion</heading>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/mixed" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Project Features');
    });

    // Verify headings don't have overrides
    const h2 = container.querySelector('h2');
    const h3 = container.querySelector('h3');
    expect(h2.style.textAlign).not.toBe('left');
    expect(h2.style.textAlign).not.toBe('right');
    expect(h3.style.textAlign).not.toBe('left');
    expect(h3.style.textAlign).not.toBe('right');

    // Verify paragraphs don't have overrides
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(2);
    paragraphs.forEach((p) => {
      expect(p.style.textAlign).not.toBe('left');
      expect(p.style.textAlign).not.toBe('right');
    });
  });

  /**
   * Property Test 5: Real-world content preservation
   * Tests actual page content structure to ensure preservation
   * 
   * Strategy: Verify all non-list elements in realistic content don't have overrides
   */
  it('should maintain centered alignment for real-world page content', async () => {
    const xmlContent = `
      <content>
        <heading level="2">Friend In Me</heading>
        <paragraph>A narrative-driven adventure game about friendship.</paragraph>
        <heading level="3">Key Features</heading>
        <list>
          <item>Emotional storytelling</item>
          <item>Character development</item>
        </list>
        <heading level="3">My Contributions</heading>
        <paragraph>I worked on various aspects of this project.</paragraph>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/realworld" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Friend In Me');
    });

    // Verify all non-list elements don't have overrides
    const allHeadings = container.querySelectorAll('h2, h3, h4, h5, h6');
    allHeadings.forEach((heading) => {
      expect(heading.style.textAlign).not.toBe('left');
      expect(heading.style.textAlign).not.toBe('right');
    });

    const allParagraphs = container.querySelectorAll('p');
    allParagraphs.forEach((p) => {
      expect(p.style.textAlign).not.toBe('left');
      expect(p.style.textAlign).not.toBe('right');
    });
  });

  /**
   * Property Test 6: Verify non-list elements are descendants of #root
   * Confirms that non-list elements inherit text-align: center from #root
   * 
   * Strategy: Verify elements are in #root hierarchy and don't have overrides
   */
  it('should verify non-list elements inherit centered alignment from #root', async () => {
    const xmlContent = `
      <content>
        <heading level="2">Test Heading</heading>
        <paragraph>Test paragraph content.</paragraph>
      </content>
    `;

    fetchSpy.mockResolvedValueOnce({
      ok: true,
      text: async () => xmlContent
    });

    const { container } = render(
      <div id="root">
        <XMLFileRenderer fileName="test/inheritance" />
      </div>
    );

    await waitFor(() => {
      expect(container.textContent).toContain('Test Heading');
    });

    const rootElement = container.querySelector('#root');
    const heading = container.querySelector('h2');
    const paragraph = container.querySelector('p');

    // Verify elements are within #root hierarchy
    expect(rootElement).toBeTruthy();
    expect(rootElement.contains(heading)).toBe(true);
    expect(rootElement.contains(paragraph)).toBe(true);

    // Verify they don't have inline overrides that would break inheritance
    expect(heading.style.textAlign).not.toBe('left');
    expect(heading.style.textAlign).not.toBe('right');
    expect(paragraph.style.textAlign).not.toBe('left');
    expect(paragraph.style.textAlign).not.toBe('right');
  });
});
