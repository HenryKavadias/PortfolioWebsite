import { useContext, useEffect, useRef } from 'react';
import { LoadingTrackerContext } from '../contexts/LoadingTrackerContext';
import '../css/YouTubeVideo.css';

let youtubeIdCounter = 0;

/**
 * Validates that the required url prop is provided and non-empty.
 * @param {string} url - The YouTube URL to validate
 * @throws {Error} If url is null, undefined, or empty string
 */
function validateProps(url) {
  if (url === null || url === undefined || url === '') {
    throw new Error("YouTubeVideo requires a 'url' prop");
  }
}

/**
 * Extracts the video ID from various YouTube URL formats.
 * Supports standard watch URLs, short URLs (youtu.be), and embed URLs.
 * @param {string} url - The YouTube URL to parse
 * @returns {string|null} The extracted video ID, or null if URL format is not recognized
 */
function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check if it's a valid YouTube domain
    const isYouTubeDomain =
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com';

    if (!isYouTubeDomain) {
      return null;
    }

    // Try to match standard watch URL: youtube.com/watch?v=ID
    if (hostname.includes('youtube.com') && urlObj.pathname.includes('/watch')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
    }

    // Try to match short URL: youtu.be/ID
    if (hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1).split(/[?&#]/)[0];
      if (videoId) {
        return videoId;
      }
    }

    // Try to match embed URL: youtube.com/embed/ID
    if (hostname.includes('youtube.com') && urlObj.pathname.includes('/embed/')) {
      const parts = urlObj.pathname.split('/embed/');
      if (parts.length > 1) {
        const videoId = parts[1].split(/[?&#]/)[0];
        if (videoId) {
          return videoId;
        }
      }
    }
  } catch {
    // Invalid URL format
    return null;
  }

  // No valid format found
  return null;
}



/**
 * YouTubeVideo - A reusable component for embedding YouTube videos with loading tracking.
 * 
 * This component accepts a YouTube URL in various formats (standard, short, or embed),
 * extracts the video ID, and renders an iframe with the embedded video. It integrates
 * with LoadingTrackerContext to coordinate page loading states.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.url - Required. Full YouTube URL (e.g., "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
 * @param {number} [props.width=560] - Optional. iframe width in pixels
 * @param {number} [props.height=315] - Optional. iframe height in pixels
 * @param {string} [props.title="YouTube video player"] - Optional. iframe title for accessibility
 * @param {boolean} [props.trackLoading=true] - Optional. Whether to integrate with LoadingTrackerContext
 * 
 * @throws {Error} If url is null, undefined, or empty string
 * @throws {Error} If url format is not a recognized YouTube URL
 * 
 * @example
 * // Basic usage with standard YouTube URL
 * <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
 * 
 * @example
 * // Custom dimensions and title
 * <YouTubeVideo 
 *   url="https://youtu.be/dQw4w9WgXcQ" 
 *   width={800} 
 *   height={450}
 *   title="Gameplay demonstration"
 * />
 * 
 * @example
 * // Without loading tracking
 * <YouTubeVideo 
 *   url="https://www.youtube.com/embed/dQw4w9WgXcQ" 
 *   trackLoading={false}
 * />
 */
function YouTubeVideo({
  url,
  width = 560,
  height = 315,
  title = "YouTube video player",
  trackLoading = true
}) {
  validateProps(url);
  const videoId = extractVideoId(url);
  
  if (videoId === null) {
    throw new Error("Invalid YouTube URL format");
  }

  const context = useContext(LoadingTrackerContext);
  // Use module-level counter to generate unique IDs without calling impure functions during render
  const resourceId = useRef(null);
  if (resourceId.current === null) {
    resourceId.current = `youtube-${videoId}-${++youtubeIdCounter}`;
  }
  const iframeLoadedRef = useRef(false);

  useEffect(() => {
    // Register this video with the page loader if context is available
    if (trackLoading && context) {
      context.registerResource(resourceId.current);
    }

    return () => {
      // Cleanup: ensure resource is marked complete on unmount
      // Use ref to get the current value, not the closure value
      if (trackLoading && context && !iframeLoadedRef.current) {
        context.markResourceComplete(resourceId.current);
      }
    };
  }, [trackLoading, context]);

  const handleIframeLoad = () => {
    iframeLoadedRef.current = true;
    if (trackLoading && context) {
      context.markResourceComplete(resourceId.current);
    }
  };

  const handleIframeError = () => {
    console.error(`YouTube iframe failed to load for video ID: ${videoId}`);
    iframeLoadedRef.current = true;
    if (trackLoading && context) {
      context.markResourceComplete(resourceId.current);
    }
  };

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className="youtube-video-container">
      <iframe
        src={embedUrl}
        width={width}
        height={height}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        frameBorder="0"
      />
    </div>
  );
}

export default YouTubeVideo;
