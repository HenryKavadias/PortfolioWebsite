# Manual Testing Guide: YouTube Video Component

## Overview
This guide provides instructions for manually testing the YouTubeVideo component with different URL formats in a browser environment.

## Quick Start

### 1. Start the Development Server
The development server should already be running. If not, start it with:
```bash
npm run dev
```

The server will be available at: **http://localhost:5173/**

### 2. Navigate to the Test Page
Open your browser and go to:
```
http://localhost:5173/youtube-test
```

### 3. What You'll See
The test page displays 5 different test sections:
1. **Test 1**: Standard YouTube watch URL (`youtube.com/watch?v=...`)
2. **Test 2**: Short YouTube URL (`youtu.be/...`)
3. **Test 3**: Embed YouTube URL (`youtube.com/embed/...`)
4. **Test 4**: URL with query parameters (timestamp)
5. **Test 5**: Custom dimensions (larger video)

## What to Verify

### For Each Video:
- ✓ The video iframe loads without errors
- ✓ The video displays correctly (should be "Rick Astley - Never Gonna Give You Up")
- ✓ The play button works
- ✓ The video is playable
- ✓ The fullscreen button is available and functional

### Special Checks:
- **Test 4**: May start at 30 seconds (if YouTube respects the timestamp parameter)
- **Test 5**: Should be visibly larger than the other videos (800x450 vs 560x315)

### Overall Page:
- ✓ All 5 videos load simultaneously without conflicts
- ✓ No JavaScript errors in browser console (F12 → Console tab)
- ✓ All network requests to YouTube succeed (F12 → Network tab)

## Recording Results

Results should be documented in:
```
.kiro/specs/youtube-video-component/manual-test-results.md
```

Open that file and fill in:
- Actual results for each test case
- Any issues or unexpected behavior
- Browser information
- Test summary and sign-off

## Test Video Information

All tests use the same video ID: `dQw4w9WgXcQ`
- **Video**: Rick Astley - Never Gonna Give You Up
- **Why this video**: It's a well-known, publicly available video that's unlikely to be removed or restricted

## Troubleshooting

### Video doesn't load
- Check your internet connection
- Check browser console for errors
- Verify the development server is running
- Try refreshing the page

### Console errors
- Open browser DevTools (F12)
- Check Console tab for error messages
- Document any errors in the manual-test-results.md file

### Multiple videos cause issues
- This could indicate a problem with resource ID generation
- Check console for duplicate resource ID warnings
- Document the issue in manual-test-results.md

## Next Steps After Testing

1. Fill out the manual-test-results.md file completely
2. If all tests pass, mark task 4.1 as complete
3. If issues are found, document them and report to the development team
4. Proceed to remaining manual testing tasks (4.2-4.5) if applicable

## Files Created for This Test

- `src/pages/YouTubeTest.jsx` - Test page component
- `src/css/YouTubeTest.css` - Test page styles
- `src/App.jsx` - Updated with /youtube-test route
- `.kiro/specs/youtube-video-component/manual-test-results.md` - Results template
- `.kiro/specs/youtube-video-component/manual-testing-guide.md` - This guide

## Cleanup (Optional)

After testing is complete, you may optionally remove the test page:
- Remove `src/pages/YouTubeTest.jsx`
- Remove `src/css/YouTubeTest.css`
- Remove the `/youtube-test` route from `src/App.jsx`

However, keeping the test page can be useful for:
- Future regression testing
- Demonstrating component capabilities
- Quick visual verification after changes
