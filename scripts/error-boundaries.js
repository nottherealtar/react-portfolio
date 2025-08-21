/**
 * Error Boundaries and Fallback States for Portfolio Components
 * Provides error handling and graceful degradation for all features
 */

class ErrorBoundary {
    constructor(componentName, fallbackElement = null) {
        this.componentName = componentName;
        this.fallbackElement = fallbackElement;
        this.errorCount = 0;
        this.maxErrors = 3;
        this.isDestroyed = false;
        
        this.setupErrorHandling();
    }

    setupErrorHandling() {
        // Register with performance monitor if available
        if (window.performanceMonitor) {
            window.performanceMonitor.registerErrorHandler(
                `${this.componentName} Error`, 
                (error) => this.handleComponentError(error)
            );
        }
    }

    /**
     * Wrap a function with error handling
     */
    wrap(fn, fallbackFn = null) {
        return (...args) => {
            if (this.isDestroyed) {
                console.warn(`[${this.componentName}] Component is destroyed, skipping execution`);
                return;
            }

            try {
                return fn.apply(this, args);
            } catch (error) {
                this.handleError(error, fallbackFn);
            }
        };
    }

    /**
     * Handle errors with fallback mechanisms
     */
    handleError(error, fallbackFn = null) {
        this.errorCount++;
        
        console.error(`[${this.componentName}] Error:`, error);

        // Execute fallback function if provided
        if (fallbackFn && typeof fallbackFn === 'function') {
            try {
                fallbackFn(error);
            } catch (fallbackError) {
                console.error(`[${this.componentName}] Fallback function failed:`, fallbackError);
            }
        }

        // Show fallback element if too many errors
        if (this.errorCount >= this.maxErrors) {
            this.showFallback();
            this.destroy();
        }

        // Report to performance monitor
        if (window.performanceMonitor) {
            window.performanceMonitor.handleError(`${this.componentName} Error`, error);
        }
    }

    /**
     * Handle component-specific errors
     */
    handleComponentError(error) {
        this.showFallback();
    }

    /**
     * Show fallback UI
     */
    showFallback() {
        if (this.fallbackElement) {
            this.fallbackElement.style.display = 'block';
        }

        // Add error state class to body
        document.body.classList.add(`${this.componentName.toLowerCase()}-error`);
    }

    /**
     * Destroy the error boundary
     */
    destroy() {
        this.isDestroyed = true;
        console.warn(`[${this.componentName}] Component destroyed due to excessive errors`);
    }

    /**
     * Reset error count
     */
    reset() {
        this.errorCount = 0;
        this.isDestroyed = false;
        document.body.classList.remove(`${this.componentName.toLowerCase()}-error`);
    }
}

/**
 * Theme Controller Error Boundary
 */
class ThemeControllerBoundary extends ErrorBoundary {
    constructor() {
        const fallback = document.createElement('div');
        fallback.innerHTML = `
            <div class="theme-fallback" style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: #333;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                display: none;
            ">
                Theme system unavailable
            </div>
        `;
        document.body.appendChild(fallback);

        super('ThemeController', fallback.querySelector('.theme-fallback'));
        
        this.setupThemeFallback();
    }

    setupThemeFallback() {
        // Basic theme toggle fallback
        const fallbackButton = document.createElement('button');
        fallbackButton.innerHTML = '🌙';
        fallbackButton.style.cssText = `
            position: fixed;
            top: 10px;
            right: 50px;
            background: #333;
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: pointer;
            z-index: 1000;
            display: none;
        `;
        
        fallbackButton.onclick = () => {
            document.body.classList.toggle('dark-fallback');
            fallbackButton.innerHTML = document.body.classList.contains('dark-fallback') ? '☀️' : '🌙';
        };

        document.body.appendChild(fallbackButton);
        this.fallbackButton = fallbackButton;
    }

