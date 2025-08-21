/**
 * Performance Monitor and Error Handling System
 * Monitors animation performance, handles browser compatibility, and provides fallbacks
 */

class PerformanceMonitor {
    constructor() {
        this.isSupported = {
            requestAnimationFrame: typeof requestAnimationFrame !== 'undefined',
            canvas: !!document.createElement('canvas').getContext,
            localStorage: this.checkLocalStorage(),
            intersectionObserver: 'IntersectionObserver' in window,
            customProperties: CSS.supports('color', 'var(--test)'),
            webgl: this.checkWebGL(),
            transforms3d: this.check3DTransforms()
        };

        this.performance = {
            animationFrames: [],
            memoryUsage: [],
            errorCount: 0,
            startTime: performance.now(),
            lastFrameTime: 0,
            frameCount: 0,
            averageFPS: 0,
            isLowPerformance: false
        };

        this.config = {
            maxFrameTime: 16.67, // 60 FPS target
            lowPerformanceThreshold: 30, // FPS threshold for low performance
            memoryCheckInterval: 30000, // 30 seconds
            maxErrorsBeforeFallback: 5,
            performanceReportInterval: 60000 // 1 minute
        };

        this.fallbacksEnabled = false;
        this.errorHandlers = new Map();
        
        this.init();
    }

    init() {
        this.setupErrorHandling();
        this.checkBrowserCompatibility();
        this.startPerformanceMonitoring();
        this.setupMemoryMonitoring();
        this.createPerformanceIndicator();
        
        // Log initial system info
        this.logSystemInfo();
    }

