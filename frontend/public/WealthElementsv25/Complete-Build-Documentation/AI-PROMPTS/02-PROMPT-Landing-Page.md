# Prompt 2: Landing Page & Navigation

## What This Builds
- Main landing page with feature cards
- Navigation header
- Responsive layout

## Files Created
1. `index.html` - Main landing page
2. `index.css` - Landing page specific styles

---

## 📋 COPY-PASTE PROMPT BELOW

=== COPY FROM HERE ===

Create a landing page for WealthElements, a financial planning web application.

## Requirements:

### 1. HTML Structure (index.html)

Create an HTML file with:

**Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="WealthElements - Comprehensive financial planning tools for life goals, retirement, and investments">
  <title>WealthElements - Financial Planning Tool</title>

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="design-system.css">
  <link rel="stylesheet" href="index.css">
</head>
<body>
  <!-- HEADER -->
  <header class="main-header">
    <nav class="container">
      <div class="nav-content">
        <div class="logo">
          <h1>WealthElements</h1>
          <span class="tagline">Financial Planning Made Simple</span>
        </div>

        <div class="nav-actions">
          <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
            <!-- Icon will be injected by theme.js -->
          </button>
        </div>
      </div>
    </nav>
  </header>

  <!-- HERO SECTION -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h2 class="hero-title">Plan Your Financial Future</h2>
        <p class="hero-subtitle">
          Comprehensive financial planning tools for life goals, retirement planning,
          and intelligent investment allocation powered by machine learning.
        </p>
        <div class="hero-cta">
          <a href="8-events-calculator/index.html" class="btn btn-primary btn-lg">
            Start Planning →
          </a>
          <a href="#features" class="btn btn-secondary btn-lg">
            Learn More
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES SECTION -->
  <section id="features" class="features-section">
    <div class="container">
      <h2 class="section-title">Our Tools</h2>
      <p class="section-subtitle">Everything you need for comprehensive financial planning</p>

      <div class="features-grid">
        <!-- Feature Card 1: 8 Events Calculator -->
        <div class="feature-card card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <h3 class="feature-title">8 Events Financial Planning</h3>
          <p class="feature-description">
            Comprehensive 8-step wizard for planning major life events including retirement,
            education, marriage, and more. Features ML-powered goal optimization and
            Monte Carlo probability simulation.
          </p>
          <ul class="feature-list">
            <li>✓ Personal financial profile</li>
            <li>✓ Insurance gap analysis</li>
            <li>✓ Retirement corpus calculation</li>
            <li>✓ Goal optimization with ML</li>
            <li>✓ Probability analysis (Monte Carlo)</li>
            <li>✓ Investment allocation</li>
          </ul>
          <a href="8-events-calculator/index.html" class="btn btn-primary">
            Start Planning
          </a>
        </div>

        <!-- Feature Card 2: Financial Calculators -->
        <div class="feature-card card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="8" y1="10" x2="16" y2="10"/>
              <line x1="8" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="18" x2="12" y2="18"/>
            </svg>
          </div>
          <h3 class="feature-title">Financial Calculators</h3>
          <p class="feature-description">
            15+ specialized calculators for SIP, lumpsum investments, SWP,
            and various investment scenarios with visual charts.
          </p>
          <ul class="feature-list">
            <li>✓ SIP Future Value & Required SIP</li>
            <li>✓ Lumpsum Calculators</li>
            <li>✓ SWP (Systematic Withdrawal)</li>
            <li>✓ Combo Investment Scenarios</li>
            <li>✓ Interactive Charts</li>
          </ul>
          <a href="calculators/index.html" class="btn btn-primary">
            Explore Calculators
          </a>
        </div>

        <!-- Feature Card 3: Mutual Fund Analyzer -->
        <div class="feature-card card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="20" x2="12" y2="10"/>
              <line x1="18" y1="20" x2="18" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="16"/>
            </svg>
          </div>
          <h3 class="feature-title">Mutual Fund Analyzer</h3>
          <p class="feature-description">
            Analyze and compare 4000+ Indian mutual funds with advanced metrics
            like Sharpe Ratio, Sortino Ratio, and rolling returns.
          </p>
          <ul class="feature-list">
            <li>✓ 24 fund categories</li>
            <li>✓ Real-time NAV data</li>
            <li>✓ Advanced metrics (Sharpe, Sortino)</li>
            <li>✓ Direct vs Regular plan comparison</li>
            <li>✓ Rolling returns analysis</li>
          </ul>
          <a href="mutual-fund-analyzer/index.html" class="btn btn-primary">
            Analyze Funds
          </a>
        </div>

        <!-- Feature Card 4: Tax Calculator -->
        <div class="feature-card card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18v18H3zM12 8v8m-4-4h8"/>
            </svg>
          </div>
          <h3 class="feature-title">Tax Calculator</h3>
          <p class="feature-description">
            Calculate your income tax for multiple assessment years with
            old vs new regime comparison for Indian tax system.
          </p>
          <ul class="feature-list">
            <li>✓ Old vs New regime comparison</li>
            <li>✓ Multiple assessment years</li>
            <li>✓ Capital gains calculation</li>
            <li>✓ Rebates and exemptions</li>
            <li>✓ Visual tax comparison</li>
          </ul>
          <a href="tax-calculator/index.html" class="btn btn-primary">
            Calculate Tax
          </a>
        </div>

        <!-- Feature Card 5: Financial Snapshot -->
        <div class="feature-card card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          </div>
          <h3 class="feature-title">Financial Snapshot</h3>
          <p class="feature-description">
            Visual dashboard of your complete financial health including
            net worth, cash flow, and asset allocation.
          </p>
          <ul class="feature-list">
            <li>✓ Net worth calculation</li>
            <li>✓ Monthly cash flow analysis</li>
            <li>✓ Asset breakdown charts</li>
            <li>✓ Expense categorization</li>
          </ul>
          <a href="financial-snapshot/index.html" class="btn btn-primary">
            View Snapshot
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES HIGHLIGHTS -->
  <section class="highlights-section">
    <div class="container">
      <h2 class="section-title">Why WealthElements?</h2>

      <div class="grid grid-3">
        <div class="highlight-card">
          <div class="highlight-icon">🤖</div>
          <h3>ML-Powered Optimization</h3>
          <p>Machine learning algorithms optimize your financial goals based on your unique situation and budget constraints.</p>
        </div>

        <div class="highlight-card">
          <div class="highlight-icon">📊</div>
          <h3>Probability Analysis</h3>
          <p>Monte Carlo simulations run 10,000+ scenarios to show the probability of achieving your financial goals.</p>
        </div>

        <div class="highlight-card">
          <div class="highlight-icon">🔒</div>
          <h3>Privacy First</h3>
          <p>All data stays in your browser. No servers, no tracking, complete privacy for your financial information.</p>
        </div>

        <div class="highlight-card">
          <div class="highlight-icon">📱</div>
          <h3>Offline Capable</h3>
          <p>Works without internet (except mutual fund data). All calculations performed locally in your browser.</p>
        </div>

        <div class="highlight-card">
          <div class="highlight-icon">🎨</div>
          <h3>Beautiful Design</h3>
          <p>Clean, modern interface with dark mode support for comfortable viewing at any time of day.</p>
        </div>

        <div class="highlight-card">
          <div class="highlight-icon">🆓</div>
          <h3>Completely Free</h3>
          <p>No subscriptions, no hidden fees. All features available for free, forever.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="main-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4>WealthElements</h4>
          <p>Financial planning made simple with AI-powered tools.</p>
        </div>

        <div class="footer-section">
          <h4>Tools</h4>
          <ul>
            <li><a href="8-events-calculator/index.html">8 Events Planning</a></li>
            <li><a href="calculators/index.html">Calculators</a></li>
            <li><a href="mutual-fund-analyzer/index.html">Mutual Funds</a></li>
            <li><a href="tax-calculator/index.html">Tax Calculator</a></li>
          </ul>
        </div>

        <div class="footer-section">
          <h4>About</h4>
          <p>Built with TensorFlow.js, Chart.js, and modern web technologies.</p>
          <p class="text-sm text-gray-500">All data stored locally in your browser.</p>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2025 WealthElements. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- Scripts -->
  <script src="theme.js"></script>
