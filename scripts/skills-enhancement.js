// Skills Enhancement System
class SkillsEnhancement {
    constructor() {
        this.recommendationsData = [
            {
                id: 1,
                text: "Josh was a great asset to the team, knowledgeable and hardworking always eager to assist in the team and with customers with a smile. Great to be able to work with you.",
                author: "Jason Simonis",
                position: "Strategic Solutions Specialist",
                company: "GoCanvas",
                avatar: "https://media.licdn.com/dms/image/v2/C4E03AQFotK_DnMXwtw/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1648403043386?e=1758758400&v=beta&t=yzL4HDnBTdaVAe7kkCX00pvaUqVqC7AxmWIR3ymQ3LI",
                linkedinUrl: "https://linkedin.com/in/jason-simonis"
            }
            // Can accommodate up to 3 recommendations total
        ];

        this.skillsData = [
            {
                name: 'Python',
                icon: 'fab fa-python',
                progress: 90,
                experience: '5+ years',
                projects: ['Discord Bot Cogs', 'Automation Scripts', 'Data Analysis Tools'],
                frameworks: ['Flask', 'Pandas', 'FastAPI']
            },
            {
                name: 'React',
                icon: 'fab fa-react',
                progress: 85,
                experience: '3+ years',
                projects: ['Portfolio Website', 'Web Applications', 'Component Libraries'],
                frameworks: ['Next.js', 'React Router', 'Redux']
            },
            {
                name: 'Three.js',
                icon: 'fas fa-cube',
                progress: 80,
                experience: '2+ years',
                projects: ['3D Portfolio', 'Interactive Visualizations', 'WebGL Games'],
                frameworks: ['WebGL', '3D Modeling', 'GSAP']
            },
            {
                name: 'Backend',
                icon: 'fas fa-server',
                progress: 88,
                experience: '4+ years',
                projects: ['API Development', 'Database Design', 'Microservices'],
                frameworks: ['Node.js', 'C#', 'NoSQL', 'PostgreSQL']
            }
        ];

        this.init();
    }

    init() {
        this.renderSkills();
        this.setupIntersectionObserver();
        this.setupThemeListener();
    }

    setupThemeListener() {
        // Listen for theme changes to update tooltip styling
        window.addEventListener('themeChanged', (event) => {
            const { theme, themeData } = event.detail;
            this.updateTooltipsForTheme(theme);
        });
    }

    updateTooltipsForTheme(theme) {
        // Force re-render of tooltips with new theme
        const tooltips = document.querySelectorAll('.skill-tooltip');
        tooltips.forEach(tooltip => {
            tooltip.classList.add('theme-transitioning');
            setTimeout(() => {
                tooltip.classList.remove('theme-transitioning');
            }, 300);
        });
    }

    renderSkills() {
        const skillsContainer = document.querySelector('.skills-grid');
        if (!skillsContainer) return;

        skillsContainer.innerHTML = '';

        this.skillsData.forEach((skill, index) => {
            const skillElement = this.createSkillElement(skill, index);
            skillsContainer.appendChild(skillElement);
        });

        // Add GitHub stats after skills
        this.addGitHubStats(skillsContainer);
    }

