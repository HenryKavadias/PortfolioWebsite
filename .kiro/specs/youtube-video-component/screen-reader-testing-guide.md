# Screen Reader Testing Guide - YouTubeVideo Component

## Overview
This guide provides instructions for testing the YouTubeVideo component with screen readers to verify accessibility compliance.

## Prerequisites

### Windows Screen Readers
- **NVDA (Free)**: Download from https://www.nvaccess.org/download/
- **JAWS (Commercial)**: Available from Freedom Scientific
- **Narrator (Built-in)**: Included with Windows 10/11

### macOS Screen Readers
- **VoiceOver (Built-in)**: Included with macOS (Cmd+F5 to toggle)

### Linux Screen Readers
- **Orca (Free)**: Usually pre-installed or available via package manager

## Quick Start - Testing with Windows Narrator

1. **Enable Narrator**:
   - Press `Windows + Ctrl + Enter` to start Narrator
   - Or: Settings > Accessibility > Narrator > Turn on Narrator

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Navigate to test page**:
   - Open browser to `http://localhost:5173/youtubetest`
   - Or test on Purger project page: `http://localhost:5173/purger`

4. **Test navigation**:
   - Press `Tab` to navigate through page elements
   - Listen for Narrator to announce each iframe
   - Verify the title attribute is read aloud

## Detailed Testing Procedures

### Test 1: Basic Title Announcement

**Objective**: Verify that screen readers announce the iframe title correctly.

**Steps**:
1. Start screen reader
2. Navigate to YouTubeTest page (`/youtubetest`)
3. Press `Tab` repeatedly to move through page elements
4. When focus reaches each video iframe, listen for announcement

**Expected Results**:
- Screen reader should announce: "Test 1: Standard YouTube URL, frame" (or similar)
- Each video should have a distinct, descriptive title
- Title should be announced before or with "frame" or "iframe"

**Pass Criteria**:
- ✅ All iframe titles are announced clearly
- ✅ Titles are descriptive and unique
- ✅ No iframes are announced as "untitled frame" or "frame"

### Test 2: Multiple Videos on Same Page

**Objective**: Verify that multiple video instances are distinguishable.

**Steps**:
1. Navigate to YouTubeTest page (has 5 videos)
2. Tab through all video iframes
3. Note the title announced for each

**Expected Results**:
- Each video should have a unique title:
  - "Test 1: Standard YouTube URL"
  - "Test 2: Short YouTube URL"
  - "Test 3: Embed YouTube URL"
  - "Test 4: YouTube URL with timestamp parameter"
  - "Test 5: Custom dimensions"

**Pass Criteria**:
- ✅ Each video is announced with its unique title
- ✅ User can distinguish between videos by title alone
- ✅ No confusion between multiple instances

### Test 3: Custom Title Attribute

**Objective**: Verify custom titles work correctly.

**Steps**:
1. Navigate to Purger project page (`/purger`)
2. Tab to the YouTube video
3. Listen for title announcement

**Expected Results**:
- Screen reader announces: "Purger Gameplay Trailer, frame"

**Pass Criteria**:
- ✅ Custom title is announced correctly
- ✅ Title is descriptive of the video content

### Test 4: Default Title Fallback

**Objective**: Verify default title is used when no custom title provided.

**Test Code** (add to YouTubeTest.jsx temporarily):
```jsx
<YouTubeVideo 
  url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  // No title prop - should use default
/>
```

**Expected Results**:
- Screen reader announces: "YouTube video player, frame"

**Pass Criteria**:
- ✅ Default title is announced when no custom title provided
- ✅ Default title is generic but descriptive

### Test 5: Keyboard Navigation

**Objective**: Verify keyboard users can navigate to and interact with videos.

**Steps**:
1. Navigate to YouTubeTest page
2. Use only keyboard (no mouse)
3. Press `Tab` to move through page
4. When focus reaches video, press `Enter` or `Space`

