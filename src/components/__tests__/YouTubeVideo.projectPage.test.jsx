import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import PageLoader from '../PageLoader';
import YouTubeVideo from '../YouTubeVideo';
import XMLFileRenderer from '../XMLFileRenderer';
import WebPageImage from '../WebPageImage';

/**
 * Integration tests for YouTubeVideo component in project page context
 * 
 * Tests verify that YouTubeVideo integrates properly with:
 * - Project page structure (PageLoader, XMLFileRenderer, WebPageImage)
 * - Multiple images and text content
 * - Real-world project page layouts
 */
describe('YouTubeVideo - Project Page Context Tests', () => {
  let fetchSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    fetchSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    vi.clearAllMocks();
  });

  describe('Purger project page simulation', () => {
    it('should render YouTubeVideo with project content and images', async () => {
      // Mock XML content fetches for Purger page
      fetchSpy.mockImplementation((url) => {
        if (url.includes('P_Title')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><title>Purger</title></content>'
          });
        }
        if (url.includes('P_Content')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>A fast-paced action game</paragraph></content>'
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      render(
        <PageLoader>
          <div>
            <XMLFileRenderer fileName="content/Purger/P_Title" />
            <XMLFileRenderer fileName="content/Purger/P_Content" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=purgerTrailer" 
              title="Purger Gameplay Trailer"
              width={800}
              height={450}
            />
            <WebPageImage src="/images/Purger/PurgerScreenshot1.png" alt="Purger Screenshot 1" size={400} />
            <WebPageImage src="/images/Purger/PurgerScreenshot2.png" alt="Purger Screenshot 2" size={400} />
            <WebPageImage src="/images/Purger/PurgerScreenshot3.png" alt="Purger Screenshot 3" size={400} />
            <WebPageImage src="/images/Purger/PurgerScreenshot4.png" alt="Purger Screenshot 4" size={400} />
          </div>
        </PageLoader>
      );

      // Initially should show loading spinner
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Purger')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('A fast-paced action game')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video is rendered with correct attributes
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/purgerTrailer');
      expect(iframe.getAttribute('title')).toBe('Purger Gameplay Trailer');
      expect(iframe.getAttribute('width')).toBe('800');
      expect(iframe.getAttribute('height')).toBe('450');

      // Verify images are rendered
      const images = document.querySelectorAll('img');
      expect(images.length).toBeGreaterThanOrEqual(4);

      // Loading should be complete
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle project page with video before screenshots', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Project description</paragraph></content>'
      });

      render(
        <PageLoader>
          <div>
            <h1>Game Project</h1>
            <XMLFileRenderer fileName="content/Project/Description" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=gameTrailer" 
              title="Game Trailer"
            />
            <h2>Screenshots</h2>
            <WebPageImage src="/images/Project/screenshot1.png" alt="Screenshot 1" size={400} />
            <WebPageImage src="/images/Project/screenshot2.png" alt="Screenshot 2" size={400} />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Game Project')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Project description')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video is rendered
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/gameTrailer');

      // Verify screenshots section
      expect(screen.getByText('Screenshots')).toBeInTheDocument();

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle project page with multiple videos', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      render(
        <PageLoader>
          <div>
            <h1>Multi-Video Project</h1>
            <XMLFileRenderer fileName="content/Project/Info" />
            
            <h2>Trailer</h2>
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=trailer" 
              title="Official Trailer"
            />
            
            <h2>Gameplay</h2>
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=gameplay" 
              title="Gameplay Demo"
            />
            
            <h2>Screenshots</h2>
            <WebPageImage src="/images/Project/screenshot1.png" alt="Screenshot 1" size={400} />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Multi-Video Project')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify both videos are rendered
      const iframes = document.querySelectorAll('iframe');
      expect(iframes).toHaveLength(2);
      expect(iframes[0].src).toBe('https://www.youtube.com/embed/trailer');
      expect(iframes[1].src).toBe('https://www.youtube.com/embed/gameplay');

      // Verify section headers
      expect(screen.getByText('Trailer')).toBeInTheDocument();
      expect(screen.getByText('Gameplay')).toBeInTheDocument();
      expect(screen.getByText('Screenshots')).toBeInTheDocument();

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Project page layout variations', () => {
    it('should handle video at the end of project page', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Description</paragraph></content>'
      });

      render(
        <PageLoader>
          <div>
            <h1>Project Title</h1>
            <XMLFileRenderer fileName="content/Project/Description" />
            <WebPageImage src="/images/Project/hero.png" alt="Hero Image" size={600} />
            <WebPageImage src="/images/Project/screenshot1.png" alt="Screenshot 1" size={400} />
            <WebPageImage src="/images/Project/screenshot2.png" alt="Screenshot 2" size={400} />
            <h2>Video Demo</h2>
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=demo" 
              title="Project Demo"
            />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Project Title')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Description')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video is at the end
      expect(screen.getByText('Video Demo')).toBeInTheDocument();
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/demo');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle video-only project page', async () => {
      render(
        <PageLoader>
          <div>
            <h1>Video Showcase</h1>
            <p>Watch our latest project in action</p>
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=showcase" 
              title="Project Showcase"
              width={960}
              height={540}
            />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Video Showcase')).toBeInTheDocument();
      }, { timeout: 1000 });

      expect(screen.getByText('Watch our latest project in action')).toBeInTheDocument();

      // Verify video with custom dimensions
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/showcase');
      expect(iframe.getAttribute('width')).toBe('960');
      expect(iframe.getAttribute('height')).toBe('540');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle project page with video between content sections', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('Overview')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Project overview</paragraph></content>'
          });
        }
        if (url.includes('Details')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Technical details</paragraph></content>'
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      render(
        <PageLoader>
          <div>
            <h1>Project Name</h1>
            <XMLFileRenderer fileName="content/Project/Overview" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=overview" 
              title="Overview Video"
            />
            <XMLFileRenderer fileName="content/Project/Details" />
            <WebPageImage src="/images/Project/diagram.png" alt="Technical Diagram" size={500} />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Project Name')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Project overview')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Technical details')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video is between content sections
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/overview');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Loading coordination in project pages', () => {
    it('should coordinate loading with all project page resources', async () => {
      let resolveTitle, resolveContent;
      const titlePromise = new Promise((resolve) => { resolveTitle = resolve; });
      const contentPromise = new Promise((resolve) => { resolveContent = resolve; });

      fetchSpy.mockImplementation((url) => {
        if (url.includes('Title')) return titlePromise;
        if (url.includes('Content')) return contentPromise;
        return Promise.reject(new Error('Not found'));
      });

      render(
        <PageLoader minLoadingTime={50}>
          <div>
            <XMLFileRenderer fileName="content/Project/Title" />
            <XMLFileRenderer fileName="content/Project/Content" />
            <YouTubeVideo url="https://www.youtube.com/watch?v=test" />
            <WebPageImage src="/images/test.png" alt="Test" />
          </div>
        </PageLoader>
      );

      // Should show loading
      expect(screen.getByRole('status')).toBeInTheDocument();

      // Resolve resources one by one
      resolveTitle({
        ok: true,
        text: async () => '<content><title>Title</title></content>'
      });

      // Still loading
      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      }, { timeout: 200 });

      resolveContent({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      // Wait for all resources to complete
      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video is rendered
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();

      // Loading should be complete
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should not block page load when video has trackLoading=false', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      render(
        <PageLoader minLoadingTime={50}>
          <div>
            <h1>Project</h1>
            <XMLFileRenderer fileName="content/Project/Info" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=bonus" 
              title="Bonus Content"
              trackLoading={false}
            />
            <WebPageImage src="/images/screenshot.png" alt="Screenshot" />
          </div>
        </PageLoader>
      );

      // Wait for page to load (untracked video doesn't block)
      await waitFor(() => {
        expect(screen.getByText('Project')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify untracked video is still rendered
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/bonus');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Error handling in project pages', () => {
    it('should handle project page when XML content fails but video loads', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      render(
        <PageLoader>
          <div>
            <h1>Project</h1>
            <XMLFileRenderer fileName="content/Project/Missing" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=video" 
              title="Project Video"
            />
            <WebPageImage src="/images/screenshot.png" alt="Screenshot" />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Project')).toBeInTheDocument();
      }, { timeout: 1000 });

      // XML should show error
      await waitFor(() => {
        expect(screen.getByText('Error loading content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Video should still render
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/video');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should handle project page with mixed success and failure', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('Success')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>Loaded content</paragraph></content>'
          });
        }
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });
      });

      render(
        <PageLoader>
          <div>
            <XMLFileRenderer fileName="content/Project/Success" />
            <XMLFileRenderer fileName="content/Project/Failure" />
            <YouTubeVideo url="https://www.youtube.com/watch?v=video" />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Loaded content')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Error loading content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Video should render
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('Real-world project page scenarios', () => {
    it('should simulate DodgeWest project page structure', async () => {
      fetchSpy.mockImplementation((url) => {
        if (url.includes('DW_Title')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><title>Dodge West</title></content>'
          });
        }
        if (url.includes('DW_Content')) {
          return Promise.resolve({
            ok: true,
            text: async () => '<content><paragraph>A western-themed action game</paragraph></content>'
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      render(
        <PageLoader>
          <div>
            <XMLFileRenderer fileName="content/DodgeWest/DW_Title" />
            <XMLFileRenderer fileName="content/DodgeWest/DW_Content" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=dodgeWestTrailer" 
              title="Dodge West Trailer"
            />
            <WebPageImage src="/images/DodgeWest/Screenshot1.png" alt="Dodge West Screenshot 1" size={400} />
            <WebPageImage src="/images/DodgeWest/Screenshot2.png" alt="Dodge West Screenshot 2" size={400} />
          </div>
        </PageLoader>
      );

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Dodge West')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('A western-themed action game')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.src).toBe('https://www.youtube.com/embed/dodgeWestTrailer');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should simulate project page with responsive video dimensions', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        text: async () => '<content><paragraph>Content</paragraph></content>'
      });

      render(
        <PageLoader>
          <div>
            <h1>Responsive Project</h1>
            <XMLFileRenderer fileName="content/Project/Info" />
            <YouTubeVideo 
              url="https://www.youtube.com/watch?v=responsive" 
              title="Responsive Video"
              width={1280}
              height={720}
            />
            <WebPageImage src="/images/screenshot.png" alt="Screenshot" size={600} />
          </div>
        </PageLoader>
      );

      // Wait for page to load
      await waitFor(() => {
        expect(screen.getByText('Responsive Project')).toBeInTheDocument();
      }, { timeout: 1000 });

      await waitFor(() => {
        expect(screen.getByText('Content')).toBeInTheDocument();
      }, { timeout: 1000 });

      // Verify video with custom dimensions
      const iframe = document.querySelector('iframe');
      expect(iframe).toBeTruthy();
      expect(iframe.getAttribute('width')).toBe('1280');
      expect(iframe.getAttribute('height')).toBe('720');

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });
});