    createSkillElement(skill, index) {
        const skillDiv = document.createElement('div');
        skillDiv.className = 'skill-item glass-card p-6 rounded-lg text-center relative overflow-hidden';
        skillDiv.style.animationDelay = `${index * 0.1}s`;

        skillDiv.innerHTML = `
            <div class="skill-icon text-4xl mb-3 text-indigo-400">
                <i class="${skill.icon}"></i>
            </div>
            <div class="skill-header mb-4">
                <h3 class="font-semibold text-lg">${skill.name}</h3>
                <span class="experience-badge text-xs px-2 py-1 rounded-full mt-1 inline-block">
                    ${skill.experience}
                </span>
            </div>
            
            <!-- Progress Bar Container -->
            <div class="progress-container mb-4">
                <div class="progress-background h-2 rounded-full overflow-hidden">
                    <div class="progress-bar h-full rounded-full transition-all duration-1000 ease-out" 
                         data-progress="${skill.progress}" 
                         style="width: 0%">
                    </div>
                </div>
                <div class="progress-text text-xs mt-1 opacity-70">${skill.progress}%</div>
            </div>

            <!-- Frameworks/Technologies -->
            <div class="frameworks text-xs opacity-80 mb-2">
                ${skill.frameworks.join(' • ')}
            </div>

            <!-- Enhanced Tooltip -->
            <div class="skill-tooltip absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 
                        p-4 rounded-xl shadow-2xl opacity-0 invisible
                        pointer-events-none transition-all duration-300 ease-out z-20 w-72
                        coffee-glass-tooltip">
                <div class="tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2"></div>
                <div class="tooltip-content">
                    <div class="flex items-center mb-3">
                        <i class="${skill.icon} text-lg mr-2 coffee-icon"></i>
                        <div class="font-bold text-sm coffee-text-primary">${skill.name} Expertise</div>
                    </div>
                    <div class="space-y-2">
                        <div class="flex items-center text-xs">
                            <i class="fas fa-clock mr-2 coffee-accent"></i>
                            <span class="font-medium">Experience:</span>
                            <span class="ml-1 coffee-highlight">${skill.experience}</span>
                        </div>
                        <div class="text-xs">
                            <div class="flex items-center mb-1">
                                <i class="fas fa-project-diagram mr-2 coffee-accent"></i>
                                <span class="font-medium">Key Projects:</span>
                            </div>
                            <ul class="list-none ml-4 space-y-1">
                                ${skill.projects.map(project => `
                                    <li class="flex items-start">
                                        <span class="coffee-bullet mr-2">•</span>
                                        <span>${project}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div class="text-xs">
                            <div class="flex items-center mb-1">
                                <i class="fas fa-tools mr-2 coffee-accent"></i>
                                <span class="font-medium">Technologies:</span>
                            </div>
                            <div class="flex flex-wrap gap-1 ml-4">
                                ${skill.frameworks.map(tech => `
                                    <span class="tech-tag px-2 py-1 rounded-full text-xs">${tech}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add enhanced hover events for tooltip with responsive positioning
        skillDiv.addEventListener('mouseenter', (e) => {
            const tooltip = skillDiv.querySelector('.skill-tooltip');
            this.showTooltip(tooltip, skillDiv);
        });

        skillDiv.addEventListener('mouseleave', () => {
            const tooltip = skillDiv.querySelector('.skill-tooltip');
            this.hideTooltip(tooltip);
        });

        return skillDiv;
    }

    setupIntersectionObserver() {
        try {
            // Check if IntersectionObserver is supported
            if (!window.performanceMonitor || window.performanceMonitor.isFeatureSupported('intersectionObserver')) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateProgressBars(entry.target);
                            entry.target.classList.add('skill-animate-in');
                        }
                    });
                }, {
                    threshold: 0.3,
                    rootMargin: '0px 0px -50px 0px'
                });

                // Observe all skill items
                setTimeout(() => {
                    document.querySelectorAll('.skill-item').forEach(skill => {
                        observer.observe(skill);
                    });
                }, 100);
            } else {
                // Fallback: animate on scroll
                console.warn('[SkillsEnhancement] IntersectionObserver not supported, using scroll fallback');
                this.setupScrollFallback();
            }
        } catch (error) {
            console.error('[SkillsEnhancement] IntersectionObserver setup failed:', error);
            if (window.performanceMonitor) {
                window.performanceMonitor.handleError('Skills Observer Error', error);
            }
            this.setupScrollFallback();
        }
    }

    setupScrollFallback() {
        window.addEventListener('scroll', () => {
            document.querySelectorAll('.skill-item').forEach(skill => {
                const rect = skill.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    this.animateProgressBars(skill);
                    skill.classList.add('skill-animate-in');
                }
            });
        });
    }

    animateProgressBars(skillElement) {
        const progressBar = skillElement.querySelector('.progress-bar');
        if (!progressBar) return;

        const targetProgress = progressBar.getAttribute('data-progress');

        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = `${targetProgress}%`;
        }, 200);

        // Add coffee-themed animation effects
        progressBar.classList.add('progress-animate');
    }

    showTooltip(tooltip, skillElement) {
        if (!tooltip) return;

        // Reset positioning classes
        tooltip.classList.remove('tooltip-top', 'tooltip-bottom', 'tooltip-left', 'tooltip-right');

        // Calculate optimal position
        const rect = skillElement.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default position is top
        let position = 'top';

        // Check if tooltip would go off-screen at the top
        if (rect.top - tooltipRect.height - 20 < 0) {
            position = 'bottom';
        }

        // Check if tooltip would go off-screen on the sides
        const tooltipWidth = 288; // w-72 = 18rem = 288px
        const centerX = rect.left + rect.width / 2;

        if (centerX - tooltipWidth / 2 < 10) {
            // Too close to left edge
            tooltip.style.left = '10px';
            tooltip.style.transform = 'translateX(0)';
        } else if (centerX + tooltipWidth / 2 > viewportWidth - 10) {
            // Too close to right edge
            tooltip.style.left = 'auto';
            tooltip.style.right = '10px';
            tooltip.style.transform = 'translateX(0)';
        } else {
            // Center position is fine
            tooltip.style.left = '50%';
            tooltip.style.right = 'auto';
            tooltip.style.transform = 'translateX(-50%)';
        }

        // Apply position class
        tooltip.classList.add(`tooltip-${position}`);

        // Show tooltip with animation
        tooltip.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
        tooltip.classList.add('opacity-100', 'visible');

        // Add coffee steam animation effect
        setTimeout(() => {
            tooltip.classList.add('tooltip-steam-effect');
        }, 100);
    }

    hideTooltip(tooltip) {
        if (!tooltip) return;

        tooltip.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        tooltip.classList.remove('opacity-100', 'visible', 'tooltip-steam-effect');

        // Reset positioning after animation
        setTimeout(() => {
            tooltip.style.left = '50%';
            tooltip.style.right = 'auto';
            tooltip.style.transform = 'translateX(-50%)';
        }, 300);
    }

    addGitHubStats(skillsContainer) {
        // Create GitHub stats container that spans full width
        const githubStatsContainer = document.createElement('div');
        githubStatsContainer.className = 'github-stats-container mt-8 mb-4';

        githubStatsContainer.innerHTML = `
            <div class="github-stats-wrapper glass-card p-6 rounded-xl text-center">
                <h3 class="text-xl font-semibold mb-4 flex items-center justify-center">
                    <i class="fab fa-github mr-3 text-2xl coffee-accent"></i>
                    GitHub Activity
                </h3>
                
                <!-- Loading State -->
                <div class="github-loading flex items-center justify-center py-8">
                    <div class="loading-spinner mr-3"></div>
                    <span class="text-sm opacity-70">Loading GitHub stats...</span>
                </div>
                
                <!-- GitHub Stats Iframe -->
                <div class="github-stats-content hidden">
                    <iframe 
                        src="https://github-readme-streak-stats.herokuapp.com/?user=nottherealtar&theme=chartreuse-dark&hide_border=false"
                        frameborder="0"
                        scrolling="no"
                        width="100%"
                        height="200"
                        class="github-stats-iframe rounded-lg"
                        loading="lazy">
                    </iframe>
                </div>
                
                <!-- Fallback Content -->
                <div class="github-fallback hidden">
                    <div class="fallback-content p-6 rounded-lg">
                        <i class="fas fa-exclamation-triangle text-3xl mb-3 opacity-60"></i>
                        <h4 class="text-lg font-medium mb-2">GitHub Stats Unavailable</h4>
                        <p class="text-sm opacity-70 mb-4">
                            Unable to load GitHub statistics at the moment.
                        </p>
                        <a href="https://github.com/nottherealtar" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           class="inline-flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover:transform hover:scale-105 github-fallback-btn">
                            <i class="fab fa-github mr-2"></i>
                            Visit GitHub Profile
                        </a>
                    </div>
                </div>
            </div>
        `;

        // Insert GitHub stats container after skills grid
        const skillsContainerParent = skillsContainer.parentNode;
        skillsContainerParent.appendChild(githubStatsContainer);

        // Setup iframe loading and error handling
        this.setupGitHubStatsHandling(githubStatsContainer);

        // Add LinkedIn recommendations after GitHub stats
        this.addLinkedInRecommendations(skillsContainerParent);
    }

    setupGitHubStatsHandling(container) {
        const iframe = container.querySelector('.github-stats-iframe');
        const loading = container.querySelector('.github-loading');
        const content = container.querySelector('.github-stats-content');
        const fallback = container.querySelector('.github-fallback');

        let loadTimeout;
        let hasLoaded = false;

        // Set up loading timeout (10 seconds)
        loadTimeout = setTimeout(() => {
            if (!hasLoaded) {
                this.showGitHubFallback(loading, content, fallback);
            }
        }, 10000);

        // Handle successful load
        iframe.addEventListener('load', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);

            // Small delay to ensure content is rendered
            setTimeout(() => {
                loading.classList.add('hidden');
                content.classList.remove('hidden');

                // Add fade-in animation
                content.style.opacity = '0';
                content.style.transform = 'translateY(10px)';

                setTimeout(() => {
                    content.style.transition = 'all 0.5s ease';
                    content.style.opacity = '1';
                    content.style.transform = 'translateY(0)';
                }, 50);
            }, 500);
        });

        // Handle load error
        iframe.addEventListener('error', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            this.showGitHubFallback(loading, content, fallback);
        });

        // Additional fallback check for network issues
        setTimeout(() => {
            if (!hasLoaded && iframe.contentDocument === null) {
                this.showGitHubFallback(loading, content, fallback);
            }
        }, 8000);
    }

    showGitHubFallback(loading, content, fallback) {
        loading.classList.add('hidden');
        content.classList.add('hidden');
        fallback.classList.remove('hidden');

        // Add fade-in animation for fallback
        fallback.style.opacity = '0';
        fallback.style.transform = 'translateY(10px)';

        setTimeout(() => {
            fallback.style.transition = 'all 0.5s ease';
            fallback.style.opacity = '1';
            fallback.style.transform = 'translateY(0)';
        }, 50);
    }

    addLinkedInRecommendations(skillsContainerParent) {
        if (!this.recommendationsData || this.recommendationsData.length === 0) {
            return; // No recommendations to display
        }

        const recommendationsContainer = document.createElement('div');
        recommendationsContainer.className = 'linkedin-recommendations-container mt-6';

        const totalRecommendations = Math.min(this.recommendationsData.length, 3); // Max 3 recommendations
        const showCarouselControls = totalRecommendations > 1;

        recommendationsContainer.innerHTML = `
            <div class="recommendations-wrapper innovative-testimonial-card">
                <!-- Header with LinkedIn branding -->
                <div class="testimonial-header">
                    <div class="linkedin-badge">
                        <i class="fab fa-linkedin"></i>
                        <span>Recommendation</span>
                    </div>
                    <div class="testimonial-count">${totalRecommendations} of ${totalRecommendations}</div>
                </div>
                
                <!-- Main testimonial content -->
                <div class="testimonial-carousel-container">
                    <div class="testimonial-carousel">
                        <div class="testimonial-track" style="transform: translateX(0%)">
                            ${this.recommendationsData.slice(0, 3).map((rec, index) => this.createInnovativeRecommendationCard(rec, index)).join('')}
                        </div>
                    </div>
                    
                    ${showCarouselControls ? `
                        <!-- Modern carousel navigation -->
                        <div class="testimonial-navigation">
                            <button class="nav-btn nav-prev" ${totalRecommendations <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            
                            <div class="nav-dots">
                                ${Array.from({length: totalRecommendations}, (_, i) => `
                                    <button class="nav-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>
                                `).join('')}
                            </div>
                            
                            <button class="nav-btn nav-next" ${totalRecommendations <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        skillsContainerParent.appendChild(recommendationsContainer);

        // Initialize carousel functionality if there are multiple recommendations
        if (showCarouselControls) {
            this.initializeInnovativeCarousel(recommendationsContainer, totalRecommendations);
        }
    }

    createInnovativeRecommendationCard(recommendation) {
        return `
            <div class="testimonial-slide">
                <div class="testimonial-content">
                    <!-- Decorative quote marks -->
                    <div class="quote-decoration">
                        <div class="quote-mark quote-start">"</div>
                        <div class="quote-mark quote-end">"</div>
                    </div>
                    
                    <!-- Main testimonial text -->
                    <div class="testimonial-text">
                        <p>${recommendation.text}</p>
                    </div>
                    
                    <!-- Author section with modern layout -->
                    <div class="testimonial-author">
                        <div class="author-avatar-container">
                            <img src="${recommendation.avatar}" 
                                 alt="${recommendation.author}" 
                                 class="author-avatar"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <div class="author-avatar-fallback" style="display: none;">
                                ${recommendation.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                            </div>
                        </div>
                        
                        <div class="author-info">
                            <div class="author-name">${recommendation.author}</div>
                            <div class="author-title">${recommendation.position}</div>
                            <div class="author-company">${recommendation.company}</div>
                        </div>
                        
                        <div class="linkedin-action">
                            <a href="${recommendation.linkedinUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="linkedin-connect-btn">
                                <i class="fab fa-linkedin"></i>
                                <span>Connect</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Verification badge -->
                    <div class="verification-badge">
                        <i class="fas fa-check-circle"></i>
                        <span>Verified LinkedIn Recommendation</span>
                    </div>
                </div>
            </div>
        `;
    }

    initializeInnovativeCarousel(container, totalRecommendations) {
        const track = container.querySelector('.testimonial-track');
        const prevBtn = container.querySelector('.nav-prev');
        const nextBtn = container.querySelector('.nav-next');
        const dots = container.querySelectorAll('.nav-dot');
        const countDisplay = container.querySelector('.testimonial-count');
        
        let currentSlide = 0;

        const updateCarousel = (slideIndex) => {
            // Update track position with smooth animation
            const translateX = -slideIndex * 100;
            track.style.transform = `translateX(${translateX}%)`;

            // Update navigation dots
            dots.forEach((dot, index) => {
                if (index === slideIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Update counter
            if (countDisplay) {
                countDisplay.textContent = `${slideIndex + 1} of ${totalRecommendations}`;
            }

            // Update button states
            prevBtn.disabled = slideIndex === 0;
            nextBtn.disabled = slideIndex === totalRecommendations - 1;

            // Add visual feedback for disabled buttons
            prevBtn.classList.toggle('disabled', slideIndex === 0);
            nextBtn.classList.toggle('disabled', slideIndex === totalRecommendations - 1);

            currentSlide = slideIndex;

            // Trigger slide change animation
            const currentSlideElement = track.children[slideIndex];
            if (currentSlideElement) {
                currentSlideElement.classList.add('slide-active');
                // Remove active class from other slides
                Array.from(track.children).forEach((slide, index) => {
                    if (index !== slideIndex) {
                        slide.classList.remove('slide-active');
                    }
                });
            }
        };

        // Previous button
        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                updateCarousel(currentSlide - 1);
            }
        });

        // Next button
        nextBtn.addEventListener('click', () => {
            if (currentSlide < totalRecommendations - 1) {
                updateCarousel(currentSlide + 1);
            }
        });

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                updateCarousel(index);
            });
        });

        // Enhanced auto-play with pause on interaction
        let autoPlayInterval;
        let isUserInteracting = false;

        const startAutoPlay = () => {
            if (totalRecommendations > 1 && !isUserInteracting) {
                autoPlayInterval = setInterval(() => {
                    const nextSlide = (currentSlide + 1) % totalRecommendations;
                    updateCarousel(nextSlide);
                }, 6000); // Slightly faster for better engagement
            }
        };

        const stopAutoPlay = () => {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        };

        // Pause auto-play on any user interaction
        container.addEventListener('mouseenter', () => {
            isUserInteracting = true;
            stopAutoPlay();
        });

        container.addEventListener('mouseleave', () => {
            isUserInteracting = false;
            setTimeout(startAutoPlay, 1000); // Resume after 1 second
        });

        // Pause on button clicks
        [prevBtn, nextBtn, ...dots].forEach(element => {
            element.addEventListener('click', () => {
                isUserInteracting = true;
                stopAutoPlay();
                setTimeout(() => {
                    isUserInteracting = false;
                    startAutoPlay();
                }, 3000); // Resume after 3 seconds of inactivity
            });
        });

        // Initialize
        updateCarousel(0);
        startAutoPlay();
    }
}

// Initialize when DOM is loaded with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        const initSkillsEnhancement = () => {
            window.skillsEnhancement = new SkillsEnhancement();
        };

        // Wrap with error boundary if available
        if (window.errorBoundaryManager) {
            const wrappedInit = window.errorBoundaryManager.wrapComponent('skills', initSkillsEnhancement);
            wrappedInit();
        } else {
            initSkillsEnhancement();
        }
    } catch (error) {
        console.error('[SkillsEnhancement] Initialization failed:', error);
        if (window.performanceMonitor) {
            window.performanceMonitor.handleError('Skills Enhancement Init Error', error);
        }
        
        // Fallback: basic skills display
        const skillsGrid = document.querySelector('.skills-grid');
        if (skillsGrid) {
            skillsGrid.innerHTML = `
                <div class="skill-item glass-card p-6 rounded-lg text-center">
                    <h3 class="font-semibold text-lg">Python</h3>
                    <div class="text-sm mt-2">5+ years</div>
                </div>
                <div class="skill-item glass-card p-6 rounded-lg text-center">
                    <h3 class="font-semibold text-lg">React</h3>
                    <div class="text-sm mt-2">3+ years</div>
                </div>
                <div class="skill-item glass-card p-6 rounded-lg text-center">
                    <h3 class="font-semibold text-lg">Three.js</h3>
                    <div class="text-sm mt-2">2+ years</div>
                </div>
                <div class="skill-item glass-card p-6 rounded-lg text-center">
                    <h3 class="font-semibold text-lg">Backend</h3>
                    <div class="text-sm mt-2">4+ years</div>
                </div>
            `;
        }
    }
});