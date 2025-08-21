// Coffee Button Enhancement Script

class CoffeeButton {
    constructor() {
        this.button = document.querySelector('.coffee-button');
        this.init();
    }

    init() {
        if (!this.button) return;
        
        this.addEventListeners();
        this.addAccessibilityFeatures();
    }

    addEventListeners() {
        // Add click tracking for analytics (optional)
        this.button.addEventListener('click', (e) => {
            this.handleClick(e);
        });

        // Add keyboard support
        this.button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.handleClick(e);
            }
        });

        // Add hover effects enhancement
        this.button.addEventListener('mouseenter', () => {
            this.addHoverEffect();
        });

        this.button.addEventListener('mouseleave', () => {
            this.removeHoverEffect();
        });

        // Add focus management
        this.button.addEventListener('focus', () => {
            this.addFocusEffect();
        });

        this.button.addEventListener('blur', () => {
            this.removeFocusEffect();
        });
    }

    handleClick(e) {
        // Add click animation
        this.button.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.button.style.transform = '';
        }, 150);

        // Optional: Track click for analytics
        this.trackClick();
        
        // Let the default link behavior proceed
        // The link will open in a new tab due to target="_blank"
    }

    addHoverEffect() {
        // Enhanced hover effect with subtle animation
        this.button.style.setProperty('--hover-scale', '1.05');
    }

    removeHoverEffect() {
        this.button.style.removeProperty('--hover-scale');
    }

    addFocusEffect() {
        // Enhanced focus visibility
        this.button.setAttribute('data-focused', 'true');
    }

    removeFocusEffect() {
        this.button.removeAttribute('data-focused');
    }

    addAccessibilityFeatures() {
        // Ensure proper ARIA attributes
        if (!this.button.getAttribute('aria-label')) {
            this.button.setAttribute('aria-label', 'Support me by buying me a coffee - opens in new tab');
        }

        // Add role if needed
        if (!this.button.getAttribute('role')) {
            this.button.setAttribute('role', 'button');
        }

        // Add title for additional context
        if (!this.button.getAttribute('title')) {
            this.button.setAttribute('title', 'Buy me a coffee ☕');
        }
    }

    trackClick() {
        // Optional analytics tracking
        // This could be connected to Google Analytics, Plausible, or other analytics services
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                event_category: 'engagement',
                event_label: 'buy_me_coffee_button',
                value: 1
            });
        }

        // Console log for development
        console.log('Coffee button clicked - redirecting to Buy Me a Coffee');
    }

    // Method to update button text dynamically if needed
    updateButtonText(newText) {
        const textNode = this.button.querySelector('.coffee-button-text');
        if (textNode) {
            textNode.textContent = newText;
        }
    }

    // Method to temporarily disable button (e.g., during loading)
    setDisabled(disabled) {
        if (disabled) {
            this.button.setAttribute('aria-disabled', 'true');
            this.button.style.opacity = '0.6';
            this.button.style.pointerEvents = 'none';
        } else {
            this.button.removeAttribute('aria-disabled');
            this.button.style.opacity = '';
            this.button.style.pointerEvents = '';
        }
    }
}

// Initialize the coffee button when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CoffeeButton();
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoffeeButton;
}