# Requirements Document: Page Loading States

## Introduction

This document specifies requirements for implementing loading states in the portfolio website. Currently, content appears progressively as XML files and images load, creating a disjointed user experience with layout shifts and partial content flashes. This feature will ensure pages display content only when fully loaded, providing a smoother, more professional user experience.

## Glossary

- **PageLoader**: Wrapper component that manages page-level loading state
- **LoadingTracker**: Context system that tracks async resource loading status
- **Resource**: Any async content that must load before page display (XML files, images)
- **XMLFileRenderer**: Component that fetches and displays XML content files
- **Screenshot**: Component that displays project images
- **Pending Resource**: A resource that has been registered but not yet completed loading
- **Loading State**: Boolean indicating whether any resources are still loading

## Requirements

### Requirement 1: Unified Page Loading

**User Story:** As a portfolio visitor, I want pages to display content only when fully loaded, so that I don't see partial content, layout shifts, or progressive rendering.

#### Acceptance Criteria

1. WHEN a user navigates to a page, THE PageLoader SHALL display a loading indicator until all tracked resources complete
2. WHEN all tracked resources complete loading, THE PageLoader SHALL display the page content
3. WHILE resources are loading, THE PageLoader SHALL hide the page content from view
4. WHEN the loading state transitions to complete, THE PageLoader SHALL ensure a minimum display time for the loading indicator to prevent flashing

### Requirement 2: Resource Loading Tracking

**User Story:** As a developer, I want async components to automatically register with the loading tracker, so that the page knows when all content is ready.

#### Acceptance Criteria

1. WHEN an XMLFileRenderer component mounts, THE Component SHALL register itself as a pending resource with the LoadingTracker
2. WHEN an XMLFileRenderer completes loading content, THE Component SHALL mark itself as complete with the LoadingTracker
3. WHEN a Screenshot component mounts, THE Component SHALL register itself as a pending resource with the LoadingTracker
4. WHEN a Screenshot image loads successfully, THE Component SHALL mark itself as complete with the LoadingTracker
5. THE LoadingTracker SHALL maintain a set of all pending resource identifiers
6. THE LoadingTracker SHALL compute the loading state as true when any resources are pending

### Requirement 3: Error Handling and Recovery

**User Story:** As a portfolio visitor, I want pages to finish loading even when some content fails, so that I can view available content without being stuck on a loading screen.

#### Acceptance Criteria

1. WHEN an XMLFileRenderer fails to load content, THE Component SHALL mark itself as complete to unblock page loading
2. WHEN a Screenshot image fails to load, THE Component SHALL mark itself as complete to unblock page loading
3. IF a resource fails to load, THEN THE PageLoader SHALL still transition to displaying content when all other resources complete
4. WHEN a resource encounters an error, THE Component SHALL display an appropriate error message to the user

### Requirement 4: Component Lifecycle Management

**User Story:** As a developer, I want components to clean up their loading state when unmounted, so that navigation doesn't cause stuck loading states or memory leaks.

#### Acceptance Criteria

1. WHEN a component with a registered resource unmounts, THE Component SHALL mark its resource as complete with the LoadingTracker
2. WHEN a user navigates away during page load, THE PageLoader SHALL clean up all pending resources
3. WHEN an XMLFileRenderer unmounts before loading completes, THE Component SHALL cancel its fetch operation
4. THE LoadingTracker SHALL remove completed resources from its pending set

### Requirement 5: Loading State Consistency

**User Story:** As a developer, I want the loading state to accurately reflect resource status, so that the UI displays correctly based on actual loading progress.

#### Acceptance Criteria

1. THE LoadingTracker SHALL maintain the invariant that loading state equals true if and only if pending resources exist
2. WHEN a resource is registered, THE LoadingTracker SHALL add it to the pending set
3. WHEN a resource is marked complete, THE LoadingTracker SHALL remove it from the pending set
4. THE LoadingTracker SHALL handle duplicate resource registrations without creating inconsistent state
5. THE LoadingTracker SHALL handle completion of non-existent resources without errors

### Requirement 6: Minimum Loading Time

**User Story:** As a portfolio visitor, I want to avoid jarring flashes when content loads quickly, so that the experience feels smooth and polished.

#### Acceptance Criteria

1. THE PageLoader SHALL enforce a configurable minimum loading time before displaying content
2. WHEN all resources complete before the minimum time elapses, THE PageLoader SHALL continue showing the loading indicator until the minimum time is reached
3. WHEN all resources complete after the minimum time elapses, THE PageLoader SHALL immediately display content
4. THE PageLoader SHALL default to a minimum loading time of 300 milliseconds

### Requirement 7: Customizable Loading UI

**User Story:** As a developer, I want to customize the loading indicator, so that different pages can have appropriate loading experiences.

#### Acceptance Criteria

1. THE PageLoader SHALL accept an optional custom loading component via props
2. WHERE no custom loading component is provided, THE PageLoader SHALL display a default loading spinner
3. WHEN displaying the loading state, THE PageLoader SHALL render the provided or default loading component

### Requirement 8: Optional Loading Tracking

**User Story:** As a developer, I want to opt out of loading tracking for non-critical resources, so that optional content doesn't block page display.

#### Acceptance Criteria

1. THE XMLFileRenderer SHALL accept a trackLoading prop to control loading registration
2. THE Screenshot SHALL accept a trackLoading prop to control loading registration
3. WHERE trackLoading is false, THE Component SHALL not register with the LoadingTracker
4. WHERE trackLoading is true or undefined, THE Component SHALL register with the LoadingTracker
5. THE XMLFileRenderer SHALL default trackLoading to true
6. THE Screenshot SHALL default trackLoading to true

### Requirement 9: Context Availability

**User Story:** As a developer, I want components to handle missing LoadingTracker context gracefully, so that they can work standalone without crashing.

#### Acceptance Criteria

1. WHEN XMLFileRenderer is used outside a PageLoader, THE Component SHALL render normally without tracking
2. WHEN Screenshot is used outside a PageLoader, THE Component SHALL render normally without tracking
3. IF LoadingTracker context is unavailable, THEN THE Components SHALL fall back to standalone behavior without errors

### Requirement 10: Resource Identification

**User Story:** As a developer, I want each resource to have a unique identifier, so that the loading tracker can distinguish between multiple instances of the same component.

#### Acceptance Criteria

1. THE XMLFileRenderer SHALL generate a unique resource identifier on mount
2. THE Screenshot SHALL generate a unique resource identifier on mount
3. THE Resource identifier SHALL remain stable across component re-renders
4. THE Resource identifier SHALL include the resource type and source information
