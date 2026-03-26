# Portfolio Website

A personal portfolio website showcasing game development projects by Henry Kavadias-Barnes.

## Features

- Home page with bio and contact information
- Individual project showcase pages for multiple games
- Dynamic content loading from XML files
- YouTube video embedding with loading coordination
- Responsive design with custom styling

## Tech Stack

- **React 19.2.0** - UI framework
- **Vite 7.2.4** - Build tool and dev server
- **React Router DOM 7.13.1** - Client-side routing
- **ESLint** - Code linting

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Project Structure

```
src/
├── components/       # Reusable React components
│   ├── YouTubeVideo.jsx       # YouTube video embedding
│   ├── XMLFileRenderer.jsx    # XML content rendering
│   ├── WebLink.jsx            # Enhanced link component
│   ├── PageLoader.jsx         # Page loading coordination
│   └── ...
├── contexts/         # React context providers
│   └── LoadingTrackerContext.jsx
├── pages/           # Route-level page components
│   ├── Home.jsx
│   └── projects/    # Individual project pages
└── css/             # Component-specific styles

public/
├── content/         # XML content files by project
└── images/          # Static images by project
```

## Key Components

### YouTubeVideo

Embeds YouTube videos with loading tracking integration.

```jsx
import YouTubeVideo from './components/YouTubeVideo';

<YouTubeVideo 
  url="https://www.youtube.com/watch?v=VIDEO_ID"
  width={800}
  height={450}
  title="Video description"
/>
```

See [YouTubeVideo Usage Guide](.kiro/specs/youtube-video-component/USAGE.md) for detailed documentation.

### XMLFileRenderer

Dynamically loads and renders XML content files.

### PageLoader

Coordinates page loading states with resource tracking.

## Development

The project uses Vite for fast development with Hot Module Replacement (HMR). All components are functional components using React hooks.

### Code Quality

- ESLint configured with React-specific rules
- 100% test coverage for core components
- Property-based testing with fast-check

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
