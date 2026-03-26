import YouTubeVideo from '../components/YouTubeVideo';
import '../css/YouTubeTest.css';

/**
 * YouTubeTest - Test page for verifying YouTubeVideo component with different URL formats
 * 
 * This page tests the YouTubeVideo component with:
 * 1. Standard YouTube watch URL
 * 2. Short YouTube URL (youtu.be)
 * 3. Embed YouTube URL
 * 4. URL with query parameters (timestamp)
 */
function YouTubeTest() {
  // Using a real YouTube video ID for testing: dQw4w9WgXcQ (Rick Astley - Never Gonna Give You Up)
  const testVideoId = 'dQw4w9WgXcQ';

  return (
    <div className="youtube-test-page">
      <h1>YouTube Video Component Test Page</h1>
      <p className="test-description">
        This page tests the YouTubeVideo component with different URL formats.
        All videos should load and display correctly.
      </p>

      <section className="test-section">
        <h2>Test 1: Standard Watch URL</h2>
        <p className="url-display">
          URL: <code>https://www.youtube.com/watch?v={testVideoId}</code>
        </p>
        <YouTubeVideo 
          url={`https://www.youtube.com/watch?v=${testVideoId}`}
          title="Test 1: Standard YouTube URL"
        />
      </section>

      <section className="test-section">
        <h2>Test 2: Short URL (youtu.be)</h2>
        <p className="url-display">
          URL: <code>https://youtu.be/{testVideoId}</code>
        </p>
        <YouTubeVideo 
          url={`https://youtu.be/${testVideoId}`}
          title="Test 2: Short YouTube URL"
        />
      </section>

      <section className="test-section">
        <h2>Test 3: Embed URL</h2>
        <p className="url-display">
          URL: <code>https://www.youtube.com/embed/{testVideoId}</code>
        </p>
        <YouTubeVideo 
          url={`https://www.youtube.com/embed/${testVideoId}`}
          title="Test 3: Embed YouTube URL"
        />
      </section>

      <section className="test-section">
        <h2>Test 4: URL with Query Parameters (Timestamp)</h2>
        <p className="url-display">
          URL: <code>https://www.youtube.com/watch?v={testVideoId}&t=30s</code>
        </p>
        <YouTubeVideo 
          url={`https://www.youtube.com/watch?v=${testVideoId}&t=30s`}
          title="Test 4: YouTube URL with timestamp parameter"
        />
      </section>

      <section className="test-section">
        <h2>Test 5: Custom Dimensions</h2>
        <p className="url-display">
          URL: <code>https://youtu.be/{testVideoId}</code> (800x450)
        </p>
        <YouTubeVideo 
          url={`https://youtu.be/${testVideoId}`}
          width={800}
          height={450}
          title="Test 5: Custom dimensions"
        />
      </section>

      <div className="test-results">
        <h2>Expected Results</h2>
        <ul>
          <li>✓ All five videos should load and display correctly</li>
          <li>✓ Each video should be the same content (Rick Astley - Never Gonna Give You Up)</li>
          <li>✓ Test 4 should start at 30 seconds if the timestamp parameter is respected</li>
          <li>✓ Test 5 should be larger than the others (800x450 vs default 560x315)</li>
          <li>✓ All videos should be playable and support fullscreen</li>
        </ul>
      </div>
    </div>
  );
}

export default YouTubeTest;
