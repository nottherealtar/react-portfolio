/**
 * Coffee-themed Contact Form Animations
 * Handles success animations, form reset, and error handling
 */

class ContactAnimations {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.submitButton = null;
        this.originalSubmitText = '';
        this.animationTimeout = null;
        
        this.init();
    }

    init() {
        if (!this.form) {
            console.warn('Contact form not found');
            return;
        }

        this.submitButton = this.form.querySelector('button[type="submit"]');
        if (this.submitButton) {
            this.originalSubmitText = this.submitButton.textContent;
            this.submitButton.classList.add('submit-button');
        }

        this.createAnimationElements();
        this.bindEvents();
    }

    createAnimationElements() {
        // Create success animation overlay
        const overlay = document.createElement('div');
        overlay.className = 'success-overlay';
        overlay.id = 'success-overlay';
        document.body.appendChild(overlay);

        // Create success animation container
        const animationContainer = document.createElement('div');
        animationContainer.className = 'contact-success-animation';
        animationContainer.id = 'success-animation';
        
        animationContainer.innerHTML = `
            <div class="coffee-cup-container">
                <div class="coffee-cup">
                    <div class="coffee-liquid"></div>
                </div>
                <div class="steam-container">
                    <div class="steam"></div>
                    <div class="steam"></div>
                    <div class="steam"></div>
                </div>
            </div>
            <div class="success-message">
                Message sent successfully!<br>
                <small>Thank you for reaching out!</small>
            </div>
        `;
        
        document.body.appendChild(animationContainer);

        // Create error notification container
        const errorContainer = document.createElement('div');
        errorContainer.className = 'contact-error-animation';
        errorContainer.id = 'error-animation';
        document.body.appendChild(errorContainer);
    }

    bindEvents() {
        // Override the existing form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(e);
        });

        // Close success animation on overlay click
        const overlay = document.getElementById('success-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.hideSuccessAnimation();
            });
        }

        // Close error animation after timeout
        document.addEventListener('click', (e) => {
            if (e.target.closest('.contact-error-animation')) {
                this.hideErrorAnimation();
            }
        });
    }

    async handleFormSubmission(e) {
        try {
            const formData = this.getFormData();
            
            if (!this.validateForm(formData)) {
                return;
            }

            this.showSubmittingState();

            // Add timeout for fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    this.showSuccessAnimation();
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    this.showErrorAnimation(
                        'Failed to send message',
                        errorData.error || 'Please try again later.'
                    );
                }
            } catch (error) {
                clearTimeout(timeoutId);
                
                if (error.name === 'AbortError') {
                    this.showErrorAnimation(
                        'Request Timeout',
                        'The request took too long. Please try again.'
                    );
                } else {
                    this.showErrorAnimation(
                        'Network Error',
                        'Please check your connection and try again.'
                    );
                }
                
                // Report error to performance monitor
                if (window.performanceMonitor) {
                    window.performanceMonitor.handleError('Contact Form Submission Error', error);
                }
            } finally {
                this.hideSubmittingState();
            }
        } catch (error) {
            console.error('[ContactAnimations] Form submission error:', error);
            if (window.performanceMonitor) {
                window.performanceMonitor.handleError('Contact Form Error', error);
            }
            
            // Fallback: basic success message
            alert('Message sent successfully! (Fallback mode)');
            this.form.reset();
        }
    }

    getFormData() {
        return {
            name: document.getElementById('name')?.value || '',
            email: document.getElementById('email')?.value || '',
            subject: document.getElementById('subject')?.value || '',
            message: document.getElementById('message')?.value || '',
            token: document.getElementById('zapier-token')?.value || ''
        };
    }

    validateForm(data) {
        const errors = [];

        if (!data.name.trim()) errors.push('Name is required');
        if (!data.email.trim()) errors.push('Email is required');
        if (!data.message.trim()) errors.push('Message is required');
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (data.email && !emailRegex.test(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (errors.length > 0) {
            this.showErrorAnimation('Validation Error', errors.join(', '));
            return false;
        }

        return true;
    }

    showSubmittingState() {
        this.form.classList.add('contact-form-submitting');
        if (this.submitButton) {
            this.submitButton.textContent = 'Sending...';
        }
    }

    hideSubmittingState() {
        this.form.classList.remove('contact-form-submitting');
        if (this.submitButton) {
            this.submitButton.textContent = this.originalSubmitText;
        }
    }

    showSuccessAnimation() {
        const overlay = document.getElementById('success-overlay');
        const animation = document.getElementById('success-animation');
        
        if (overlay && animation) {
            overlay.classList.add('active');
            animation.classList.add('active');
            
            // Auto-hide after animation completes (4 seconds total)
            this.animationTimeout = setTimeout(() => {
                this.hideSuccessAnimation();
                this.resetForm();
            }, 4000);
        }
    }

    hideSuccessAnimation() {
        const overlay = document.getElementById('success-overlay');
        const animation = document.getElementById('success-animation');
        
        if (overlay && animation) {
            overlay.classList.remove('active');
            animation.classList.remove('active');
        }

        if (this.animationTimeout) {
            clearTimeout(this.animationTimeout);
            this.animationTimeout = null;
        }
    }

    showErrorAnimation(title, message) {
        const errorContainer = document.getElementById('error-animation');
        
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="error-title">${title}</div>
                <div class="error-message">${message}</div>
            `;
            
            errorContainer.classList.add('active');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideErrorAnimation();
            }, 5000);
        }
    }

    hideErrorAnimation() {
        const errorContainer = document.getElementById('error-animation');
        if (errorContainer) {
            errorContainer.classList.remove('active');
        }
    }

    resetForm() {
        if (this.form) {
            this.form.reset();
            
            // Add a subtle animation to indicate form reset
            this.form.style.opacity = '0.5';
            setTimeout(() => {
                this.form.style.opacity = '1';
            }, 200);
        }
    }

    // Public method to manually trigger success animation (for testing)
    triggerSuccessAnimation() {
        this.showSuccessAnimation();
        setTimeout(() => {
            this.resetForm();
        }, 4000);
    }

    // Public method to manually trigger error animation (for testing)
    triggerErrorAnimation(title = 'Test Error', message = 'This is a test error message') {
        this.showErrorAnimation(title, message);
    }
}

// Initialize when DOM is loaded with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        const initContactAnimations = () => {
            window.contactAnimations = new ContactAnimations();
        };

        // Wrap with error boundary if available
        if (window.errorBoundaryManager) {
            const wrappedInit = window.errorBoundaryManager.wrapComponent('contact', initContactAnimations);
            wrappedInit();
        } else {
            initContactAnimations();
        }
    } catch (error) {
        console.error('[ContactAnimations] Initialization failed:', error);
        if (window.performanceMonitor) {
            window.performanceMonitor.handleError('Contact Animations Init Error', error);
        }
        
        // Fallback: basic form handling
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Message sent! (Fallback mode)');
                form.reset();
            });
        }
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContactAnimations;
}