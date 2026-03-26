# Tasks: YouTube Video Component

## 1. Component Implementation

### 1.1 Create YouTubeVideo Component File
- [x] Create `src/components/YouTubeVideo.jsx` file
- [x] Set up functional component structure with proper imports
- [x] Add default export

### 1.2 Implement Props Validation
- [x] Create `validateProps()` function
- [x] Validate url is not null, undefined, or empty string
- [x] Throw error with message "YouTubeVideo requires a 'url' prop" when invalid

### 1.3 Implement Video ID Extraction
- [x] Create `extractVideoId()` function
- [x] Extract video ID from standard watch URL format (youtube.com/watch?v=ID)
- [x] Extract video ID from short URL format (youtu.be/ID)
- [x] Extract video ID from embed URL format (youtube.com/embed/ID)
- [x] Handle URLs with query parameters
- [x] Return null if URL format is not recognized
- [x] Throw error with message "Invalid YouTube URL format" when extraction fails

### 1.4 Implement Component State and Context
- [x] Import and use LoadingTrackerContext with useContext hook
- [x] Extract videoId from url prop using extractVideoId()
- [x] Create resourceId using useRef with format `youtube-${videoId}-${random()}`
- [x] Create iframeLoaded state using useState (default: false)
- [x] Create iframeLoadedRef using useRef (default: false)

### 1.5 Implement Loading Tracker Integration
- [x] Create useEffect for resource registration on mount
- [x] Register resource with context when trackLoading is true
- [x] Implement cleanup function to mark resource complete on unmount if not loaded
- [x] Add proper dependency array [trackLoading, context, resourceId]

### 1.6 Implement Event Handlers
- [x] Create handleIframeLoad function to set state and mark resource complete
- [x] Create handleIframeError function to set state, log error, and mark resource complete
- [x] Update iframeLoadedRef in both handlers

### 1.7 Implement URL Construction
- [x] Create embedUrl from extracted videoId using format `https://www.youtube.com/embed/${videoId}`

### 1.8 Implement iframe Rendering
- [x] Render iframe element with src={embedUrl}
- [x] Add width and height attributes from props
- [x] Add title attribute from props
- [x] Add onLoad={handleIframeLoad} handler
- [x] Add onError={handleIframeError} handler
- [x] Add allow attribute with YouTube features
- [x] Add allowFullScreen={true} attribute
- [x] Add frameBorder="0" attribute

## 2. Testing Implementation

### 2.1 Create Unit Test File
- [x] Create `src/components/YouTubeVideo.test.jsx` file
- [x] Set up test imports (Vitest, React Testing Library)
- [x] Create mock LoadingTrackerContext for testing

### 2.2 Implement Props Validation Tests
- [x] Test: throws error when url is null
- [x] Test: throws error when url is undefined
- [x] Test: throws error when url is empty string
- [x] Test: throws error when url format is invalid
- [x] Test: error message matches expected text for missing url
- [x] Test: error message matches expected text for invalid format

### 2.3 Implement Video ID Extraction Tests
- [x] Test: extracts video ID from standard watch URL
- [x] Test: extracts video ID from short URL (youtu.be)
- [x] Test: extracts video ID from embed URL
- [x] Test: handles URLs with query parameters
- [x] Test: returns null for non-YouTube URLs
- [x] Test: handles both HTTP and HTTPS protocols

### 2.4 Implement Rendering Tests
- [x] Test: renders iframe with correct src URL from standard YouTube URL
- [x] Test: renders iframe with correct src URL from short YouTube URL
- [x] Test: renders iframe with correct src URL from embed YouTube URL
- [x] Test: applies default width (560) when not provided
- [x] Test: applies default height (315) when not provided
- [x] Test: applies custom width when provided
- [x] Test: applies custom height when provided
- [x] Test: applies default title when not provided
- [x] Test: applies custom title when provided

### 2.5 Implement iframe Attributes Tests
- [x] Test: iframe includes allow attribute with correct features
- [x] Test: iframe includes allowFullScreen attribute
- [x] Test: iframe includes frameBorder="0" attribute
- [x] Test: iframe src uses HTTPS protocol

### 2.6 Implement Loading Tracker Tests
- [x] Test: calls registerResource on mount when trackLoading is true
- [x] Test: calls markResourceComplete on iframe load
- [x] Test: calls markResourceComplete on iframe error
- [x] Test: does not call context methods when trackLoading is false
- [x] Test: marks resource complete on unmount if not loaded
- [x] Test: does not crash when context is unavailable

### 2.7 Implement Multiple Instances Tests
- [x] Test: multiple components generate unique resourceIds
- [x] Test: multiple components on same page don't interfere

### 2.8 Create Property-Based Test File
- [x] Create `src/components/YouTubeVideo.property.test.jsx` file
- [x] Set up fast-check imports

### 2.9 Implement Property-Based Tests
- [x] Property test: Video ID extraction for any valid YouTube URL format
- [x] Property test: URL construction for any valid videoId
- [x] Property test: validation throws for any falsy url
- [x] Property test: validation throws for any non-YouTube URL
- [x] Property test: dimensions render correctly for any positive numbers
- [x] Property test: trackLoading boolean correctly enables/disables context
- [x] Property test: idempotency - same props produce same output

## 3. Integration and Documentation

### 3.1 Create CSS File (Optional)
- [x] Create `src/css/YouTubeVideo.css` if custom styling needed
- [x] Add responsive styles if needed
- [x] Import CSS in component file

### 3.2 Integration Testing
- [x] Test component in Home page context
- [x] Test component in project page context
- [x] Test multiple videos on same page
- [x] Verify loading tracking works with PageLoader

### 3.3 Code Quality
- [x] Run ESLint and fix any errors
- [x] Run ESLint and fix any warnings
- [x] Verify 100% test coverage
- [x] Add JSDoc comments to component (optional)

### 3.4 Example Usage Documentation
- [x] Create example usage in a test project page
- [x] Verify component works with different YouTube URL formats
- [x] Test error handling with invalid props
- [x] Document any gotchas or best practices

## 4. Verification and Deployment

### 4.1 Manual Testing
- [x] Test in development server (npm run dev)
- [x] Verify video loads and plays correctly
- [x] Test with different YouTube URL formats (standard, short, embed)
- [x] Test with multiple videos on same page
- [x] Test navigation between pages with videos
- [x] Test error scenarios (invalid URL, invalid video ID, network issues)

### 4.2 Performance Testing
- [x] Verify no memory leaks on mount/unmount cycles
- [x] Check component mount time is acceptable
- [x] Verify page load time with multiple videos
- [x] Test with slow network conditions

### 4.3 Browser Testing
- [x] Test in Chrome
- [x] Test in Firefox
- [x] Test in Safari (if available)
- [x] Test in Edge

### 4.4 Accessibility Testing
- [x] Verify iframe has proper title attribute
- [x] Test with screen reader (if available)
- [x] Verify keyboard navigation works
- [x] Check color contrast if custom styling added

### 4.5 Production Build
- [x] Run production build (npm run build)
- [x] Preview production build (npm run preview)
- [x] Verify component works in production build
- [x] Check bundle size impact

## 5. Completion Checklist

- [x] All unit tests pass
- [x] All property-based tests pass
- [x] 100% test coverage achieved
- [x] ESLint shows no errors or warnings
- [x] Component works in all target browsers
- [x] Component integrates properly with existing pages
- [x] Documentation is complete
- [x] Code follows project conventions
- [x] Performance requirements met
- [x] Ready for production deployment
