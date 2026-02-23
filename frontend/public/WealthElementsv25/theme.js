// Universal Theme Toggle Script for Wealth Elements
// This script provides dark/light mode functionality across all pages

(function() {
    'use strict';
    
    // Theme configuration
    const THEME_KEY = 'wealth-elements-theme';
    const DEFAULT_THEME = 'light';
    
    // Check if current page is an app (not dashboard)
    function isAppPage() {
        const path = window.location.pathname;
        return path.includes('8-events-calculator') || 
               path.includes('mutual-fund-analyzer') || 
               path.includes('financial-snapshot') || 
               path.includes('calculators') || 
               path.includes('tax-calculator');
    }
    
    // Initialize theme on page load
    function initTheme() {
        // All pages now use the saved theme from localStorage
        // The theme persists across the entire application
        const themeToUse = localStorage.getItem(THEME_KEY) || DEFAULT_THEME;

        document.documentElement.classList.toggle('dark', themeToUse === 'dark');
        document.body.setAttribute('data-theme', themeToUse);

        // Update any existing theme toggle buttons
        updateThemeToggles(themeToUse);

        // Dispatch theme change event for other scripts
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeToUse }
        }));
    }
    
    // Update theme toggle button states
    function updateThemeToggles(theme) {
        const toggles = document.querySelectorAll('.theme-toggle');
        
        toggles.forEach(toggle => {
            // Handle manual toggles with sun/moon icons (like Index.html)
            const sunIcon = toggle.querySelector('.sun-icon');
            const moonIcon = toggle.querySelector('.moon-icon');
            
            if (sunIcon && moonIcon) {
                // Update icon visibility for manual toggles
                if (theme === 'dark') {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'inline';
                } else {
                    sunIcon.style.display = 'inline';
                    moonIcon.style.display = 'none';
                }
            }
            
            // Update aria-label to reflect current state
            toggle.setAttribute('aria-label', 
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            );
        });
    }
    
    // Toggle theme function
    function toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        document.body.setAttribute('data-theme', newTheme);

        // Always save theme to localStorage so it persists across all pages
        localStorage.setItem(THEME_KEY, newTheme);

        updateThemeToggles(newTheme);

        // Dispatch theme change event
        document.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme }
        }));
    }
    
    // Add theme toggle functionality to all toggle buttons
    function setupThemeToggles() {
        const toggles = document.querySelectorAll('.theme-toggle');
        
        toggles.forEach(toggle => {
            // Remove any existing event listeners to prevent duplicates
            toggle.removeEventListener('click', toggleTheme);
            toggle.addEventListener('click', toggleTheme);
        });
    }
    
    // Create theme toggle button if it doesn't exist
    function createThemeToggle(container) {
        if (!container || container.querySelector('.theme-toggle')) {
            return;
        }
        
        const toggleHTML = `
            <button class="theme-toggle auto-created" aria-label="Toggle dark mode">
            </button>
        `;
        
        container.insertAdjacentHTML('beforeend', toggleHTML);
    }
    
    // Auto-create theme toggle only for index page
    function autoCreateThemeToggle() {
        // Only allow theme toggle creation on index page
        // All app pages should not have theme toggles
        if (isAppPage()) {
            return;
        }

        // Try to find a header or navigation area on index page
        const header = document.querySelector('header, .header, .navbar, .nav');
        if (header) {
            const container = header.querySelector('.container, .header-content, .nav-content') || header;
            createThemeToggle(container);
        }

        // Try to find a page header on index page
        const pageHeader = document.querySelector('.page-header');
        if (pageHeader) {
            createThemeToggle(pageHeader);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initTheme();
            setupThemeToggles();
            autoCreateThemeToggle();
        });
    } else {
        initTheme();
        setupThemeToggles();
        autoCreateThemeToggle();
    }
    
    // Expose functions globally for manual use
    window.WealthElementsTheme = {
        init: initTheme,
        toggle: toggleTheme,
        getCurrentTheme: () => document.body.getAttribute('data-theme'),
        setTheme: (theme) => {
            document.documentElement.classList.toggle('dark', theme === 'dark');
            document.body.setAttribute('data-theme', theme);

            // Always save theme to localStorage so it persists across all pages
            localStorage.setItem(THEME_KEY, theme);

            updateThemeToggles(theme);
            document.dispatchEvent(new CustomEvent('themeChanged', {
                detail: { theme: theme }
            }));
        }
    };
})();
