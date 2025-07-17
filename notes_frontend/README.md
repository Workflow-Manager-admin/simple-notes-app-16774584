# Notes Frontend

A modern, clean, minimal notes application built with React.
Features:
- Create, edit, delete, list, and view notes in detail
- Minimal, light theme with a fixed sidebar for navigation
- Responsive/mobile-friendly with sidebar toggling
- All notes stored in localStorage (or switch to API by adjusting code)
- Easy to customize with brand colors or backend API by editing .env

## .env Usage

You can configure the storage (or endpoint) key by creating a `.env` file at the project root, e.g.:

```
REACT_APP_NOTES_KEY=my_app_notes
```

If you connect to an API, provide instead:

```
REACT_APP_API_BASE=https://your-api-root
```

## Run

```
npm install
npm start
```

## Customize Theme

Colors used:
- Primary: #1976d2
- Secondary: #424242
- Accent: #ffb300

## Folder Structure

- `src/App.js`      - All main app logic and components
- `src/App.css`     - Theme, layout, minimal styling

---
Built with ❤️ for KAVIA code gen demo.
