/**
 * ThemeController - Manages light/dark theme switching with persistence
 * Handles coffee-themed visual transitions and localStorage persistence
 */
class ThemeController {
  constructor() {
    this.currentTheme = 'light'; // Default to light theme
    this.themes = {
      light: {
        name: 'Morning Coffee',
        icon: this.getLightCoffeeIcon(), // Coffee cup with milk SVG
        colors: {
          primary: '#2d221b',
          secondary: '#a1866f',
          accent: '#f7efe2',
          background: 'rgba(45, 34, 27, 0.85)',
          text: '#f7efe2',
          cardBg: 'rgba(60, 40, 25, 0.18)'
        }
      },
      dark: {
        name: 'Evening Tea',
        icon: this.getDarkCoffeeIcon(), // Black coffee cup SVG
        colors: {
          primary: '#1a1a1a',
          secondary: '#4a3728',
          accent: '#8b7355',
          background: 'rgba(26, 26, 26, 0.9)',
          text: '#d4c4a8',
          cardBg: 'rgba(40, 30, 20, 0.25)'
        }
      }
    };
    
    this.toggleButton = null;
    this.init();
  }

  /**
   * Get light coffee cup SVG icon (coffee with milk)
   * @returns {string} SVG markup for light theme icon
   */
  getLightCoffeeIcon() {
    return `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 21h20v-2H2v2zM20 8h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3H0v2c0 2.21 1.79 4 4 4h1v3c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3h1c2.21 0 4-1.79 4-4v-2zM16 5v3H4V5h12zM6 19v-6h6v6H6z" fill="#f7efe2"/>
        <circle cx="9" cy="13" r="1.5" fill="#a1866f" opacity="0.8"/>
        <circle cx="7" cy="15" r="1" fill="#d4c4a8" opacity="0.6"/>
        <circle cx="11" cy="15" r="1" fill="#d4c4a8" opacity="0.6"/>
      </svg>
    `;
  }

  /**
   * Get dark coffee cup SVG icon (black coffee)
   * @returns {string} SVG markup for dark theme icon
   */
  getDarkCoffeeIcon() {
    return `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 21h20v-2H2v2zM20 8h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v3H0v2c0 2.21 1.79 4 4 4h1v3c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-3h1c2.21 0 4-1.79 4-4v-2zM16 5v3H4V5h12zM6 19v-6h6v6H6z" fill="#8b7355"/>
        <rect x="6" y="13" width="6" height="6" rx="1" fill="#2d1b14" opacity="0.9"/>
        <path d="M8 11c0.5-0.5 1-0.8 1.5-0.8s1 0.3 1.5 0.8" stroke="#6b5b47" stroke-width="0.5" fill="none" opacity="0.7"/>
        <path d="M7.5 10.5c0.3-0.3 0.7-0.5 1-0.5s0.7 0.2 1 0.5" stroke="#6b5b47" stroke-width="0.5" fill="none" opacity="0.5"/>
      </svg>
    `;
  }

  /**
   * Initialize the theme controller
   */
  init() {
    this.loadSavedTheme();
    this.createToggleButton();
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
  }

  /**
   * Load theme preference from localStorage
   */
  loadSavedTheme() {
    try {
      // Check if localStorage is supported
      if (!window.performanceMonitor || window.performanceMonitor.isFeatureSupported('localStorage')) {
        const savedTheme = localStorage.getItem('portfolio-theme');
        if (savedTheme && this.themes[savedTheme]) {
          this.currentTheme = savedTheme;
        }
      } else {
        console.warn('[ThemeController] localStorage not supported, using default theme');
      }
    } catch (error) {
      console.warn('[ThemeController] Could not load theme from localStorage:', error);
      // Report error to performance monitor
      if (window.performanceMonitor) {
        window.performanceMonitor.handleError('Theme Loading Error', error);
      }
      // Fallback to light theme
      this.currentTheme = 'light';
    }
  }

