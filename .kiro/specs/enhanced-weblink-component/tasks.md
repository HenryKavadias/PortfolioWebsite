# Implementation Plan: Enhanced WebLink Component

## Overview

This plan modifies the existing WebLink component at `src/components/WebLink.jsx` to support both internal and external navigation with flexible content display (text, images, or both). The implementation includes prop validation, automatic link type detection, appropriate element rendering, and comprehensive testing.

## Tasks

- [ ] 1. Implement core WebLink component logic
  - [x] 1.1 Add prop validation function
    - Implement `validateProps()` to check link requirement
    - Validate at least one of text or img is provided
    - Throw descriptive errors for invalid props
    - _Requirements: 1.3, 1.4, 2.4, 2.5, 9.1, 9.2_
  
  - [x] 1.2 Write property test for prop validation
    - **Property 1: Link Requirement**
    - **Property 2: Content Requirement**
    - **Validates: Requirements 1.3, 1.4, 2.4, 2.5**
  
  - [x] 1.3 Implement link type detection function
    - Create `isExternalLink()` to detect http://, https://, and // prefixes
    - Return boolean indicating external vs internal
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 1.4 Write property test for link type detection
    - **Property 3: External Link Detection**
    - **Property 4: Internal Link Detection**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

- [ ] 2. Implement content rendering logic
  - [x] 2.1 Create content rendering function
    - Implement `renderContent()` to handle text-only, image-only, and combined modes
    - Apply className="web-link-image" to all images
    - Set alt text based on content mode (text value when both, empty when image-only)
    - Ensure image renders before text when both provided
    - _Requirements: 2.1, 2.2, 2.3, 6.2, 7.1, 7.2, 7.3, 8.1_
  
  - [x] 2.2 Write unit tests for content rendering
    - Test text-only rendering
    - Test image-only rendering with empty alt
    - Test combined rendering with correct alt text and ordering
    - Test image className application
    - _Requirements: 2.1, 2.2, 2.3, 6.2, 7.1, 7.2, 7.3, 8.1_
  
  - [x] 2.3 Write property tests for content display
    - **Property 8: Text Content Display**
    - **Property 9: Image Element Rendering**
    - **Property 10: Combined Content Display**
    - **Property 11: Alt Text with Both Content**
    - **Property 12: Alt Text with Image Only**
    - **Validates: Requirements 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 8.1**

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement main component rendering
  - [x] 4.1 Wire validation, detection, and content rendering together
    - Call validateProps at component start
    - Use isExternalLink to determine element type
    - Render anchor tag for external links with target="_blank" and rel="noopener noreferrer"
    - Render React Router Link for internal links
    - Apply className="web-link" to all link elements
    - Pass rendered content to appropriate element
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1, 10.1, 10.2, 10.3, 10.4_
  
  - [x] 4.2 Write unit tests for element rendering
    - Test external link renders anchor with correct attributes
    - Test internal link renders React Router Link
    - Test className="web-link" applied to both types
    - Test no target/rel on internal links
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1_
  
  - [x] 4.3 Write property tests for rendering behavior
    - **Property 5: External Link Rendering**
    - **Property 6: Internal Link Rendering**
    - **Property 7: Styling Consistency**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 6.1**

- [x] 5. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The existing WebLink component will be modified rather than creating a new file
- All property tests reference specific properties from the design document
- Unit tests complement property tests by validating specific examples and edge cases
- Component must maintain compatibility with React 19.2.0 and React Router DOM 7.13.1
- No additional dependencies required beyond existing project setup
