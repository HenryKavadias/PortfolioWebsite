# Technology Stack

## Core Technologies
- **React 19.2.0** - UI library with latest features
- **Vite 7.2.4** - Build tool and dev server
- **JavaScript (ES Modules)** - No TypeScript currently used
- **CSS** - Standard CSS for styling

## Build System
- **Vite** - Fast build tool with HMR (Hot Module Replacement)
- **ESLint** - Code linting with React-specific rules
- **ES Modules** - Modern JavaScript module system

## Development Dependencies
- `@vitejs/plugin-react` - React support for Vite
- `eslint-plugin-react-hooks` - React Hooks linting rules
- `eslint-plugin-react-refresh` - React Fast Refresh support

## Common Commands

### Development
```bash
npm run dev          # Start development server with HMR
npm run preview      # Preview production build locally
```

### Build & Deploy
```bash
npm run build        # Create production build in dist/
```

### Code Quality
```bash
npm run lint         # Run ESLint on all files
```

## Development Server
- Runs on Vite's default port (usually 5173)
- Includes Hot Module Replacement for fast development
- Serves static assets from `public/` directory

## Build Output
- Production files generated in `dist/` directory
- Optimized and minified for deployment
- Static assets are processed and optimized