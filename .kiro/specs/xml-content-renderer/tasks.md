# Implementation Plan: XML Content Renderer

## Overview

This plan implements the XML Content Renderer feature by creating a new XMLFileRenderer component that parses XML content files and renders them as React components. The implementation will replace the existing TextFileRenderer component, eliminating the use of dangerouslySetInnerHTML and providing better security, structure, and maintainability.

## Tasks

- [ ] 1. Create XML parsing utilities
  - [x] 1.1 Implement parseXMLToReact function
    - Create src/utils/xmlParser.js file
    - Implement DOMParser-based XML parsing
    - Handle parser error detection
    - Return array of React elements
    - _Requirements: 2.1, 2.2, 2.3, 2.6_
  
  - [x] 1.2 Write property test for XML parsing
    - **Property 1: XML Parsing Produces Valid React Elements**
    - **Validates: Requirements 2.1, 2.2**
  
  - [x] 1.3 Implement convertNodeToReact function
    - Handle text nodes with whitespace trimming
    - Handle element nodes recursively
    - Process child nodes and maintain hierarchy
    - Assign unique React keys based on position
    - _Requirements: 2.4, 2.5, 8.1, 8.2, 8.3_
  
  - [x] 1.4 Write property test for hierarchy preservation
    - **Property 2: Hierarchy Preservation**
    - **Validates: Requirements 2.4, 8.2**
  
  - [x] 1.5 Write property test for text content preservation
    - **Property 3: Text Content Preservation**
    - **Validates: Requirements 2.5**

- [ ] 2. Implement tag mapping functionality
  - [x] 2.1 Implement mapTagToComponent function
    - Map paragraph/p tags to React p elements
    - Map bold/b tags to React strong elements
    - Map italic/i tags to React em elements
    - Map break/br tags to React br elements
    - Map heading tags with level attribute to h1-h6 elements
    - Map list tags with type attribute to ol/ul elements
    - Map item tags to React li elements
    - Map link tags with href to React anchor elements
    - Implement fallback to span for unsupported tags
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_
  
  - [x] 2.2 Implement extractAttributes helper function
    - Extract all attributes from XML node
    - Convert attributes to React props format
    - _Requirements: 4.1_
  
  - [x] 2.3 Write property test for attribute preservation
    - **Property 6: Attribute Preservation**
    - **Validates: Requirements 4.1, 6.4**
  
  - [x] 2.4 Write property test for heading level mapping
    - **Property 7: Heading Level Mapping**
    - **Validates: Requirements 3.5, 4.2**
  
  - [x] 2.5 Write property test for link href preservation
    - **Property 8: Link Href Preservation**
    - **Validates: Requirements 3.9, 4.3**

- [x] 3. Checkpoint - Ensure parsing utilities work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Create XMLFileRenderer component
  - [x] 4.1 Implement XMLFileRenderer component structure
    - Create src/components/XMLFileRenderer.jsx file
    - Accept fileName and className props
    - Set up state for content, loading, and error
    - _Requirements: 1.1, 5.4_
  
  - [x] 4.2 Implement fetchXMLFile function
    - Fetch XML file from public directory
    - Append .xml extension to fileName
    - Handle fetch errors with proper error messages
    - _Requirements: 1.1, 1.3, 9.1, 9.3_
  
  - [x] 4.3 Implement useEffect hook for content loading
    - Trigger fetch on component mount
    - Trigger fetch on fileName prop change
    - Parse fetched XML using parseXMLToReact
    - Update component state with parsed content
    - Handle errors and log to console
    - Clean up pending operations on unmount
    - _Requirements: 1.1, 1.2, 1.5, 5.5, 9.4, 9.5_
  
  - [x] 4.4 Implement render logic with state management
    - Display loading message during fetch
    - Display error message on failure
    - Render parsed React elements on success
    - Apply className prop to wrapper div
    - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4_
  
  - [x] 4.5 Write property test for fetch triggers
    - **Property 15: Fetch Triggers on Mount**
    - **Property 16: Fetch Triggers on Prop Change**
    - **Validates: Requirements 1.1, 1.2, 1.3, 11.3**
  
  - [x] 4.6 Write property test for error handling
    - **Property 18: Error Handling Without Crashes**
    - **Validates: Requirements 1.5, 5.3, 9.1, 9.2, 9.3**

- [x] 5. Checkpoint - Ensure XMLFileRenderer component works correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Migrate content files from .txt to .xml format
  - [x] 6.1 Convert Home page content files
    - Convert public/text/HomePage/AboutMe.txt to AboutMe.xml
    - Convert public/text/HomePage/Contact.txt to Contact.xml
    - Wrap content in root <content> element
    - Replace HTML tags with XML equivalents (b→bold, br→break)
    - Wrap plain text in <paragraph> tags
    - _Requirements: 7.1, 7.2, 11.2_
  
  - [x] 6.2 Convert Purger project content files
    - Convert public/text/Purger/P_Title.txt to P_Title.xml
    - Convert public/text/Purger/P_Content.txt to P_Content.xml
    - Apply same XML structure transformations
    - _Requirements: 7.1, 7.2, 11.2_
  
  - [x] 6.3 Convert Dodge West project content files
    - Convert public/text/DodgeWest/DW_Title.txt to DW_Title.xml
    - Convert public/text/DodgeWest/DW_Content.txt to DW_Content.xml
    - Apply same XML structure transformations
    - _Requirements: 7.1, 7.2, 11.2_
  
  - [x] 6.4 Convert Friend In Me project content files
    - Convert public/text/FriendInMe/FIM_Title.txt to FIM_Title.xml
    - Convert public/text/FriendInMe/FIM_Content.txt to FIM_Content.xml
    - Apply same XML structure transformations
    - _Requirements: 7.1, 7.2, 11.2_
  
  - [x] 6.5 Convert Egg Escape project content files
    - Convert public/text/EggEscape/EE_Title.txt to EE_Title.xml
    - Convert public/text/EggEscape/EE_Content.txt to EE_Content.xml
    - Apply same XML structure transformations
    - _Requirements: 7.1, 7.2, 11.2_
  
  - [x] 6.6 Convert Gambit And The Anchored project content files
    - Convert public/text/GambitAnchored/GA_Title.txt to GA_Title.xml
    - Convert public/text/GambitAnchored/GA_Content.txt to GA_Content.xml
    - Apply same XML structure transformations
    - _Requirements: 7.1, 7.2, 11.2_

- [x] 7. Update page components to use XMLFileRenderer
  - [x] 7.1 Update Home.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_
  
  - [x] 7.2 Update Purger.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_
  
  - [x] 7.3 Update DodgeWest.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_
  
  - [x] 7.4 Update FriendInMe.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_
  
  - [x] 7.5 Update EggEscape.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_
  
  - [x] 7.6 Update GambitAnchored.jsx
    - Import XMLFileRenderer instead of TextFileRenderer
    - Update component usage to use XMLFileRenderer
    - Verify rendering works correctly
    - _Requirements: 11.1, 11.4_

- [x] 8. Checkpoint - Verify all pages render correctly with XMLFileRenderer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Clean up old implementation
  - [x] 9.1 Remove old .txt content files
    - Delete all .txt files from public/content/ directory
    - Keep only .xml files

- [x] 10. Final checkpoint - Verify complete migration
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties from the design document
- Content migration is done incrementally by project to allow testing each page
- Both TextFileRenderer and XMLFileRenderer coexist during migration for safety
