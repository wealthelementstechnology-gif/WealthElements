# Prompt 1: Design System & Theme Toggle

## What This Builds
- Complete CSS design system with variables
- Dark/light theme toggle functionality
- Reusable component styles

## Files Created
1. `design-system.css` - Global design system
2. `theme.js` - Theme management JavaScript

---

## 📋 COPY-PASTE PROMPT BELOW

=== COPY FROM HERE ===

I need you to create a complete CSS design system and theme toggle for a financial planning web application called "WealthElements".

## Requirements:

### 1. Design System CSS (design-system.css)

Create a comprehensive CSS file with:

**CSS Variables:**
```css
:root {
  /* Primary Colors */
  --primary: #22c55e;           /* Green for success/positive actions */
  --primary-dark: #16a34a;
  --primary-light: #86efac;

  /* Secondary Colors */
  --secondary: #0ea5e9;         /* Blue for information */
  --secondary-dark: #0284c7;
  --secondary-light: #7dd3fc;

  /* Accent */
  --accent: #d97706;            /* Amber for warnings/highlights */
  --accent-dark: #b45309;
  --accent-light: #fbbf24;

  /* Grays */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;

  /* Semantic Colors */
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;

  /* Background variants */
  --success-bg: #dcfce7;
  --error-bg: #fee2e2;
  --warning-bg: #fef3c7;
  --info-bg: #dbeafe;

  /* Spacing Scale */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */

  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-base: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;
}

/* Dark Theme */
[data-theme="dark"] {
  --gray-50: #111827;
  --gray-100: #1f2937;
  --gray-200: #374151;
  --gray-300: #4b5563;
  --gray-400: #6b7280;
  --gray-500: #9ca3af;
  --gray-600: #d1d5db;
  --gray-700: #e5e7eb;
  --gray-800: #f3f4f6;
  --gray-900: #f9fafb;

  --success-bg: #064e3b;
  --error-bg: #7f1d1d;
  --warning-bg: #78350f;
  --info-bg: #1e3a8a;
}
```

**Base Reset & Typography:**
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: 1.5;
  color: var(--gray-900);
  background-color: var(--gray-50);
  transition: background-color var(--transition-base), color var(--transition-base);
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-semibold);
  line-height: 1.2;
  margin-bottom: var(--space-4);
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }
h4 { font-size: var(--text-xl); }
h5 { font-size: var(--text-lg); }
h6 { font-size: var(--text-base); }

p {
  margin-bottom: var(--space-4);
}

a {
  color: var(--primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-dark);
}
```

**Component Styles:**

Include these reusable components:

1. **Buttons:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  gap: var(--space-2);
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--gray-200);
  color: var(--gray-900);
}

.btn-secondary:hover {
  background: var(--gray-300);
}

.btn-danger {
  background: var(--error);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-lg {
  padding: var(--space-4) var(--space-8);
  font-size: var(--text-lg);
}

.btn-sm {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

2. **Cards:**
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  border: 1px solid var(--gray-200);
}

[data-theme="dark"] .card {
  background: var(--gray-800);
  border-color: var(--gray-700);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-3);
  color: var(--gray-900);
}

.card-content {
  color: var(--gray-700);
}
```

3. **Form Inputs:**
```css
.input-group {
  margin-bottom: var(--space-4);
}

label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--space-2);
  color: var(--gray-700);
}

input[type="text"],
input[type="number"],
input[type="email"],
input[type="password"],
select,
textarea {
  width: 100%;
  padding: var(--space-3);
  font-size: var(--text-base);
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-md);
  background: white;
  color: var(--gray-900);
  transition: all var(--transition-fast);
}

[data-theme="dark"] input,
[data-theme="dark"] select,
[data-theme="dark"] textarea {
  background: var(--gray-800);
  border-color: var(--gray-700);
  color: var(--gray-100);
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
}

.input-error {
  border-color: var(--error) !important;
}

.error-message {
  color: var(--error);
  font-size: var(--text-sm);
  margin-top: var(--space-2);
}
```