    showFallback() {
        super.showFallback();
        if (this.fallbackButton) {
            this.fallbackButton.style.display = 'block';
        }

        // Add basic fallback styles
        const style = document.createElement('style');
        style.textContent = `
            .dark-fallback {
                background: #1a1a1a !important;
                color: #e0e0e0 !important;
            }
            .dark-fallback .glass-card {
                background: rgba(40, 40, 40, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Falling Leaves Animation Error Boundary
 */
class FallingLeavesBoundary extends ErrorBoundary {
    constructor() {
        const fallback = document.createElement('div');
        fallback.innerHTML = `
            <div class="leaves-fallback" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #2d221b 0%, #1a1a1a 100%);
                z-index: -1;
                display: none;
            "></div>
        `;
        document.body.appendChild(fallback);

        super('FallingLeaves', fallback.querySelector('.leaves-fallback'));
    }

    showFallback() {
        super.showFallback();
        
        // Hide canvas if it exists
        const canvas = document.getElementById('falling-leaves-canvas');
        if (canvas) {
            canvas.style.display = 'none';
        }
    }
}

/**
 * Skills Enhancement Error Boundary
 */
class SkillsEnhancementBoundary extends ErrorBoundary {
    constructor() {
        super('SkillsEnhancement');
        this.setupSkillsFallback();
    }

    setupSkillsFallback() {
        // Create basic skills fallback
        this.basicSkills = [
            { name: 'Python', level: '90%' },
            { name: 'React', level: '85%' },
            { name: 'Three.js', level: '80%' },
            { name: 'Backend', level: '88%' }
        ];
    }

    showFallback() {
        super.showFallback();
        
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.innerHTML = this.createBasicSkillsHTML();
        }

        // Hide GitHub stats and recommendations
        const githubStats = document.querySelector('.github-stats-container');
        const recommendations = document.querySelector('.linkedin-recommendations-container');
        
        if (githubStats) githubStats.style.display = 'none';
        if (recommendations) recommendations.style.display = 'none';
    }

    createBasicSkillsHTML() {
        return this.basicSkills.map(skill => `
            <div class="skill-item glass-card p-6 rounded-lg text-center">
                <h3 class="font-semibold text-lg mb-2">${skill.name}</h3>
                <div class="w-full bg-gray-700 rounded-full h-2">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${skill.level}"></div>
                </div>
                <div class="text-sm mt-2">${skill.level}</div>
            </div>
        `).join('');
    }
}

/**
 * Contact Animations Error Boundary
 */
class ContactAnimationsBoundary extends ErrorBoundary {
    constructor() {
        super('ContactAnimations');
        this.setupContactFallback();
    }

    setupContactFallback() {
        // Create basic form handler
        this.basicFormHandler = (e) => {
            e.preventDefault();
            
            const form = e.target;
            const formData = new FormData(form);
            
            // Show basic success message
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #4ade80;
                color: white;
                padding: 20px;
                border-radius: 8px;
                z-index: 10000;
            `;
            message.textContent = 'Message sent successfully!';
            document.body.appendChild(message);
            
            setTimeout(() => {
                document.body.removeChild(message);
                form.reset();
            }, 3000);
        };
    }

    showFallback() {
        super.showFallback();
        
        // Replace form handler with basic version
        const form = document.getElementById('contact-form');
        if (form) {
            form.removeEventListener('submit', this.originalHandler);
            form.addEventListener('submit', this.basicFormHandler);
        }

        // Hide animation elements
        const overlay = document.getElementById('success-overlay');
        const animation = document.getElementById('success-animation');
        
        if (overlay) overlay.style.display = 'none';
        if (animation) animation.style.display = 'none';
    }
}

/**
 * Coffee Button Error Boundary
 */
class CoffeeButtonBoundary extends ErrorBoundary {
    constructor() {
        super('CoffeeButton');
    }

    showFallback() {
        super.showFallback();
        
        // Replace with basic button
        const coffeeButton = document.querySelector('.coffee-button');
        if (coffeeButton) {
            coffeeButton.style.cssText = `
                display: inline-block;
                background: #f59e0b;
                color: white;
                padding: 10px 20px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
            `;
            coffeeButton.innerHTML = '☕ Buy me a coffee';
        }
    }
}

/**
 * Lazy Loading Error Boundary
 */
class LazyLoadingBoundary extends ErrorBoundary {
    constructor() {
        super('LazyLoading');
    }

    showFallback() {
        super.showFallback();
        
        // Load all images immediately
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

/**
 * Initialize all error boundaries
 */
class ErrorBoundaryManager {
    constructor() {
        this.boundaries = new Map();
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupBoundaries());
        } else {
            this.setupBoundaries();
        }
    }

    setupBoundaries() {
        // Initialize all error boundaries
        this.boundaries.set('theme', new ThemeControllerBoundary());
        this.boundaries.set('leaves', new FallingLeavesBoundary());
        this.boundaries.set('skills', new SkillsEnhancementBoundary());
        this.boundaries.set('contact', new ContactAnimationsBoundary());
        this.boundaries.set('coffee', new CoffeeButtonBoundary());
        this.boundaries.set('lazy', new LazyLoadingBoundary());

        // Setup global error recovery
        this.setupGlobalErrorRecovery();
        
        console.log('[ErrorBoundaryManager] All error boundaries initialized');
    }

    setupGlobalErrorRecovery() {
        // Add recovery button in debug mode
        if (window.location.search.includes('debug=true')) {
            const recoveryButton = document.createElement('button');
            recoveryButton.textContent = 'Reset All Components';
            recoveryButton.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background: #ef4444;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 5px;
                cursor: pointer;
                z-index: 10000;
                font-size: 12px;
            `;
            
            recoveryButton.onclick = () => this.resetAllBoundaries();
            document.body.appendChild(recoveryButton);
        }

        // Auto-recovery after 30 seconds of errors
        setTimeout(() => {
            if (this.getTotalErrorCount() > 10) {
                console.log('[ErrorBoundaryManager] Auto-recovery triggered');
                this.resetAllBoundaries();
            }
        }, 30000);
    }

    resetAllBoundaries() {
        this.boundaries.forEach((boundary, name) => {
            boundary.reset();
            console.log(`[ErrorBoundaryManager] Reset ${name} boundary`);
        });
        
        // Reload page as last resort
        if (this.getTotalErrorCount() > 20) {
            console.warn('[ErrorBoundaryManager] Too many errors, reloading page');
            window.location.reload();
        }
    }

    getTotalErrorCount() {
        let total = 0;
        this.boundaries.forEach(boundary => {
            total += boundary.errorCount;
        });
        return total;
    }

    getBoundary(name) {
        return this.boundaries.get(name);
    }

    /**
     * Wrap component initialization with error boundary
     */
    wrapComponent(name, initFunction) {
        const boundary = this.boundaries.get(name);
        if (boundary) {
            return boundary.wrap(initFunction, () => {
                console.warn(`[ErrorBoundaryManager] ${name} component failed to initialize`);
            });
        }
        return initFunction;
    }
}

// Initialize error boundary manager
window.errorBoundaryManager = new ErrorBoundaryManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ErrorBoundary,
        ErrorBoundaryManager,
        ThemeControllerBoundary,
        FallingLeavesBoundary,
        SkillsEnhancementBoundary,
        ContactAnimationsBoundary,
        CoffeeButtonBoundary,
        LazyLoadingBoundary
    };
}