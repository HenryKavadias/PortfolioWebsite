# Project Structure

## Root Directory
```
henryportfoliowebsite/
├── .git/                 # Git repository
├── .kiro/               # Kiro AI assistant configuration
├── .vscode/             # VS Code settings
├── public/              # Static assets served directly
├── src/                 # Source code
├── dist/                # Build output (generated)
├── node_modules/        # Dependencies (generated)
└── config files         # Various configuration files
```

## Source Code Organization (`src/`)
```
src/
├── main.jsx            # Application entry point
├── App.jsx             # Main App component
├── assets/             # React/component assets
│   └── react.svg
└── css/                # Stylesheets
    ├── App.css         # App component styles
    └── index.css       # Global styles
```

## Key Conventions

### File Naming
- React components: PascalCase (e.g., `App.jsx`)
- Entry files: lowercase (e.g., `main.jsx`)
- CSS files: lowercase with component name (e.g., `App.css`)
- Assets: lowercase with descriptive names

### Import Patterns
- CSS imports in component files: `import './css/ComponentName.css'`
- Asset imports: `import logo from './assets/logo.svg'`
- Component imports: `import ComponentName from './ComponentName.jsx'`
- Absolute imports for public assets: `import '/vite.svg'`

### Component Structure
- Functional components with hooks
- Default exports for main components
- StrictMode wrapper in main.jsx for development checks

### Styling Approach
- Separate CSS files for each major component
- Global styles in `index.css`
- Component-specific styles in dedicated CSS files
- CSS classes follow kebab-case naming

### Static Assets
- Public assets (favicon, etc.) in `public/` - served at root
- Component assets in `src/assets/` - processed by Vite
- SVG files for logos and icons