**Expected Results**:
- Tab key moves focus to iframe
- Visual focus indicator appears around iframe
- Enter/Space activates video controls (YouTube's built-in controls)
- User can interact with video using keyboard

**Pass Criteria**:
- ✅ Videos are reachable via Tab key
- ✅ Focus indicator is visible
- ✅ Video controls are keyboard accessible

### Test 6: Screen Reader Navigation Modes

**Objective**: Test different screen reader navigation modes.

**NVDA/JAWS Steps**:
1. Enable browse mode (default)
2. Press `F` to jump to next form element/frame
3. Press `Shift+F` to jump to previous frame

**VoiceOver Steps**:
1. Press `VO+Right Arrow` to navigate by element
2. Press `VO+Cmd+J` to jump to next frame

**Expected Results**:
- Screen reader can jump directly to frames
- Each frame is announced with its title
- User can navigate efficiently between videos

**Pass Criteria**:
- ✅ Frame navigation shortcuts work
- ✅ Videos are discoverable via screen reader navigation
- ✅ Titles help users identify content

## Common Screen Reader Commands

### Windows Narrator
- `Tab` - Move to next focusable element
- `Shift+Tab` - Move to previous focusable element
- `Caps Lock+Enter` - Activate current element
- `Caps Lock+Right Arrow` - Read next item
- `Caps Lock+Ctrl+Enter` - Exit Narrator

### NVDA
- `Tab` - Move to next focusable element
- `F` - Jump to next frame
- `Insert+Down Arrow` - Read current line
- `Insert+Q` - Exit NVDA

### VoiceOver (macOS)
- `VO` = `Ctrl+Option`
- `VO+Right Arrow` - Next item
- `VO+Left Arrow` - Previous item
- `VO+Space` - Activate item
- `Cmd+F5` - Exit VoiceOver

## Testing Checklist

### Accessibility Requirements
- [ ] All iframes have non-empty title attributes
- [ ] Titles are descriptive and meaningful
- [ ] Multiple videos have unique titles
- [ ] Default title is used when no custom title provided
- [ ] Videos are keyboard accessible (Tab navigation)
- [ ] Focus indicators are visible
- [ ] Screen reader announces iframe titles correctly
- [ ] Screen reader can navigate between multiple videos
- [ ] Frame navigation shortcuts work (F key in NVDA/JAWS)

### Browser Testing
- [ ] Test in Chrome with screen reader
- [ ] Test in Firefox with screen reader
- [ ] Test in Edge with screen reader
- [ ] Test in Safari with VoiceOver (if on macOS)

## Known Limitations

1. **YouTube iframe content**: The content inside the YouTube iframe (video controls, captions, etc.) is controlled by YouTube's accessibility implementation, not our component.

2. **Focus management**: When focus enters the iframe, the screen reader switches to the iframe's content. This is expected behavior.

3. **Video playback announcements**: Screen readers may not announce video playback state changes (playing, paused, etc.) unless YouTube's iframe includes ARIA live regions.

## Troubleshooting

### Issue: Screen reader doesn't announce title
**Solution**: 
- Verify iframe has title attribute in browser DevTools
- Try refreshing the page
- Try a different screen reader

### Issue: Can't tab to video
**Solution**:
- Ensure iframe is not hidden or display:none
- Check if other elements are capturing focus
- Verify tabindex is not set to -1

### Issue: Multiple videos announced with same title
**Solution**:
- Check that each YouTubeVideo component has unique title prop
- Verify props are being passed correctly

## Test Results Template

```markdown
## Screen Reader Test Results

**Date**: [Date]
**Tester**: [Name]
**Screen Reader**: [NVDA/JAWS/Narrator/VoiceOver/Orca]
**Browser**: [Chrome/Firefox/Edge/Safari]
**OS**: [Windows/macOS/Linux]

### Test 1: Basic Title Announcement
- Status: [PASS/FAIL]
- Notes: 

### Test 2: Multiple Videos
- Status: [PASS/FAIL]
- Notes: 

### Test 3: Custom Title
- Status: [PASS/FAIL]
- Notes: 

### Test 4: Default Title
- Status: [PASS/FAIL]
- Notes: 

### Test 5: Keyboard Navigation
- Status: [PASS/FAIL]
- Notes: 

### Test 6: Navigation Modes
- Status: [PASS/FAIL]
- Notes: 

### Overall Assessment
- [ ] Component meets accessibility requirements
- [ ] Issues found: [List any issues]
- [ ] Recommendations: [List any improvements]
```

## Additional Resources

- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [YouTube iframe API Accessibility](https://developers.google.com/youtube/iframe_api_reference)
