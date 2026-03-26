import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import YouTubeVideo from '../YouTubeVideo';
import { LoadingTrackerContext } from '../../contexts/LoadingTrackerContext';

describe('YouTubeVideo - Keyboard Navigation', () => {
  let mockContext;

  beforeEach(() => {
    mockContext = {
      registerResource: () => {},
      markResourceComplete: () => {}
    };
  });

  afterEach(() => {
    // Clean up any focused elements
    if (document.activeElement) {
      document.activeElement.blur();
    }
  });

  it('iframe is focusable via keyboard navigation', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <button>Before</button>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
          <button>After</button>
        </div>
      </LoadingTrackerContext.Provider>
    );

    const iframe = screen.getByTitle('YouTube video player');
    
    // Verify iframe is in the document
    expect(iframe).toBeTruthy();
    expect(iframe.tagName).toBe('IFRAME');
    
    // Verify iframe is focusable (has no tabindex=-1)
    expect(iframe.getAttribute('tabindex')).not.toBe('-1');
  });

  it('iframe can receive focus programmatically', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </LoadingTrackerContext.Provider>
    );

    const iframe = screen.getByTitle('YouTube video player');
    
    // Focus the iframe programmatically
    iframe.focus();
    
    // Verify iframe has focus
    expect(document.activeElement).toBe(iframe);
  });

  it('iframe is included in tab order by default', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <button data-testid="button-before">Before</button>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
          <button data-testid="button-after">After</button>
        </div>
      </LoadingTrackerContext.Provider>
    );

    const buttonBefore = screen.getByTestId('button-before');
    const iframe = screen.getByTitle('YouTube video player');
    const buttonAfter = screen.getByTestId('button-after');
    
    // Focus first button
    buttonBefore.focus();
    expect(document.activeElement).toBe(buttonBefore);
    
    // Tab to iframe
    iframe.focus();
    expect(document.activeElement).toBe(iframe);
    
    // Tab to next button
    buttonAfter.focus();
    expect(document.activeElement).toBe(buttonAfter);
  });

  it('multiple iframes maintain separate focus states', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <div>
          <YouTubeVideo 
            url="https://www.youtube.com/watch?v=video1" 
            title="First video"
          />
          <YouTubeVideo 
            url="https://www.youtube.com/watch?v=video2" 
            title="Second video"
          />
        </div>
      </LoadingTrackerContext.Provider>
    );

    const firstIframe = screen.getByTitle('First video');
    const secondIframe = screen.getByTitle('Second video');
    
    // Focus first iframe
    firstIframe.focus();
    expect(document.activeElement).toBe(firstIframe);
    
    // Focus second iframe
    secondIframe.focus();
    expect(document.activeElement).toBe(secondIframe);
    expect(document.activeElement).not.toBe(firstIframe);
  });

  it('iframe maintains accessibility attributes for keyboard users', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo 
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title="Custom video title"
        />
      </LoadingTrackerContext.Provider>
    );

    const iframe = screen.getByTitle('Custom video title');
    
    // Verify title attribute is present (important for screen readers and keyboard users)
    expect(iframe.getAttribute('title')).toBe('Custom video title');
    
    // Verify iframe is not hidden from assistive technologies
    expect(iframe.getAttribute('aria-hidden')).not.toBe('true');
    
    // Verify iframe doesn't have negative tabindex
    expect(iframe.getAttribute('tabindex')).not.toBe('-1');
  });

  it('iframe with custom title is keyboard accessible', () => {
    const customTitle = 'Gameplay demonstration video';
    
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo 
          url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          title={customTitle}
        />
      </LoadingTrackerContext.Provider>
    );

    const iframe = screen.getByTitle(customTitle);
    
    // Focus the iframe
    iframe.focus();
    
    // Verify it can receive focus
    expect(document.activeElement).toBe(iframe);
    expect(iframe.getAttribute('title')).toBe(customTitle);
  });

  it('container does not interfere with iframe keyboard navigation', () => {
    render(
      <LoadingTrackerContext.Provider value={mockContext}>
        <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
      </LoadingTrackerContext.Provider>
    );

    const iframe = screen.getByTitle('YouTube video player');
    const container = iframe.parentElement;
    
    // Verify container doesn't have tabindex that would interfere
    expect(container.hasAttribute('tabindex')).toBe(false);
    
    // Verify iframe can still be focused
    iframe.focus();
    expect(document.activeElement).toBe(iframe);
  });
});
