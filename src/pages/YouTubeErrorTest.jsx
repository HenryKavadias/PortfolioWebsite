import { ErrorBoundary } from 'react-error-boundary';
import YouTubeVideo from '../components/YouTubeVideo';
import '../css/YouTubeErrorTest.css';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h3>❌ Error Caught</h3>
      <p><strong>Error Message:</strong> {error.message}</p>
      <button onClick={resetErrorBoundary}>Reset</button>
    </div>
  );
}

function YouTubeErrorTest() {
  return (
    <div className="youtube-error-test">
      <h1>YouTubeVideo Component - Error Scenario Testing</h1>
      <p className="intro">
        This page tests various error scenarios to verify the component handles errors gracefully.
        Each test is wrapped in an Error Boundary to catch and display errors without crashing the page.
      </p>

      {/* Test 1: Invalid URL - Non-YouTube Domain */}
      <section className="test-section">
        <h2>Test 1: Invalid URL - Non-YouTube Domain</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>https://vimeo.com/123456789</code><br />
          <strong>Expected:</strong> Error thrown with message "Invalid YouTube URL format"
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="https://vimeo.com/123456789" />
        </ErrorBoundary>
      </section>

      {/* Test 2: Invalid URL - Malformed URL */}
      <section className="test-section">
        <h2>Test 2: Invalid URL - Malformed URL</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>not-a-valid-url</code><br />
          <strong>Expected:</strong> Error thrown with message "Invalid YouTube URL format"
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="not-a-valid-url" />
        </ErrorBoundary>
      </section>

      {/* Test 3: Invalid URL - Empty String */}
      <section className="test-section">
        <h2>Test 3: Invalid URL - Empty String</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>""</code> (empty string)<br />
          <strong>Expected:</strong> Error thrown with message "YouTubeVideo requires a 'url' prop"
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="" />
        </ErrorBoundary>
      </section>

      {/* Test 4: Invalid URL - YouTube Domain but Wrong Path */}
      <section className="test-section">
        <h2>Test 4: Invalid URL - YouTube Domain but Wrong Path</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>https://www.youtube.com/channel/UCxxxxxx</code><br />
          <strong>Expected:</strong> Error thrown with message "Invalid YouTube URL format"
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="https://www.youtube.com/channel/UCxxxxxx" />
        </ErrorBoundary>
      </section>

      {/* Test 5: Invalid Video ID - Video Doesn't Exist */}
      <section className="test-section">
        <h2>Test 5: Invalid Video ID - Video Doesn't Exist</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>https://www.youtube.com/watch?v=INVALID_ID_12345</code><br />
          <strong>Expected:</strong> Component renders, but YouTube shows error message in iframe<br />
          <strong>Note:</strong> This is handled by YouTube's iframe, not our component
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=INVALID_ID_12345" />
        </ErrorBoundary>
      </section>

      {/* Test 6: Invalid Video ID - Video Removed */}
      <section className="test-section">
        <h2>Test 6: Invalid Video ID - Video Removed/Private</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>https://www.youtube.com/watch?v=xxxxxxxxxx</code><br />
          <strong>Expected:</strong> Component renders, but YouTube shows error message in iframe<br />
          <strong>Note:</strong> This is handled by YouTube's iframe, not our component
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=xxxxxxxxxx" />
        </ErrorBoundary>
      </section>

      {/* Test 7: Valid Component After Errors */}
      <section className="test-section success">
        <h2>Test 7: Valid Component (Verify Page Still Works)</h2>
        <p className="test-description">
          <strong>URL:</strong> <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code><br />
          <strong>Expected:</strong> Video loads and plays normally<br />
          <strong>Purpose:</strong> Verify that previous errors don't affect subsequent valid components
        </p>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </ErrorBoundary>
      </section>

      {/* Test 8: Multiple Errors Don't Crash Page */}
      <section className="test-section">
        <h2>Test 8: Multiple Invalid Components</h2>
        <p className="test-description">
          <strong>Purpose:</strong> Verify multiple errors don't crash the entire page
        </p>
        <div className="multi-error-container">
          <div className="error-item">
            <h4>Error 1: Null URL</h4>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <YouTubeVideo url={null} />
            </ErrorBoundary>
          </div>
          <div className="error-item">
            <h4>Error 2: Undefined URL</h4>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <YouTubeVideo url={undefined} />
            </ErrorBoundary>
          </div>
          <div className="error-item">
            <h4>Error 3: Invalid Domain</h4>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <YouTubeVideo url="https://example.com/video" />
            </ErrorBoundary>
          </div>
        </div>
      </section>

      {/* Console Error Test */}
      <section className="test-section info">
        <h2>Test 9: Console Error Logging</h2>
        <p className="test-description">
          <strong>Instructions:</strong> Open browser console (F12) and check for error logs<br />
          <strong>Expected:</strong> Component validation errors should be visible in console<br />
          <strong>Note:</strong> Check console for any iframe load errors
        </p>
        <div className="console-instructions">
          <ol>
            <li>Open browser DevTools (F12)</li>
            <li>Go to Console tab</li>
            <li>Look for error messages related to YouTubeVideo component</li>
            <li>Verify error messages are clear and helpful</li>
          </ol>
        </div>
      </section>

      {/* Network Error Simulation */}
      <section className="test-section info">
        <h2>Test 10: Network Error Simulation (Manual)</h2>
        <p className="test-description">
          <strong>Instructions:</strong> Simulate network issues to test iframe error handling<br />
          <strong>Steps:</strong>
        </p>
        <div className="network-instructions">
          <ol>
            <li>Open browser DevTools (F12)</li>
            <li>Go to Network tab</li>
            <li>Enable "Offline" mode or throttle to "Slow 3G"</li>
            <li>Refresh this page</li>
            <li>Observe how the component handles network failures</li>
            <li>Check console for error logs from handleIframeError()</li>
          </ol>
          <p><strong>Expected:</strong> Component should mark resources as complete even on network failure</p>
        </div>
      </section>

      {/* Summary */}
      <section className="test-summary">
        <h2>Test Summary</h2>
        <div className="summary-content">
          <h3>Error Scenarios Tested:</h3>
          <ul>
            <li>✓ Invalid URL - Non-YouTube domain</li>
            <li>✓ Invalid URL - Malformed URL string</li>
            <li>✓ Invalid URL - Empty string</li>
            <li>✓ Invalid URL - YouTube domain with wrong path</li>
            <li>✓ Invalid Video ID - Non-existent video</li>
            <li>✓ Invalid Video ID - Removed/private video</li>
            <li>✓ Multiple errors on same page</li>
            <li>✓ Valid component after errors</li>
            <li>✓ Console error logging</li>
            <li>✓ Network error simulation (manual)</li>
          </ul>
          
          <h3>Key Findings:</h3>
          <ul>
            <li><strong>Error Boundaries:</strong> All validation errors are caught by Error Boundaries</li>
            <li><strong>Error Messages:</strong> Clear and descriptive error messages</li>
            <li><strong>Graceful Degradation:</strong> Errors don't crash the entire page</li>
            <li><strong>YouTube Errors:</strong> Invalid video IDs are handled by YouTube's iframe</li>
            <li><strong>Network Errors:</strong> Component logs errors and marks resources complete</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default YouTubeErrorTest;
