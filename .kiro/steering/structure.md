# Project Structure

## Directory Organization

```
src/
├── components/       # Reusable React components
├── contexts/         # React context providers (currently empty)
├── css/             # Stylesheets organized by component/page
├── pages/           # Route-level page components
│   └── projects/    # Individual project showcase pages
└── main.jsx         # Application entry point

public/
├── images/          # Static images organized by project
│   ├── DodgeWest/
│   ├── EggEscape/
│   ├── FriendInMe/
│   ├── GambitandtheAnchored/
│   └── Purger/
└── text/            # Text content files organized by project
    ├── DodgeWest/
    ├── EggEscape/
    ├── FriendInMe/
    ├── GambitAnchored/
    ├── HomePage/
    └── Purger/
```

## File Naming Conventions
- Components: PascalCase (e.g., `NavBar.jsx`, `TextFileRenderer.jsx`)
- Pages: PascalCase (e.g., `Home.jsx`, `Purger.jsx`)
- CSS files: Match component names (e.g., `NavBar.css` for `NavBar.jsx`)
- Text content: Project-specific prefixes with descriptive names (e.g., `DW_Content.txt`, `P_Title.txt`)

## Architecture Patterns

### Routing
- React Router DOM handles all navigation
- Routes defined in `App.jsx`
- Main route structure:
  - `/` - Home page
  - `/[projectname]` - Individual project pages (lowercase)

### Component Structure
- Functional components with hooks
- CSS imports at component level
- Components export as default

### Content Management
- Static text content stored in `public/text/` as `.txt` files
- Images stored in `public/images/` organized by project
- `TextFileRenderer` component fetches and displays text files dynamically
- Content organized by project folders for easy maintenance

### Styling
- CSS files co-located with components in `src/css/`
- Global styles in `index.css`
- Component-specific styles imported directly in components
