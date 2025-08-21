# Implementation Plan

- [x] 1. Set up theme system foundation





  - Create CSS custom properties for light and dark themes in a new themes.css file
  - Implement ThemeController JavaScript class with theme switching logic
  - Add theme persistence using localStorage
  - _Requirements: 2.1, 2.4, 2.5_

- [x] 2. Create theme toggle button component





  - Design and implement coffee cup toggle button with SVG icons
  - Add smooth CSS transitions between light and dark mode states
  - Position toggle button in top-right area of the website with relative sizing.
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Implement enhanced skills section with progress bars





  - Create animated progress bar components with coffee-themed styling
  - Add skill data structure with experience years and project information
  - Implement smooth animation effects for progress bars on page load
  - _Requirements: 1.1_

- [x] 4. Add interactive skill tooltips





  - Create hover tooltip system showing years of experience and project examples
  - Style tooltips with coffee theme and glass-morphism effects
  - Implement responsive positioning to prevent tooltips from going off-screen
  - _Requirements: 1.2_

- [x] 5. Integrate GitHub streak stats





  - Embed GitHub streak stats iframe in skills section
  - Add responsive styling and loading states for the GitHub stats
  - Implement fallback display if GitHub stats fail to load
  - _Requirements: 1.3_

- [x] 6. Create LinkedIn recommendations carousel





  - Build recommendations data structure with testimonial content of one person for now, up to 3 people max.
  - Implement carousel component with smooth transitions that adapts to number of testiomonials up to 3 max.
  - Style recommendations to blend seamlessly with skills section.
  - _Requirements: 1.4_

- [x] 7. Replace Three.js background with falling leaves animation







  - Create canvas-based falling leaves particle system 
  - Implement Leaf class with realistic physics and movement
  - Add theme-appropriate leaf colors and opacity settings
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 8. Implement coffee-themed contact form animations





  - Create success animation with coffee cup filling effect
  - Add steam rising animation using CSS keyframes
  - Implement form reset functionality after animation completion
  - _Requirements: 5.1, 5.2_

- [x] 9. Add "Buy me a coffee" button integration





  - Create subtle coffee button component for footer area
  - Style button with hover effects and coffee cup icon
  - Link button to https://buymeacoffee.com/nottherealtar
  - _Requirements: 5.3_

- [x] 10. Enhance SEO with structured data improvements





  - Expand existing structured data with additional schema markup
  - Add Organization and WebSite schema types
  - Include breadcrumb and article structured data for blog posts
  - _Requirements: 4.1_

- [x] 11. Implement image lazy loading system





  - Add lazy loading attributes to existing images
  - Create intersection observer for progressive image loading
  - Implement loading placeholders with coffee-themed styling
  - _Requirements: 4.2_

- [x] 12. Update sitemap.xml and robots.txt





  - Add missing pages and sections to sitemap with proper priorities
  - Include lastmod dates and changefreq attributes
  - Enhance robots.txt with specific crawling instructions
  - _Requirements: 4.3, 4.4_

- [x] 13. Integrate all components and test functionality





  - Wire theme system to control all new components
  - Test theme switching affects all animations and colors
  - Verify all components work together without conflicts
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 14. Optimize performance and add error handling





  - Add performance monitoring for animations
  - Implement graceful degradation for older browsers
  - Add error boundaries and fallback states for all new features
  - _Requirements: 6.1, 6.2, 6.3, 6.4_