  /**
   * Save theme preference to localStorage
   */
  saveThemePreference() {
    try {
      localStorage.setItem('portfolio-theme', this.currentTheme);
    } catch (error) {
      console.warn('Could not save theme to localStorage:', error);
    }
  }

  /**
   * Create the theme toggle button
   */
  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle theme');
    this.toggleButton.setAttribute('title', `Switch to ${this.currentTheme === 'light' ? 'dark' : 'light'} theme`);
    
    // Set initial icon
    this.updateToggleButton();
    
    // Add to page
    document.body.appendChild(this.toggleButton);
  }

  /**
   * Update toggle button appearance based on current theme
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    const nextThemeData = this.themes[nextTheme];
    
    // Show the icon for the theme we'll switch TO (not the current theme)
    this.toggleButton.innerHTML = nextThemeData.icon;
    this.toggleButton.setAttribute('title', `Switch to ${nextThemeData.name}`);
    
    // Add smooth transition class
    this.toggleButton.classList.add('theme-toggle-transitioning');
    setTimeout(() => {
      this.toggleButton.classList.remove('theme-toggle-transitioning');
    }, 300);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });
    }

    // Listen for system theme changes (optional enhancement)
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('portfolio-theme')) {
          const newTheme = e.matches ? 'dark' : 'light';
          this.currentTheme = newTheme;
          this.applyTheme(newTheme);
          this.updateToggleButton();
        }
      });
    }
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.currentTheme = newTheme;
    this.applyTheme(newTheme);
    this.saveThemePreference();
    this.updateToggleButton();
    
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { theme: newTheme, themeData: this.themes[newTheme] }
    }));
  }

  /**
   * Apply theme to the document
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  applyTheme(theme) {
    if (!this.themes[theme]) {
      console.warn(`Theme '${theme}' not found, falling back to light theme`);
      theme = 'light';
    }

    // Set data attribute on document element for CSS targeting
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(theme);
    
    // Add transition class temporarily for smooth theme switching
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }

  /**
   * Update meta theme-color for mobile browsers
   * @param {string} theme - Current theme name
   */
  updateMetaThemeColor(theme) {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    const themeData = this.themes[theme];
    metaThemeColor.content = themeData.colors.primary;
  }

  /**
   * Get current theme data
   * @returns {Object} Current theme configuration
   */
  getCurrentTheme() {
    return {
      name: this.currentTheme,
      data: this.themes[this.currentTheme]
    };
  }

  /**
   * Set theme programmatically
   * @param {string} theme - Theme name to set
   */
  setTheme(theme) {
    if (this.themes[theme] && theme !== this.currentTheme) {
      this.currentTheme = theme;
      this.applyTheme(theme);
      this.saveThemePreference();
      this.updateToggleButton();
      
      window.dispatchEvent(new CustomEvent('themeChanged', {
        detail: { theme: theme, themeData: this.themes[theme] }
      }));
    }
  }

  /**
   * Check if dark theme is active
   * @returns {boolean} True if dark theme is active
   */
  isDarkTheme() {
    return this.currentTheme === 'dark';
  }

  /**
   * Get theme colors for use by other components
   * @returns {Object} Current theme colors
   */
  getThemeColors() {
    return this.themes[this.currentTheme].colors;
  }
}

// Auto-initialize when DOM is loaded with error handling
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Create global theme controller instance with error boundary
    const initThemeController = () => {
      window.themeController = new ThemeController();
    };

    // Wrap with error boundary if available
    if (window.errorBoundaryManager) {
      const wrappedInit = window.errorBoundaryManager.wrapComponent('theme', initThemeController);
      wrappedInit();
    } else {
      initThemeController();
    }
  } catch (error) {
    console.error('[ThemeController] Initialization failed:', error);
    
    // Fallback: basic theme toggle
    const fallbackButton = document.createElement('button');
    fallbackButton.textContent = 'Toggle Theme';
    fallbackButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000; padding: 8px 12px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;';
    fallbackButton.onclick = () => document.body.classList.toggle('dark-theme');
    document.body.appendChild(fallbackButton);
  }
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeController;
}