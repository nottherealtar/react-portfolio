/**
 * Lazy Loading System with Coffee-themed Placeholders
 * Implements intersection observer for progressive image loading
 */

class LazyImageLoader {
    constructor() {
        this.imageObserver = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        } else {
            // Fallback for older browsers - load all images immediately
            this.loadAllImages();
        }
    }

    setupIntersectionObserver() {
        const options = {
            root: null,
            rootMargin: '50px 0px', // Start loading 50px before image enters viewport
            threshold: 0.01
        };

        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, options);

        // Observe all lazy images
        this.observeImages();
    }

    observeImages() {
        const lazyImages = document.querySelectorAll('img[data-src], .lazy-bg[data-bg]');
        lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    loadImage(element) {
        const placeholder = element.querySelector('.lazy-placeholder');
        
        if (element.tagName === 'IMG') {
            // Handle img elements
            const src = element.dataset.src;
            if (src) {
                element.src = src;
                element.classList.add('lazy-loading');
                
                element.onload = () => {
                    element.classList.remove('lazy-loading');
                    element.classList.add('lazy-loaded');
                    if (placeholder) {
                        placeholder.style.opacity = '0';
                        setTimeout(() => placeholder.remove(), 300);
                    }
                };

                element.onerror = () => {
                    element.classList.remove('lazy-loading');
                    element.classList.add('lazy-error');
                    if (placeholder) {
                        placeholder.innerHTML = this.getErrorPlaceholder();
                    }
                };
            }
        } else if (element.classList.contains('lazy-bg')) {
            // Handle background images
            const bgSrc = element.dataset.bg;
            if (bgSrc) {
                element.classList.add('lazy-loading');
                
                // Preload the background image
                const img = new Image();
                img.onload = () => {
                    element.style.backgroundImage = `url(${bgSrc})`;
                    element.classList.remove('lazy-loading');
                    element.classList.add('lazy-loaded');
                    if (placeholder) {
                        placeholder.style.opacity = '0';
                        setTimeout(() => placeholder.remove(), 300);
                    }
                };

                img.onerror = () => {
                    element.classList.remove('lazy-loading');
                    element.classList.add('lazy-error');
                    if (placeholder) {
                        placeholder.innerHTML = this.getErrorPlaceholder();
                    }
                };

                img.src = bgSrc;
            }
        }
    }

    loadAllImages() {
        // Fallback for browsers without Intersection Observer
        const lazyImages = document.querySelectorAll('img[data-src], .lazy-bg[data-bg]');
        lazyImages.forEach(element => {
            this.loadImage(element);
        });
    }

    getCoffeePlaceholder() {
        return `
            <div class="coffee-placeholder">
                <div class="coffee-cup">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.5 7h-1V6c0-1.1-.9-2-2-2h-11c-1.1 0-2 .9-2 2v8c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-1h1c1.38 0 2.5-1.12 2.5-2.5S19.88 7 18.5 7zM16 14c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V6h10v8zm2.5-2.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5z"/>
                        <path d="M6 2c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
                        <path d="M9 2c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
                        <path d="M12 2c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1z"/>
                    </svg>
                </div>
                <div class="loading-text">Brewing...</div>
            </div>
        `;
    }

    getErrorPlaceholder() {
        return `
            <div class="coffee-error-placeholder">
                <div class="error-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                </div>
                <div class="error-text">Image unavailable</div>
            </div>
        `;
    }

    // Method to add lazy loading to new images dynamically
    addLazyImage(element) {
        if (this.imageObserver) {
            this.imageObserver.observe(element);
        } else {
            this.loadImage(element);
        }
    }

    // Method to create a lazy image element
    createLazyImage(src, alt = '', className = '') {
        const container = document.createElement('div');
        container.className = `lazy-image-container ${className}`;
        
        const img = document.createElement('img');
        img.dataset.src = src;
        img.alt = alt;
        img.className = 'lazy-image';
        
        const placeholder = document.createElement('div');
        placeholder.className = 'lazy-placeholder';
        placeholder.innerHTML = this.getCoffeePlaceholder();
        
        container.appendChild(placeholder);
        container.appendChild(img);
        
        return container;
    }

    // Method to create a lazy background element
    createLazyBackground(src, className = '') {
        const element = document.createElement('div');
        element.className = `lazy-bg ${className}`;
        element.dataset.bg = src;
        
        const placeholder = document.createElement('div');
        placeholder.className = 'lazy-placeholder';
        placeholder.innerHTML = this.getCoffeePlaceholder();
        
        element.appendChild(placeholder);
        
        return element;
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lazyLoader = new LazyImageLoader();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyImageLoader;
}