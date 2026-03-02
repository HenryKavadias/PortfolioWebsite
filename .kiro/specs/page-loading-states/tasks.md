# Implementation Plan: Page Loading States

## Overview

This implementation plan breaks down the page loading states feature into discrete, sequential tasks. The approach follows a bottom-up strategy: first building the core loading tracking infrastructure (context and utilities), then enhancing existing components to integrate with the tracker, creating the PageLoader wrapper, applying it to all pages, and finally adding comprehensive tests.

## Tasks

- [ ] 1. Create LoadingTrackerContext and core infrastructure
  - [x] 1.1 Create LoadingTrackerContext with provider component
    - Create `src/contexts/LoadingTrackerContext.jsx`
    - Implement context with `registerResource`, `markResourceComplete`, and `isLoading` state
    - Use Set to track pending resources for O(1) operations
    - Ensure loading state invariant: `isLoading = pendingResources.size > 0`
    - _Requirements: 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 1.2 Create DefaultLoadingSpinner component
    - Create `src/components/DefaultLoadingSpinner.jsx`
    - Implement simple CSS spinner animation
    - Create corresponding CSS file `src/css/DefaultLoadingSpinner.css`
    - _Requirements: 7.2_

- [ ] 2. Enhance XMLFileRenderer with loading tracking
  - [ ] 2.1 Integrate LoadingTrackerContext into XMLFileRenderer
    - Modify `src/components/XMLFileRenderer.jsx`
    - Add `trackLoading` prop (default true)
    - Generate stable resource ID using useRef with format `xml-${fileName}-${random}`
    - Register resource on mount when trackLoading is true
    - Mark complete after successful content load
    - Mark complete on error to prevent blocking
    - Mark complete on unmount for cleanup
    - Handle missing context gracefully (fallback to standalone behavior)
    - _Requirements: 2.1, 2.2, 3.1, 3.4, 4.1, 4.3, 8.1, 8.3, 8.4, 8.5, 9.1, 9.3, 10.1, 10.3, 10.4_
  
  - [ ]* 2.2 Write property test for XMLFileRenderer resource tracking
    - **Property 4: Component Registration**
    - **Property 5: Component Completion**
    - **Property 9: Resource Cleanup on Unmount**
    - **Validates: Requirements 2.1, 2.2, 4.1**

- [ ] 3. Enhance Screenshot component with loading tracking
  - [ ] 3.1 Integrate LoadingTrackerContext into Screenshot
    - Modify `src/components/Screenshot.jsx`
    - Add `trackLoading` prop (default true)
    - Generate stable resource ID using useRef with format `img-${src}-${random}`
    - Register resource on mount when trackLoading is true
    - Add onLoad handler to mark complete on successful load
    - Add onError handler to mark complete on error
    - Mark complete on unmount for cleanup
    - Handle missing context gracefully (fallback to standalone behavior)
    - _Requirements: 2.3, 2.4, 3.2, 4.1, 8.2, 8.3, 8.4, 8.6, 9.2, 9.3, 10.2, 10.3, 10.4_
  
  - [ ]* 3.2 Write property test for Screenshot resource tracking
    - **Property 4: Component Registration**
    - **Property 5: Component Completion**
    - **Property 9: Resource Cleanup on Unmount**
    - **Validates: Requirements 2.3, 2.4, 4.1**

- [ ] 4. Create PageLoader wrapper component
  - [ ] 4.1 Implement PageLoader component
    - Create `src/components/PageLoader.jsx`
    - Accept `children`, `loadingComponent`, and `minLoadingTime` props
    - Wrap children with LoadingTrackerContext provider
    - Track loading start time
    - Implement minimum loading time enforcement (default 300ms)
    - Conditionally render loading component or children based on state
    - Create corresponding CSS file `src/css/PageLoader.css` if needed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4, 7.1, 7.3_
  
  - [ ]* 4.2 Write property test for PageLoader
    - **Property 1: Loading State Consistency**
    - **Property 2: Content Display State**
    - **Property 3: Minimum Loading Time Enforcement**
    - **Validates: Requirements 1.1, 1.2, 1.3, 6.1, 6.2, 6.3**

- [ ] 5. Checkpoint - Verify core infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Apply PageLoader to all page components
  - [ ] 6.1 Wrap Home page with PageLoader
    - Modify `src/pages/Home.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.2 Wrap Purger page with PageLoader
    - Modify `src/pages/projects/Purger.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.3 Wrap DodgeWest page with PageLoader
    - Modify `src/pages/projects/DodgeWest.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.4 Wrap FriendInMe page with PageLoader
    - Modify `src/pages/projects/FriendInMe.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.5 Wrap EggEscape page with PageLoader
    - Modify `src/pages/projects/EggEscape.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 6.6 Wrap GambitAndTheAnchored page with PageLoader
    - Modify `src/pages/projects/GambitAndTheAnchored.jsx`
    - Import and wrap content with PageLoader component
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 7. Create comprehensive test suite
  - [ ]* 7.1 Write unit tests for LoadingTrackerContext
    - Create `src/contexts/LoadingTrackerContext.test.jsx`
    - Test resource registration
    - Test resource completion
    - Test loading state calculation
    - Test duplicate registrations
    - Test completion of non-existent resources
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 7.2 Write unit tests for PageLoader
    - Create `src/components/PageLoader.test.jsx`
    - Test loading component display
    - Test content display after loading
    - Test minimum loading time enforcement
    - Test custom loading component
    - Test context provision to children
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3_
  
  - [ ]* 7.3 Write unit tests for enhanced XMLFileRenderer
    - Create or modify `src/components/XMLFileRenderer.test.jsx`
    - Test resource registration on mount
    - Test completion after successful load
    - Test completion on error
    - Test completion on unmount
    - Test trackLoading prop behavior
    - Test graceful degradation without context
    - _Requirements: 2.1, 2.2, 3.1, 4.1, 4.3, 8.1, 8.3, 9.1_
  
  - [ ]* 7.4 Write unit tests for enhanced Screenshot
    - Create or modify `src/components/Screenshot.test.jsx`
    - Test resource registration on mount
    - Test completion on image load
    - Test completion on image error
    - Test completion on unmount
    - Test trackLoading prop behavior
    - Test graceful degradation without context
    - _Requirements: 2.3, 2.4, 3.2, 4.1, 8.2, 8.3, 9.2_
  
  - [ ]* 7.5 Write integration tests for full page loading flow
    - Create `src/components/PageLoader.integration.test.jsx`
    - Test full page load with multiple XMLFileRenderer and Screenshot components
    - Test mixed success/failure scenarios
    - Test navigation during load
    - Test error recovery
    - _Requirements: 1.1, 1.2, 1.3, 3.3, 4.2_
  
  - [ ]* 7.6 Write property-based tests for loading state invariants
    - Create `src/contexts/LoadingTrackerContext.property.test.jsx`
    - **Property 1: Loading State Consistency**
    - **Property 6: Resource Registration Idempotency**
    - **Property 7: Resource Completion Robustness**
    - **Validates: Requirements 5.1, 5.4, 5.5**

- [ ] 8. Final checkpoint - Verify complete implementation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The implementation follows a bottom-up approach: infrastructure first, then component enhancements, then integration
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All components handle missing context gracefully for backward compatibility
- Resource IDs use useRef for stability across re-renders
- Minimum loading time prevents jarring flashes on fast loads