4. **Container & Layout:**
```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-sm {
  max-width: 768px;
}

.container-lg {
  max-width: 1400px;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-between {
  justify-content: space-between;
}

.gap-4 {
  gap: var(--space-4);
}

.grid {
  display: grid;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-4);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

@media (max-width: 768px) {
  .grid-2, .grid-3 {
    grid-template-columns: 1fr;
  }
}
```

5. **Alert/Badge Components:**
```css
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.alert-success {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid var(--success);
}

.alert-error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid var(--error);
}

.alert-warning {
  background: var(--warning-bg);
  color: var(--warning);
  border: 1px solid var(--warning);
}

.badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
}

.badge-primary {
  background: var(--primary);
  color: white;
}

.badge-secondary {
  background: var(--gray-200);
  color: var(--gray-900);
}
```

6. **Utility Classes:**
```css
.text-center { text-align: center; }
.text-right { text-align: right; }
.text-left { text-align: left; }

.mt-4 { margin-top: var(--space-4); }
.mb-4 { margin-bottom: var(--space-4); }
.ml-4 { margin-left: var(--space-4); }
.mr-4 { margin-right: var(--space-4); }

.pt-4 { padding-top: var(--space-4); }
.pb-4 { padding-bottom: var(--space-4); }
.pl-4 { padding-left: var(--space-4); }
.pr-4 { padding-right: var(--space-4); }

.font-bold { font-weight: var(--font-bold); }
.font-semibold { font-weight: var(--font-semibold); }
.font-medium { font-weight: var(--font-medium); }

.text-sm { font-size: var(--text-sm); }
.text-lg { font-size: var(--text-lg); }
.text-xl { font-size: var(--text-xl); }

.text-primary { color: var(--primary); }
.text-success { color: var(--success); }
.text-error { color: var(--error); }
.text-warning { color: var(--warning); }

.bg-primary { background-color: var(--primary); }
.bg-white { background-color: white; }
```

---

### 2. Theme Toggle JavaScript (theme.js)

Create a theme management class with:

```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
    this.setupToggle();
    this.setupListeners();
  }

  loadTheme() {
    // Load from localStorage, default to 'light'
    return localStorage.getItem('wealth-elements-theme') || 'light';
  }

  applyTheme(theme) {
    // Apply to document
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;

    // Save to localStorage
    localStorage.setItem('wealth-elements-theme', theme);

    // Update toggle button
    this.updateToggleIcon();

    // Broadcast theme change event
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: theme }
    }));

    console.log(`Theme changed to: ${theme}`);
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
  }

  setupToggle() {
    // Find toggle button (will be created in HTML)
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  }

  setupListeners() {
    // Listen for system theme preference changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        // Only auto-switch if user hasn't manually set theme
        if (!localStorage.getItem('wealth-elements-theme')) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  updateToggleIcon() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    // Update button content
    if (this.currentTheme === 'dark') {
      // Sun icon for switching to light
      toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `;
      toggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
      // Moon icon for switching to dark
      toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      `;
      toggle.setAttribute('aria-label', 'Switch to dark mode');
    }
  }

  getTheme() {
    return this.currentTheme;
  }
}

// Initialize theme manager when DOM is ready
let themeManager;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    window.themeManager = themeManager;
  });
} else {
  themeManager = new ThemeManager();
  window.themeManager = themeManager;
}

console.log('Theme system loaded');
```

---

## Expected Output:

Please generate:
1. Complete `design-system.css` file (500-600 lines)
2. Complete `theme.js` file (100+ lines)
3. Both files should be production-ready
4. Include all components mentioned above
5. Add comments explaining each section

## Testing Instructions:

After generating, I should be able to:
1. Create a simple HTML file
2. Link design-system.css
3. Link theme.js
4. Add a theme toggle button
5. See styles apply correctly
6. Toggle between light and dark themes

=== COPY UNTIL HERE ===
