# Task 1: Project Scaffold

## Context
This is the first task of the baseEntry.addContent Configuration Tool — a pure-frontend Vite + React SPA.
Working directory: /Users/david.benshushan/Programs/Claude/mediaAPI

## Files to Create
- package.json
- vite.config.js
- index.html
- src/main.jsx
- src/App.jsx
- src/App.css
- src/test/setup.js
- .gitignore

## Steps

1. npm create vite@latest . -- --template react
   (select React → JavaScript, accept overwrite)

2. npm install

3. npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom

4. Replace vite.config.js with:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
})
```

5. Create src/test/setup.js:
```js
import '@testing-library/jest-dom'
```

6. Replace src/App.jsx with:
```jsx
import './App.css'

export default function App() {
  return <div className="app"><h1>baseEntry.addContent Tool</h1></div>
}
```

7. Replace src/App.css with:
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #f5f5f5; color: #222; }
.app { max-width: 1100px; margin: 0 auto; padding: 24px; }
h1 { font-size: 1.4rem; margin-bottom: 24px; }
```

8. Ensure package.json scripts includes:
```json
"test": "vitest run",
"test:watch": "vitest"
```

9. Run: npm run dev — verify it starts on http://localhost:5173 (then stop it)

10. Run: npm test — expected "No test files found" (passes with 0 tests)

11. git init && git add . && git commit -m "feat: scaffold Vite + React project with Vitest"

## Report
Write your report to: /Users/david.benshushan/Programs/Claude/mediaAPI/.superpowers/sdd/briefs/task-1-report.md
Return: status (DONE/BLOCKED/NEEDS_CONTEXT), the commit hash, test summary, concerns.