</body>
</html>
```

---

### 2. Landing Page Styles (index.css)

```css
/* Hero Section */
.hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  padding: 6rem 0;
  text-align: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  opacity: 0.95;
  color: white;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Header */
.main-header {
  background: white;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

[data-theme="dark"] .main-header {
  background: var(--gray-800);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
}

.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--primary);
}

.tagline {
  font-size: 0.875rem;
  color: var(--gray-600);
  display: block;
}

.theme-toggle-btn {
  background: transparent;
  border: 1px solid var(--gray-300);
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.theme-toggle-btn:hover {
  background: var(--gray-100);
  transform: scale(1.05);
}

/* Features Section */
.features-section {
  padding: 4rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  text-align: center;
  color: var(--gray-600);
  font-size: 1.125rem;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.feature-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.feature-icon {
  width: 64px;
  height: 64px;
  background: var(--primary-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.feature-icon svg {
  color: var(--primary);
}

.feature-title {
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
}

.feature-description {
  color: var(--gray-700);
  margin-bottom: 1rem;
  flex-grow: 1;
}

.feature-list {
  list-style: none;
  margin-bottom: 1.5rem;
}

.feature-list li {
  padding: 0.25rem 0;
  color: var(--gray-700);
}

/* Highlights Section */
.highlights-section {
  background: var(--gray-100);
  padding: 4rem 0;
}

[data-theme="dark"] .highlights-section {
  background: var(--gray-900);
}

.highlight-card {
  text-align: center;
  padding: 2rem;
}

.highlight-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.highlight-card h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.highlight-card p {
  color: var(--gray-600);
  margin: 0;
}

/* Footer */
.main-footer {
  background: var(--gray-900);
  color: var(--gray-300);
  padding: 3rem 0 1rem;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: white;
  margin-bottom: 1rem;
}

.footer-section ul {
  list-style: none;
}

.footer-section ul li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: var(--gray-400);
  transition: color var(--transition-fast);
}

.footer-section a:hover {
  color: var(--primary-light);
}

.footer-bottom {
  border-top: 1px solid var(--gray-800);
  padding-top: 1rem;
  text-align: center;
  color: var(--gray-500);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    font-size: 2rem;
  }
}
```

---

## Expected Output:

Generate:
1. Complete `index.html` (200+ lines)
2. Complete `index.css` (200+ lines)
3. Responsive design
4. All links functional (will point to pages we'll build later)
5. Theme toggle integrated

=== COPY UNTIL HERE ===
