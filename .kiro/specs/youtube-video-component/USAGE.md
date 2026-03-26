# YouTubeVideo Component - Usage Guide

## Quick Start

```jsx
import YouTubeVideo from './components/YouTubeVideo';

function MyPage() {
  return <YouTubeVideo url="https://www.youtube.com/watch?v=VIDEO_ID" />;
}
```

## Supported URL Formats

The component accepts any of these YouTube URL formats:

```jsx
// Standard watch URL
<YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />

// Short URL
<YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ" />

// Embed URL
<YouTubeVideo url="https://www.youtube.com/embed/dQw4w9WgXcQ" />

// With timestamp or other parameters
<YouTubeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `url` | string | **required** | Full YouTube URL in any supported format |
| `width` | number | 560 | iframe width in pixels |
| `height` | number | 315 | iframe height in pixels |
| `title` | string | "YouTube video player" | iframe title for accessibility |
| `trackLoading` | boolean | true | Enable integration with LoadingTrackerContext |

## Best Practices

### 1. Always Provide Valid URLs

The component validates URLs and throws errors for invalid formats. Handle this in parent components:

```jsx
function ProjectPage({ videoUrl }) {
  if (!videoUrl) {
    return <p>No video available</p>;
  }
  
  return <YouTubeVideo url={videoUrl} />;
}
```

### 2. Use Descriptive Titles for Accessibility

Provide meaningful titles for screen readers:

```jsx
<YouTubeVideo 
  url="https://youtu.be/VIDEO_ID"
  title="Gameplay demonstration of level 3"
/>
```

### 3. Consider Custom Dimensions for Responsive Design

Adjust dimensions based on your layout:

```jsx
// Larger video for main content
<YouTubeVideo 
  url="https://youtu.be/VIDEO_ID"
  width={800}
  height={450}
/>

// Smaller video for sidebar
<YouTubeVideo 
  url="https://youtu.be/VIDEO_ID"
  width={400}
  height={225}
/>
```

### 4. Disable Loading Tracking for Non-Critical Content

If a video shouldn't block page loading (e.g., bonus content below the fold):

```jsx
<YouTubeVideo 
  url="https://youtu.be/VIDEO_ID"
  trackLoading={false}
/>
```

### 5. Multiple Videos on Same Page

The component handles multiple instances automatically - each gets a unique resource ID:

```jsx
function Gallery() {
  return (
    <>
      <YouTubeVideo url="https://youtu.be/VIDEO_1" title="Trailer" />
      <YouTubeVideo url="https://youtu.be/VIDEO_2" title="Gameplay" />
      <YouTubeVideo url="https://youtu.be/VIDEO_3" title="Tutorial" />
    </>
  );
}
```

## Common Gotchas

### 1. URL Must Be Complete

❌ **Don't** pass just the video ID:
```jsx
<YouTubeVideo url="dQw4w9WgXcQ" />  // Will throw error
```

✅ **Do** pass the full URL:
```jsx
<YouTubeVideo url="https://youtu.be/dQw4w9WgXcQ" />
```

### 2. LoadingTrackerContext Required for Loading Tracking

If you use `trackLoading={true}` (default), ensure the component is wrapped in LoadingTrackerContext:

```jsx
// In your App.jsx or page component
import { LoadingTrackerProvider } from './contexts/LoadingTrackerContext';

function App() {
  return (
    <LoadingTrackerProvider>
      <YourPageWithVideos />
    </LoadingTrackerProvider>
  );
}
```

If context is unavailable, the component still renders but won't track loading.

### 3. Video Availability is Not Validated

The component validates URL format but not whether the video exists or is accessible. YouTube's iframe will display its own error message for:
- Deleted videos
- Private videos
- Region-restricted videos
- Invalid video IDs

### 4. iframe Load Events May Not Fire Immediately

The `onLoad` event fires when the iframe loads, not when the video is ready to play. For video-specific events, you'd need YouTube's iframe API (not included in this component).

### 5. HTTPS Required

The component always uses HTTPS for embed URLs. If your site is served over HTTP, you may encounter mixed content warnings in some browsers.

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "YouTubeVideo requires a 'url' prop" | Missing or empty URL | Provide a valid YouTube URL |
| "Invalid YouTube URL format" | URL doesn't match supported formats | Use a standard YouTube URL format |

## Performance Tips

### 1. Consider Lazy Loading for Below-the-Fold Videos

For videos not immediately visible, you might want to conditionally render:

```jsx
function ProjectPage() {
  const [showVideo, setShowVideo] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(/* ... */);
    // Show video when scrolled into view
  }, []);
  
  return showVideo ? <YouTubeVideo url="..." /> : <div>Loading...</div>;
}
```

### 2. Cleanup is Automatic

The component handles cleanup on unmount - no manual cleanup needed.

### 3. Multiple Videos Impact Page Load

Each video iframe adds to page load time. Consider:
- Using `trackLoading={false}` for non-critical videos
- Lazy loading videos below the fold
- Limiting the number of videos per page

## Integration with PageLoader

The component works seamlessly with PageLoader when both use LoadingTrackerContext:

```jsx
import PageLoader from './components/PageLoader';
import YouTubeVideo from './components/YouTubeVideo';

function ProjectPage() {
  return (
    <PageLoader>
      <h1>My Project</h1>
      <YouTubeVideo url="https://youtu.be/VIDEO_ID" />
      {/* Page content hidden until video loads */}
    </PageLoader>
  );
}
```

## Troubleshooting

### Video Not Loading

1. Check browser console for errors
2. Verify URL format is correct
3. Test the URL directly in a browser
4. Check if video is available in your region
5. Verify internet connection

### Loading Tracking Not Working

1. Ensure LoadingTrackerContext provider wraps the component
2. Check that `trackLoading` prop is not set to `false`
3. Verify context is properly configured

### Multiple Videos Causing Issues

1. Each video should have a unique URL
2. Check browser console for resource ID conflicts (shouldn't happen, but worth checking)
3. Consider staggering video loads if performance is an issue
