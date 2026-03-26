# Requirements: Purger Layout Redesign

## Overview

Redesign the Purger project page so the YouTube video and text content appear side-by-side (video left, text right), with screenshot images displayed below in a separate row.

Layout styles are placed in a shared CSS file (`ProjectPage.css`) so other project pages can adopt the same layout without duplicating CSS.

---

## Requirements

### 1. Hero Row Layout

**1.1** The Purger page MUST render a `div.project-hero` wrapper that contains `ContentBlock-B` (video) and `ContentBlock-A` (text) as direct children.

**Acceptance Criteria:**
- `div.project-hero` exists in the rendered DOM
- `ContentBlock-B` and `ContentBlock-A` are direct children of `project-hero`
- `ContentBlock-B` appears before `ContentBlock-A` in DOM order

---

**1.2** On viewports wider than 768px, `ContentBlock-B` (video) MUST render to the left of `ContentBlock-A` (text).

**Acceptance Criteria:**
- `.project-hero` has `display: flex` and `flex-direction: row`
- `ContentBlock-B` precedes `ContentBlock-A` in DOM order (flex order follows source order)

---

**1.3** On viewports 768px wide or narrower, the video MUST stack above the text.

**Acceptance Criteria:**
- A `@media (max-width: 768px)` rule sets `.project-hero { flex-direction: column }`

---

### 2. Screenshot Row Layout

**2.1** `ContentBlock-C` (screenshots) MUST render below the hero row, not inside it.

**Acceptance Criteria:**
- `ContentBlock-C` is a sibling of `div.project-hero`, not a descendant
- `ContentBlock-C` follows `div.project-hero` in DOM order

---

**2.2** Screenshots inside `ContentBlock-C` MUST wrap horizontally and be centred.

**Acceptance Criteria:**
- `.ContentBlock-C` has `display: flex`, `flex-wrap: wrap`, and `justify-content: center`

---

### 3. Shared CSS File

**3.1** A new shared file `src/css/ProjectPage.css` MUST be created containing all layout styles.

**Acceptance Criteria:**
- File exists at `src/css/ProjectPage.css`
- Contains rules for `.project-page`, `.project-hero`, `.ContentBlock-A`, `.ContentBlock-B`, `.ContentBlock-C`
- Includes responsive `@media (max-width: 768px)` block
- Contains no page-specific selectors (safe to import from any project page)

---

**3.2** `Purger.jsx` MUST import `ProjectPage.css`.

**Acceptance Criteria:**
- `import '../../css/ProjectPage.css'` (or equivalent relative path) is present in `Purger.jsx`

---

### 4. Existing Behaviour Preserved

**4.1** The `YouTubeVideo`, `XMLFileRenderer`, and `WebPageImage` component APIs MUST NOT be modified.

**Acceptance Criteria:**
- Props passed to each component in `Purger.jsx` are identical to the pre-redesign values
- No changes made to any component file outside `Purger.jsx`

---

**4.2** The `PageLoader` loading-spinner behaviour MUST remain unaffected.

**Acceptance Criteria:**
- `Purger.jsx` is still wrapped in `<PageLoader>`
- All resource registrations (video, images, XML) still fire correctly
