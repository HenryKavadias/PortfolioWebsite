# Requirements Document: YouTube Video Component

## 1. Functional Requirements

### 1.1 Component Rendering
The YouTubeVideo component shall render a YouTube video iframe when provided with a valid YouTube URL.

**Acceptance Criteria**:
- Component accepts url as a required prop
- Component extracts video ID from the provided URL
- Component renders an iframe element with src pointing to YouTube embed URL
- iframe src follows format: `https://www.youtube.com/embed/${extractedVideoId}`

### 1.2 Props Validation
The component shall validate that required props are provided and in valid format before rendering.

**Acceptance Criteria**:
- Component throws Error if url prop is null
- Component throws Error if url prop is undefined
- Component throws Error if url prop is empty string
- Component throws Error if url format is invalid (not a recognized YouTube URL)
- Error message for missing url is: "YouTubeVideo requires a 'url' prop"
- Error message for invalid format is: "Invalid YouTube URL format"

### 1.3 Configurable Dimensions
The component shall support configurable width and height with sensible defaults.

**Acceptance Criteria**:
- Component accepts optional width prop (default: 560 pixels)
- Component accepts optional height prop (default: 315 pixels)
- iframe renders with specified width and height attributes
- Custom dimensions override defaults when provided

### 1.4 Accessibility Support
The component shall provide accessibility features for screen readers.

**Acceptance Criteria**:
- iframe includes title attribute
- Default title is "YouTube video player"
- Component accepts optional title prop to customize iframe title
- Custom title overrides default when provided

### 1.5 Loading Tracking Integration
The component shall integrate with LoadingTrackerContext for page loading coordination.

**Acceptance Criteria**:
- Component accepts optional trackLoading prop (default: true)
- When trackLoading is true, component registers resource with LoadingTrackerContext on mount
- Component marks resource complete when iframe loads successfully
- Component marks resource complete when iframe fails to load
- Component marks resource complete on unmount if not already loaded
- When trackLoading is false, component does not interact with LoadingTrackerContext

### 1.6 iframe Configuration
The component shall configure iframe with appropriate YouTube embed attributes.

**Acceptance Criteria**:
- iframe includes allow attribute with: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
- iframe includes allowFullScreen attribute set to true
- iframe includes frameBorder attribute set to "0"
- iframe uses HTTPS protocol in src URL

### 1.7 URL Format Support
The component shall support multiple YouTube URL formats.

**Acceptance Criteria**:
- Component accepts standard watch URLs: `https://www.youtube.com/watch?v=VIDEO_ID`
- Component accepts short URLs: `https://youtu.be/VIDEO_ID`
- Component accepts embed URLs: `https://www.youtube.com/embed/VIDEO_ID`
- Component handles URLs with query parameters (e.g., `&t=30s`)
- Component extracts video ID correctly from all supported formats

### 1.8 Multiple Instances Support
The component shall support multiple instances on the same page without conflicts.

**Acceptance Criteria**:
- Each component instance generates unique resourceId
- Multiple YouTubeVideo components can render on same page
- Each instance tracks loading independently
- No interference between component instances

## 2. Non-Functional Requirements

### 2.1 Performance
The component shall minimize performance impact on page load.

**Acceptance Criteria**:
- Component uses useRef to prevent unnecessary re-renders
- Component cleanup prevents memory leaks on unmount
- Resource registration happens only once per mount
- State updates are minimal (only on load/error events)

### 2.2 Security
The component shall follow security best practices for embedded content.

**Acceptance Criteria**:
- Embed URL uses HTTPS protocol exclusively
- Embed URL domain is hardcoded to youtube.com
- Video ID is extracted using safe parsing methods (no eval or dynamic code execution)
- URL validation prevents non-YouTube URLs from being processed
- iframe includes appropriate allow attributes for YouTube features

### 2.3 Reliability
The component shall handle error conditions gracefully.

**Acceptance Criteria**:
- Component continues to function when LoadingTrackerContext is unavailable
- iframe load failures do not crash the component
- iframe load failures are logged to console for debugging
- Page loading is not blocked by iframe failures

### 2.4 Maintainability
The component shall follow project conventions and patterns.

**Acceptance Criteria**:
- Component is a functional component using React hooks
- Component follows naming conventions (PascalCase for component name)
- Component file is placed in src/components/ directory
- Component exports as default export
- Props follow existing patterns (trackLoading similar to WebPageImage)