    /**
     * Check browser compatibility and enable fallbacks if needed
     */
    checkBrowserCompatibility() {
        const unsupportedFeatures = [];

        // Check critical features
        if (!this.isSupported.requestAnimationFrame) {
            unsupportedFeatures.push('requestAnimationFrame');
            this.enableAnimationFallback();
        }

        if (!this.isSupported.canvas) {
            unsupportedFeatures.push('canvas');
            this.disableCanvasAnimations();
        }

        if (!this.isSupported.intersectionObserver) {
            unsupportedFeatures.push('IntersectionObserver');
            this.enableScrollFallback();
        }

        if (!this.isSupported.customProperties) {
            unsupportedFeatures.push('CSS Custom Properties');
            this.enableCSSFallback();
        }

        if (unsupportedFeatures.length > 0) {
            console.warn('Unsupported features detected:', unsupportedFeatures);
            this.enableGracefulDegradation();
        }

        // Add browser compatibility class to body
        document.body.classList.add(this.getBrowserClass());
    }

    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });

        // Resource loading error handler
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleResourceError(event.target);
            }
        }, true);
    }

    /**
     * Handle errors with fallback mechanisms
     */
    handleError(type, error, details = {}) {
        this.performance.errorCount++;
        
        const errorInfo = {
            type,
            message: error?.message || error,
            stack: error?.stack,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...details
        };

        console.error(`[PerformanceMonitor] ${type}:`, errorInfo);

        // Enable fallbacks if too many errors
        if (this.performance.errorCount >= this.config.maxErrorsBeforeFallback) {
            this.enableEmergencyFallbacks();
        }

        // Trigger error-specific fallbacks
        this.triggerErrorFallback(type, error);
    }

    /**
     * Handle resource loading errors
     */
    handleResourceError(element) {
        const tagName = element.tagName.toLowerCase();
        const src = element.src || element.href;

        console.warn(`[PerformanceMonitor] Resource failed to load: ${tagName} - ${src}`);

        switch (tagName) {
            case 'script':
                this.handleScriptError(element);
                break;
            case 'link':
                this.handleStylesheetError(element);
                break;
            case 'img':
                this.handleImageError(element);
                break;
            case 'iframe':
                this.handleIframeError(element);
                break;
        }
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.isSupported.requestAnimationFrame) return;

        const monitorFrame = (timestamp) => {
            if (this.performance.lastFrameTime) {
                const frameTime = timestamp - this.performance.lastFrameTime;
                this.performance.animationFrames.push(frameTime);

                // Keep only last 60 frames for rolling average
                if (this.performance.animationFrames.length > 60) {
                    this.performance.animationFrames.shift();
                }

                // Calculate average FPS
                const avgFrameTime = this.performance.animationFrames.reduce((a, b) => a + b, 0) / this.performance.animationFrames.length;
                this.performance.averageFPS = 1000 / avgFrameTime;

                // Check for low performance
                if (this.performance.averageFPS < this.config.lowPerformanceThreshold) {
                    if (!this.performance.isLowPerformance) {
                        this.performance.isLowPerformance = true;
                        this.enablePerformanceFallbacks();
                    }
                }
            }

            this.performance.lastFrameTime = timestamp;
            this.performance.frameCount++;

            requestAnimationFrame(monitorFrame);
        };

        requestAnimationFrame(monitorFrame);
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if (!performance.memory) return;

        setInterval(() => {
            const memInfo = {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                timestamp: Date.now()
            };

            this.performance.memoryUsage.push(memInfo);

            // Keep only last 10 measurements
            if (this.performance.memoryUsage.length > 10) {
                this.performance.memoryUsage.shift();
            }

            // Check for memory issues
            const memoryUsagePercent = (memInfo.used / memInfo.limit) * 100;
            if (memoryUsagePercent > 80) {
                console.warn('[PerformanceMonitor] High memory usage detected:', memoryUsagePercent.toFixed(2) + '%');
                this.enableMemoryOptimizations();
            }
        }, this.config.memoryCheckInterval);
    }

    /**
     * Create performance indicator for debugging
     */
    createPerformanceIndicator() {
        if (window.location.search.includes('debug=true')) {
            const indicator = document.createElement('div');
            indicator.id = 'performance-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 10000;
                min-width: 200px;
            `;
            document.body.appendChild(indicator);

            setInterval(() => {
                const fps = this.performance.averageFPS.toFixed(1);
                const errors = this.performance.errorCount;
                const memory = performance.memory ? 
                    (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + ' MB' : 
                    'N/A';

                indicator.innerHTML = `
                    <div>FPS: ${fps}</div>
                    <div>Errors: ${errors}</div>
                    <div>Memory: ${memory}</div>
                    <div>Low Perf: ${this.performance.isLowPerformance ? 'Yes' : 'No'}</div>
                `;
            }, 1000);
        }
    }

    /**
     * Enable fallbacks for older browsers
     */
    enableGracefulDegradation() {
        document.body.classList.add('fallback-mode');
        
        // Disable complex animations
        const style = document.createElement('style');
        style.textContent = `
            .fallback-mode * {
                animation-duration: 0s !important;
                transition-duration: 0s !important;
                transform: none !important;
            }
            .fallback-mode .falling-leaves-canvas {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        console.log('[PerformanceMonitor] Graceful degradation enabled');
    }

    /**
     * Enable performance fallbacks for low-end devices
     */
    enablePerformanceFallbacks() {
        document.body.classList.add('low-performance');
        
        // Reduce animation complexity
        if (window.fallingLeavesAnimation) {
            window.fallingLeavesAnimation.config.leafCount = Math.min(8, window.fallingLeavesAnimation.config.leafCount);
        }

        // Disable auto-play for carousels
        const carousels = document.querySelectorAll('.testimonial-carousel-container');
        carousels.forEach(carousel => {
            carousel.classList.add('no-autoplay');
        });

        console.log('[PerformanceMonitor] Performance fallbacks enabled');
    }

    /**
     * Enable memory optimizations
     */
    enableMemoryOptimizations() {
        // Clear animation frame arrays
        this.performance.animationFrames = this.performance.animationFrames.slice(-30);
        
        // Reduce particle count
        if (window.fallingLeavesAnimation) {
            window.fallingLeavesAnimation.config.leafCount = Math.max(5, window.fallingLeavesAnimation.config.leafCount - 3);
        }

        console.log('[PerformanceMonitor] Memory optimizations enabled');
    }

    /**
     * Enable emergency fallbacks
     */
    enableEmergencyFallbacks() {
        document.body.classList.add('emergency-fallback');
        
        // Disable all animations
        const style = document.createElement('style');
        style.textContent = `
            .emergency-fallback * {
                animation: none !important;
                transition: none !important;
                transform: none !important;
            }
            .emergency-fallback canvas {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Stop all animations
        if (window.fallingLeavesAnimation) {
            window.fallingLeavesAnimation.stop();
        }

        console.error('[PerformanceMonitor] Emergency fallbacks enabled due to excessive errors');
    }

    /**
     * Handle specific script errors
     */
    handleScriptError(scriptElement) {
        const src = scriptElement.src;
        
        if (src.includes('gsap')) {
            this.disableGSAPAnimations();
        } else if (src.includes('three')) {
            this.disableThreeJSFeatures();
        } else if (src.includes('theme-controller')) {
            this.enableThemeFallback();
        }
    }

    /**
     * Handle stylesheet errors
     */
    handleStylesheetError(linkElement) {
        const href = linkElement.href;
        console.warn(`[PerformanceMonitor] Stylesheet failed to load: ${href}`);
        
        // Add fallback styles
        if (href.includes('themes.css')) {
            this.addFallbackThemeStyles();
        }
    }

    /**
     * Handle image errors
     */
    handleImageError(imgElement) {
        imgElement.style.display = 'none';
        
        // Show fallback if it's an avatar
        const fallback = imgElement.nextElementSibling;
        if (fallback && fallback.classList.contains('author-avatar-fallback')) {
            fallback.style.display = 'flex';
        }
    }

    /**
     * Handle iframe errors (GitHub stats)
     */
    handleIframeError(iframeElement) {
        if (iframeElement.classList.contains('github-stats-iframe')) {
            const container = iframeElement.closest('.github-stats-wrapper');
            if (container) {
                const loading = container.querySelector('.github-loading');
                const content = container.querySelector('.github-stats-content');
                const fallback = container.querySelector('.github-fallback');
                
                if (loading) loading.classList.add('hidden');
                if (content) content.classList.add('hidden');
                if (fallback) fallback.classList.remove('hidden');
            }
        }
    }

    /**
     * Utility methods for feature detection
     */
    checkLocalStorage() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    check3DTransforms() {
        const el = document.createElement('div');
        el.style.transform = 'translate3d(1px,1px,1px)';
        return el.style.transform !== '';
    }

    getBrowserClass() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome')) return 'browser-chrome';
        if (ua.includes('Firefox')) return 'browser-firefox';
        if (ua.includes('Safari')) return 'browser-safari';
        if (ua.includes('Edge')) return 'browser-edge';
        return 'browser-unknown';
    }

    /**
     * Specific fallback methods
     */
    enableAnimationFallback() {
        // Polyfill for requestAnimationFrame
        window.requestAnimationFrame = window.requestAnimationFrame || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame || 
            function(callback) { return setTimeout(callback, 16); };
    }

    disableCanvasAnimations() {
        document.body.classList.add('no-canvas');
        if (window.fallingLeavesAnimation) {
            window.fallingLeavesAnimation.stop();
        }
    }

    enableScrollFallback() {
        // Fallback for IntersectionObserver
        window.addEventListener('scroll', () => {
            const elements = document.querySelectorAll('[data-animate-on-scroll]');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    el.classList.add('animate-in');
                }
            });
        });
    }

    enableCSSFallback() {
        // Add fallback styles for CSS custom properties
        this.addFallbackThemeStyles();
    }

    addFallbackThemeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Fallback theme styles */
            :root {
                --coffee-primary: #2d221b;
                --coffee-secondary: #a1866f;
                --coffee-accent: #f7efe2;
                --coffee-background: rgba(45, 34, 27, 0.85);
            }
            
            .glass-card {
                background: rgba(60, 40, 25, 0.18) !important;
                border: 1px solid rgba(247, 239, 226, 0.18) !important;
            }
        `;
        document.head.appendChild(style);
    }

    disableGSAPAnimations() {
        document.body.classList.add('no-gsap');
        console.warn('[PerformanceMonitor] GSAP animations disabled due to loading error');
    }

    disableThreeJSFeatures() {
        document.body.classList.add('no-threejs');
        console.warn('[PerformanceMonitor] Three.js features disabled due to loading error');
    }

    enableThemeFallback() {
        // Basic theme switching without advanced features
        const button = document.createElement('button');
        button.textContent = 'Toggle Theme';
        button.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 1000;';
        button.onclick = () => {
            document.body.classList.toggle('dark-theme');
        };
        document.body.appendChild(button);
    }

    /**
     * Trigger error-specific fallbacks
     */
    triggerErrorFallback(type, error) {
        const handlers = this.errorHandlers.get(type);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(error);
                } catch (e) {
                    console.error('[PerformanceMonitor] Error in fallback handler:', e);
                }
            });
        }
    }

    /**
     * Register error handlers
     */
    registerErrorHandler(type, handler) {
        if (!this.errorHandlers.has(type)) {
            this.errorHandlers.set(type, []);
        }
        this.errorHandlers.get(type).push(handler);
    }

    /**
     * Log system information
     */
    logSystemInfo() {
        const info = {
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio,
            memory: performance.memory ? {
                limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1) + ' MB',
                used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) + ' MB'
            } : 'Not available',
            features: this.isSupported,
            timestamp: new Date().toISOString()
        };

        console.log('[PerformanceMonitor] System Info:', info);
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        return {
            averageFPS: this.performance.averageFPS,
            errorCount: this.performance.errorCount,
            isLowPerformance: this.performance.isLowPerformance,
            uptime: performance.now() - this.performance.startTime,
            memoryUsage: this.performance.memoryUsage.slice(-1)[0],
            browserSupport: this.isSupported,
            fallbacksEnabled: this.fallbacksEnabled
        };
    }

    /**
     * Public method to manually enable fallbacks
     */
    enableFallbacks() {
        this.fallbacksEnabled = true;
        this.enableGracefulDegradation();
    }

    /**
     * Public method to check if feature is supported
     */
    isFeatureSupported(feature) {
        return this.isSupported[feature] !== false;
    }
}

// Initialize performance monitor
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
    
    // Report performance periodically in debug mode
    if (window.location.search.includes('debug=true')) {
        setInterval(() => {
            console.log('[PerformanceMonitor] Performance Report:', 
                window.performanceMonitor.getPerformanceReport());
        }, 60000);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}