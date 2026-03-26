# Tasks: Purger Layout Redesign

## Task List

- [x] 1. Create `src/css/ProjectPage.css` with shared layout styles
  - [x] 1.1 Add `.project-page` root styles (max-width, margin, padding)
  - [x] 1.2 Add `.project-hero` flex row styles (display: flex, flex-direction: row, align-items: flex-start, gap)
  - [x] 1.3 Add `.ContentBlock-B` left column styles (flex: 0 0 auto, max-width: 560px)
  - [x] 1.4 Add `.ContentBlock-A` right column styles (flex: 1 1 0, min-width: 280px, text-align: left)
  - [x] 1.5 Add `.ContentBlock-C` extra content row styles (display: flex, flex-wrap: wrap, justify-content: center, gap)
  - [x] 1.6 Add `@media (max-width: 768px)` block switching `.project-hero` to `flex-direction: column`

- [x] 2. Update `src/pages/projects/Purger.jsx`
  - [x] 2.1 Import `../../css/ProjectPage.css`
  - [x] 2.2 Add `className="project-page"` to the page root div
  - [x] 2.3 Add `div.project-hero` wrapper around `ContentBlock-B` and `ContentBlock-A`
  - [x] 2.4 Reorder children so `ContentBlock-B` (video) comes before `ContentBlock-A` (text) inside `project-hero`
  - [x] 2.5 Ensure `ContentBlock-C` remains outside `project-hero` (sibling, not child)
