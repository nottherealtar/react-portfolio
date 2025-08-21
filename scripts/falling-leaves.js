/**
 * Falling Leaves Animation System
 * Replaces Three.js 3D objects with theme-aware falling leaves
 */

class FallingLeavesAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.leaves = [];
        this.animationId = null;
        this.isRunning = false;
        this.currentTheme = 'light';
        
        // Configuration
        this.config = {
            leafCount: 15,
            minSize: 8,
            maxSize: 20,
            minSpeed: 0.5,
            maxSpeed: 2,
            swayAmplitude: 30,
            swayFrequency: 0.02
        };
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupEventListeners();
        this.createLeaves();
        this.start();
    }

    createCanvas() {
        // Remove existing Three.js canvas if it exists
        const existingCanvas = document.querySelector('#canvas-container canvas');
        if (existingCanvas) {
            existingCanvas.remove();
        }

        // Create new canvas for falling leaves
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'falling-leaves-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        
        this.ctx = this.canvas.getContext('2d');
        
        // Add to canvas container
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) {
            canvasContainer.appendChild(this.canvas);
        } else {
            document.body.appendChild(this.canvas);
        }
        
        this.resizeCanvas();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });

        // Listen for theme changes
        window.addEventListener('themeChanged', (event) => {
            this.currentTheme = event.detail.theme;
            this.updateLeafColors();
        });

        // Get initial theme from theme controller
        if (window.themeController) {
            this.currentTheme = window.themeController.currentTheme;
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createLeaves() {
        this.leaves = [];
        
        for (let i = 0; i < this.config.leafCount; i++) {
            this.leaves.push(new Leaf(this.canvas, this.config, this.currentTheme));
        }
    }

    updateLeafColors() {
        this.leaves.forEach(leaf => {
            leaf.updateTheme(this.currentTheme);
        });
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;
        
        try {
            // Performance monitoring
            const frameStart = performance.now();
            
            // Clear canvas
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update and draw leaves
            this.leaves.forEach(leaf => {
                leaf.update();
                leaf.draw(this.ctx);
            });
            
            // Check frame time for performance
            const frameTime = performance.now() - frameStart;
            if (frameTime > 16.67 && window.performanceMonitor) { // 60 FPS threshold
                // Reduce leaf count if performance is poor
                if (this.leaves.length > 5) {
                    this.leaves.pop();
                }
            }
            
            this.animationId = requestAnimationFrame(() => this.animate());
        } catch (error) {
            console.error('[FallingLeaves] Animation error:', error);
            if (window.performanceMonitor) {
                window.performanceMonitor.handleError('Falling Leaves Animation Error', error);
            }
            this.stop(); // Stop animation on error
        }
    }

    // Public method to restart animation with new theme
    restart() {
        this.stop();
        this.createLeaves();
        this.start();
    }
}

class Leaf {
    constructor(canvas, config, theme) {
        this.canvas = canvas;
        this.config = config;
        this.theme = theme;
        
        this.reset();
        this.updateTheme(theme);
        
        // Random starting position (some leaves start from top, others from random heights)
        if (Math.random() > 0.5) {
            this.y = Math.random() * this.canvas.height;
        }
    }

    reset() {
        this.x = Math.random() * this.canvas.width;
        this.y = -50;
        this.size = this.config.minSize + Math.random() * (this.config.maxSize - this.config.minSize);
        this.speed = this.config.minSpeed + Math.random() * (this.config.maxSpeed - this.config.minSpeed);
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.originalX = this.x;
    }

    updateTheme(theme) {
        this.theme = theme;
        
        // Theme-appropriate colors
        if (theme === 'dark') {
            this.colors = [
                '#2f1b14', // Dark coffee brown
                '#3d2817', // Medium coffee brown  
                '#4a3728', // Lighter coffee brown
                '#5d4037', // Even lighter brown
                '#6d4c41'  // Lightest brown
            ];
            this.opacity *= 0.7; // Darker theme = more subtle leaves
        } else {
            this.colors = [
                '#8b4513', // Saddle brown
                '#a0522d', // Sienna
                '#cd853f', // Peru
                '#daa520', // Goldenrod
                '#b8860b'  // Dark goldenrod
            ];
            this.opacity *= 1.0; // Light theme = more visible leaves
        }
        
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
        // Vertical movement
        this.y += this.speed;
        
        // Horizontal swaying motion
        this.x = this.originalX + Math.sin(this.y * this.config.swayFrequency + this.swayOffset) * this.config.swayAmplitude;
        
        // Rotation
        this.rotation += this.rotationSpeed;
        
        // Reset when leaf goes off screen
        if (this.y > this.canvas.height + 50) {
            this.reset();
            this.originalX = this.x;
        }
        
        // Handle horizontal boundaries
        if (this.x < -50) {
            this.originalX = this.canvas.width + 50;
        } else if (this.x > this.canvas.width + 50) {
            this.originalX = -50;
        }
    }

    draw(ctx) {
        ctx.save();
        
        // Move to leaf position
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Set leaf style
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Draw leaf shape (simple oval with a stem)
        this.drawLeafShape(ctx);
        
        ctx.restore();
    }

    drawLeafShape(ctx) {
        const width = this.size;
        const height = this.size * 1.5;
        
        // Draw leaf body (ellipse)
        ctx.beginPath();
        ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some texture with a slightly darker center line
        ctx.save();
        ctx.globalAlpha *= 0.3;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -height / 2);
        ctx.lineTo(0, height / 2);
        ctx.stroke();
        ctx.restore();
        
        // Add small stem
        ctx.save();
        ctx.globalAlpha *= 0.8;
        ctx.strokeStyle = this.theme === 'dark' ? '#2d1b14' : '#8b4513';
        ctx.lineWidth = Math.max(1, this.size / 10);
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(0, height / 2 + this.size / 4);
        ctx.stroke();
        ctx.restore();
    }
}

// Initialize falling leaves when DOM is loaded with error handling
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for theme controller to initialize
    setTimeout(() => {
        try {
            // Check if canvas is supported
            if (!window.performanceMonitor || window.performanceMonitor.isFeatureSupported('canvas')) {
                const initFallingLeaves = () => {
                    window.fallingLeavesAnimation = new FallingLeavesAnimation();
                };

                // Wrap with error boundary if available
                if (window.errorBoundaryManager) {
                    const wrappedInit = window.errorBoundaryManager.wrapComponent('leaves', initFallingLeaves);
                    wrappedInit();
                } else {
                    initFallingLeaves();
                }
            } else {
                console.warn('[FallingLeaves] Canvas not supported, skipping animation');
            }
        } catch (error) {
            console.error('[FallingLeaves] Initialization failed:', error);
            if (window.performanceMonitor) {
                window.performanceMonitor.handleError('Falling Leaves Init Error', error);
            }
        }
    }, 100);
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FallingLeavesAnimation, Leaf };
}