### 2.5 Reusability
The component shall be reusable across different pages and contexts.

**Acceptance Criteria**:
- Component has no hard-coded page-specific logic
- Component can be imported and used in any page component
- Component works in Home page, project pages, and future pages
- Component props provide sufficient customization options

### 2.6 Browser Compatibility
The component shall work in modern browsers.

**Acceptance Criteria**:
- Component uses standard React hooks (no experimental features)
- iframe element is supported in target browsers
- HTTPS YouTube embeds work in target browsers
- Component requires JavaScript enabled

## 3. Technical Requirements

### 3.1 React Version Compatibility
The component shall be compatible with React 19.2.0.

**Acceptance Criteria**:
- Component uses React hooks API
- Component is a functional component (not class component)
- No deprecated React features are used

### 3.2 Context Integration
The component shall integrate with LoadingTrackerContext when available.

**Acceptance Criteria**:
- Component imports LoadingTrackerContext from '../contexts/LoadingTrackerContext'
- Component uses useContext hook to access context
- Component checks for context existence before calling context methods
- Component follows same pattern as WebPageImage for loading tracking

### 3.3 File Structure
The component shall follow project file structure conventions.

**Acceptance Criteria**:
- Component file is named YouTubeVideo.jsx
- Component file is located in src/components/
- Component uses default export
- Optional: CSS file named YouTubeVideo.css in src/css/ (if styling needed)

### 3.4 Testing Requirements
The component shall include comprehensive test coverage.

**Acceptance Criteria**:
- Unit tests cover all functional requirements
- Unit tests achieve 100% line coverage
- Unit tests achieve 100% branch coverage
- Property-based tests validate key properties
- Tests use Vitest and React Testing Library (matching project patterns)

## 4. Constraints

### 4.1 External Dependencies
The component shall minimize external dependencies.

**Constraints**:
- No third-party YouTube libraries required
- Uses native iframe element
- Only depends on React and LoadingTrackerContext
- No additional npm packages needed

### 4.2 YouTube Platform
The component depends on YouTube's embed functionality.

**Constraints**:
- Requires internet connection to load videos
- Subject to YouTube's embed policies and availability
- Video availability depends on YouTube's content policies
- Embed features controlled by YouTube's iframe API

### 4.3 Project Build System
The component shall work with Vite build system.

**Constraints**:
- Compatible with Vite 7.2.4
- Uses ES modules syntax
- No build configuration changes required
- Works with existing Vite React plugin

## 5. Assumptions

### 5.1 LoadingTrackerContext Availability
It is assumed that LoadingTrackerContext is properly configured in the application.

**Assumptions**:
- Context provider wraps relevant page components
- Context provides registerResource and markResourceComplete methods
- Context handles resource tracking correctly
- Component gracefully handles missing context

### 5.2 Valid YouTube URLs
It is assumed that parent components provide valid YouTube URLs.

**Assumptions**:
- URLs are from youtube.com or youtu.be domains
- Parent components handle URL retrieval/storage
- Invalid video IDs within valid URLs are handled by YouTube's iframe (shows error message)
- Component validates URL format but not whether the video exists or is accessible

### 5.3 Browser Environment
It is assumed the component runs in a modern browser environment.

**Assumptions**:
- JavaScript is enabled
- iframe elements are supported
- HTTPS content can be loaded
- YouTube domain is not blocked by firewall/content filters

## 6. Dependencies

### 6.1 React Dependencies
- react (19.2.0): Core React library with hooks
- LoadingTrackerContext: Custom context for page loading coordination

### 6.2 Browser APIs
- iframe element: For embedding YouTube videos
- Fetch API: Used by YouTube's iframe (not directly by component)

### 6.3 External Services
- YouTube: Video hosting and embed service
- Requires: Internet connection, YouTube availability

## 7. Success Metrics

### 7.1 Functionality Metrics
- All acceptance criteria pass
- 100% test coverage achieved
- Zero runtime errors in normal usage
- Component successfully embeds videos on all portfolio pages

### 7.2 Performance Metrics
- Component mount time < 10ms
- No memory leaks detected in testing
- Page load time not significantly impacted by multiple video embeds
- Resource cleanup completes within 5ms of unmount

### 7.3 Quality Metrics
- Zero ESLint errors
- Zero ESLint warnings
- Code follows project conventions
- Component is documented with JSDoc comments (optional but recommended)
