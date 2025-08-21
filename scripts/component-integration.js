/**
 * Component Integration System
 * Ensures all components work together and respond to theme changes
 */

class ComponentIntegration {
    constructor() {
        this.components = new Map();
        this.themeController = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Wait for DOM and all components to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeComponents();
            });
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        // Wait a bit for all components to initialize
        setTimeout(() => {
            this.registerComponents();
            this.setupThemeIntegration();
            this.setupEventListeners();
            this.verifyIntegration();
            this.isInitialized = true;
            
            console.log('✅ Component integration complete');
        }, 200);
    }

    registerComponents() {
        // Register theme controller
        if (window.themeController) {
            this.components.set('themeController', window.themeController);
            this.themeController = window.themeController;
        }

        // Register skills enhancement
        if (window.skillsEnhancement) {
            this.components.set('skillsEnhancement', window.skillsEnhancement);
        }

        // Register contact animations
        if (window.contactAnimations) {
            this.components.set('contactAnimations', window.contactAnimations);
        }

        // Register falling leaves animation
        if (window.fallingLeavesAnimation) {
            this.components.set('fallingLeavesAnimation', window.fallingLeavesAnimation);
        }

        // Register coffee button (if it has a global instance)
        const coffeeButton = document.querySelector('.coffee-button');
        if (coffeeButton) {
            this.components.set('coffeeButton', coffeeButton);
        }

        console.log(`📦 Registered ${this.components.size} components`);
    }

    setupThemeIntegration() {
        if (!this.themeController) {
            console.warn('⚠️ Theme controller not found');
            return;
        }

        // Listen for theme changes and update all components
        window.addEventListener('themeChanged', (event) => {
            const { theme, themeData } = event.detail;
            this.handleThemeChange(theme, themeData);
        });

        // Apply initial theme to all components
        const currentTheme = this.themeController.getCurrentTheme();
        this.handleThemeChange(currentTheme.name, currentTheme.data);
    }

    handleThemeChange(theme, themeData) {
        console.log(`🎨 Applying theme: ${theme}`);

        // Update falling leaves animation
        const fallingLeaves = this.components.get('fallingLeavesAnimation');
        if (fallingLeaves && fallingLeaves.updateLeafColors) {
            fallingLeaves.currentTheme = theme;
            fallingLeaves.updateLeafColors();
        }

        // Update skills tooltips theme
        this.updateSkillsTooltips(theme);

        // Update contact form animations
        this.updateContactAnimations(theme);

        // Update coffee button theme
        this.updateCoffeeButton(theme);

        // Update any other theme-dependent elements
        this.updateMiscElements(theme);

        // Trigger a brief transition effect
        this.triggerThemeTransition();
    }

    updateSkillsTooltips(theme) {
        const tooltips = document.querySelectorAll('.skill-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.add('theme-transitioning');
            setTimeout(() => {
                tooltip.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    updateContactAnimations(theme) {
        // Contact animations automatically use CSS custom properties
        // Just ensure smooth transitions
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.classList.add('theme-transitioning');
            setTimeout(() => {
                contactForm.classList.remove('theme-transitioning');
            }, 300);
        }
    }

    updateCoffeeButton(theme) {
        const coffeeButton = this.components.get('coffeeButton');
        if (coffeeButton) {
            coffeeButton.classList.add('theme-transitioning');
            setTimeout(() => {
                coffeeButton.classList.remove('theme-transitioning');
            }, 300);
        }
    }

    updateMiscElements(theme) {
        // Update any other elements that need theme-specific handling
        const glassCards = document.querySelectorAll('.glass-card');
        glassCards.forEach(card => {
            card.classList.add('theme-transitioning');
            setTimeout(() => {
                card.classList.remove('theme-transitioning');
            }, 300);
        });

        // Update project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.classList.add('theme-transitioning');
            setTimeout(() => {
                card.classList.remove('theme-transitioning');
            }, 300);
        });

        // Update terminal
        const terminals = document.querySelectorAll('.terminal');
        terminals.forEach(terminal => {
            terminal.classList.add('theme-transitioning');
            setTimeout(() => {
                terminal.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    triggerThemeTransition() {
        // Add a brief transition class to the body
        document.body.classList.add('theme-transitioning');
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 300);
    }

    setupEventListeners() {
        // Handle window resize for all components
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change (pause animations when tab is not visible)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle scroll events for performance optimization
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 100);
        });
    }

    handleResize() {
        // Notify falling leaves animation
        const fallingLeaves = this.components.get('fallingLeavesAnimation');
        if (fallingLeaves && fallingLeaves.resizeCanvas) {
            fallingLeaves.resizeCanvas();
        }

        // Update any other components that need resize handling
        this.updateTooltipPositions();
    }

    handleVisibilityChange() {
        const fallingLeaves = this.components.get('fallingLeavesAnimation');
        if (!fallingLeaves) return;

        if (document.hidden) {
            // Pause animations when tab is not visible
            fallingLeaves.stop();
        } else {
            // Resume animations when tab becomes visible
            fallingLeaves.start();
        }
    }

    handleScroll() {
        // Optimize performance during scroll
        // Could pause non-essential animations or reduce quality
    }

    updateTooltipPositions() {
        // Force recalculation of tooltip positions on resize
        const tooltips = document.querySelectorAll('.skill-tooltip.visible');
        tooltips.forEach(tooltip => {
            // Hide and re-show to trigger position recalculation
            tooltip.classList.remove('visible');
            setTimeout(() => {
                tooltip.classList.add('visible');
            }, 50);
        });
    }

    verifyIntegration() {
        const issues = [];

        // Check theme controller
        if (!this.themeController) {
            issues.push('Theme controller not found');
        }

        // Check falling leaves
        if (!this.components.get('fallingLeavesAnimation')) {
            issues.push('Falling leaves animation not found');
        }

        // Check skills enhancement
        if (!this.components.get('skillsEnhancement')) {
            issues.push('Skills enhancement not found');
        }

        // Check contact animations
        if (!this.components.get('contactAnimations')) {
            issues.push('Contact animations not found');
        }

        // Check coffee button
        if (!this.components.get('coffeeButton')) {
            issues.push('Coffee button not found');
        }

        if (issues.length > 0) {
            console.warn('⚠️ Integration issues found:', issues);
        } else {
            console.log('✅ All components integrated successfully');
        }

        return issues.length === 0;
    }

    // Public methods for testing
    testThemeSwitch() {
        if (!this.themeController) {
            console.error('Theme controller not available');
            return;
        }

        console.log('🧪 Testing theme switch...');
        const currentTheme = this.themeController.currentTheme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.themeController.setTheme(newTheme);
        
        setTimeout(() => {
            this.themeController.setTheme(currentTheme);
            console.log('✅ Theme switch test complete');
        }, 2000);
    }

    testContactAnimation() {
        const contactAnimations = this.components.get('contactAnimations');
        if (!contactAnimations) {
            console.error('Contact animations not available');
            return;
        }

        console.log('🧪 Testing contact animation...');
        contactAnimations.triggerSuccessAnimation();
        console.log('✅ Contact animation test complete');
    }

    testFallingLeaves() {
        const fallingLeaves = this.components.get('fallingLeavesAnimation');
        if (!fallingLeaves) {
            console.error('Falling leaves animation not available');
            return;
        }

        console.log('🧪 Testing falling leaves...');
        fallingLeaves.restart();
        console.log('✅ Falling leaves test complete');
    }

    // Get component status
    getStatus() {
        return {
            initialized: this.isInitialized,
            components: Array.from(this.components.keys()),
            themeController: !!this.themeController,
            currentTheme: this.themeController?.currentTheme || 'unknown'
        };
    }
}

// Initialize component integration with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.componentIntegration = new ComponentIntegration();
        
        // Add performance monitoring integration
        if (window.performanceMonitor) {
            // Monitor component integration performance
            const integrationStart = performance.now();
            
            setTimeout(() => {
                const integrationTime = performance.now() - integrationStart;
                if (integrationTime > 1000) { // More than 1 second
                    console.warn('[ComponentIntegration] Slow integration detected:', integrationTime + 'ms');
                    if (window.performanceMonitor) {
                        window.performanceMonitor.handleError('Slow Component Integration', 
                            new Error(`Integration took ${integrationTime}ms`));
                    }
                }
            }, 1500);
        }
    } catch (error) {
        console.error('[ComponentIntegration] Initialization failed:', error);
        if (window.performanceMonitor) {
            window.performanceMonitor.handleError('Component Integration Error', error);
        }
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentIntegration;
}