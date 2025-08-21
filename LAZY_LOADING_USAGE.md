# Lazy Loading System Usage Guide

## Overview

The lazy loading system provides progressive image loading with coffee-themed placeholders. It uses Intersection Observer API for optimal performance and includes fallbacks for older browsers.

## Features

- ✅ Progressive image loading with Intersection Observer
- ✅ Coffee-themed animated placeholders
- ✅ Support for both `<img>` elements and background images
- ✅ Error handling with fallback placeholders
- ✅ Theme-aware styling (light/dark mode)
- ✅ Accessibility support (reduced motion, high contrast)
- ✅ Performance optimizations
- ✅ JavaScript API for dynamic images

## Basic Usage

### 1. Include CSS and JavaScript

Add to your HTML `<head>`:
```html
<link rel="stylesheet" href="/styles/lazy-loading.css">
```

Add before closing `</body>`:
```html
<script src="/scripts/lazy-loading.js"></script>
```

### 2. Lazy Load Images

Replace regular `<img>` tags:
```html
<!-- Before -->
<img src="/path/to/image.jpg" alt="Description">

<!-- After -->
<div class="lazy-image-container">
    <div class="lazy-placeholder">
        <div class="coffee-placeholder">
            <div class="coffee-cup">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <!-- Coffee cup SVG -->
                </svg>
            </div>
            <div class="loading-text">Brewing...</div>
        </div>
    </div>
    <img class="lazy-image" data-src="/path/to/image.jpg" alt="Description">
</div>
```

### 3. Lazy Load Background Images

```html
<div class="lazy-bg" data-bg="/path/to/background.jpg">
    <div class="lazy-placeholder">
        <div class="coffee-placeholder">
            <div class="coffee-cup">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <!-- Coffee cup SVG -->
                </svg>
            </div>
            <div class="loading-text">Brewing...</div>
        </div>
    </div>
    <!-- Your content here -->
</div>
```

## JavaScript API

### Creating Dynamic Lazy Images

```javascript
// Create a lazy image element
const lazyImg = window.lazyLoader.createLazyImage(
    '/path/to/image.jpg',    // src
    'Alt text',              // alt (optional)
    'custom-class'           // className (optional)
);

// Add to DOM
document.getElementById('container').appendChild(lazyImg);

// Register with observer
window.lazyLoader.addLazyImage(lazyImg.querySelector('img'));
```

### Creating Dynamic Background Images

```javascript
// Create a lazy background element
const lazyBg = window.lazyLoader.createLazyBackground(
    '/path/to/background.jpg',  // src
    'custom-bg-class'           // className (optional)
);

// Add to DOM
document.getElementById('container').appendChild(lazyBg);

// Register with observer
window.lazyLoader.addLazyImage(lazyBg);
```

## CSS Classes

### State Classes
- `.lazy-loading` - Applied while image is loading
- `.lazy-loaded` - Applied when image loads successfully
- `.lazy-error` - Applied when image fails to load

### Container Classes
- `.lazy-image-container` - Container for lazy images
- `.lazy-bg` - Background image container
- `.lazy-placeholder` - Placeholder container
- `.coffee-placeholder` - Coffee-themed placeholder content

## Theme Support

The system automatically adapts to theme changes:

```css
[data-theme="light"] .lazy-placeholder {
    background: rgba(60, 40, 25, 0.18);
    border-color: rgba(247, 239, 226, 0.18);
}

[data-theme="dark"] .lazy-placeholder {
    background: rgba(40, 30, 20, 0.25);
    border-color: rgba(139, 115, 85, 0.25);
}
```

## Performance Features

- **Intersection Observer**: Only loads images when they're about to enter viewport
- **50px margin**: Starts loading 50px before image becomes visible
- **Hardware acceleration**: Uses CSS transforms for smooth animations
- **Reduced motion support**: Respects user's motion preferences
- **Memory efficient**: Automatically unobserves loaded images

## Browser Support

- **Modern browsers**: Full functionality with Intersection Observer
- **Legacy browsers**: Automatic fallback loads all images immediately
- **Accessibility**: Supports high contrast mode and reduced motion

## Error Handling

When images fail to load:
- Placeholder shows error icon and message
- Element gets `.lazy-error` class
- Graceful degradation maintains layout

## Testing

Use the test file to verify functionality:
```
/test-lazy-loading.html
```

This includes tests for:
- Regular vs lazy loaded images
- Background images
- Error handling
- Dynamic image creation

## Integration with Existing Code

The system is already integrated into:
- `index.html` - Main portfolio page
- `blog/*.html` - All blog pages
- `404.html` - Error page
- `globe/index.js` - World map lazy loading

## Customization

### Custom Placeholder

Override the coffee placeholder:
```javascript
window.lazyLoader.getCoffeePlaceholder = function() {
    return `<div class="custom-placeholder">Loading...</div>`;
};
```

### Custom Error Handling

Override error placeholder:
```javascript
window.lazyLoader.getErrorPlaceholder = function() {
    return `<div class="custom-error">Failed to load</div>`;
};
```

## Best Practices

1. **Always provide alt text** for accessibility
2. **Use appropriate image sizes** to reduce load times
3. **Test on slow connections** to verify placeholder behavior
4. **Consider critical images** - don't lazy load above-the-fold content
5. **Provide fallbacks** for essential images that must load

## Troubleshooting

### Images not loading
- Check `data-src` attribute is correct
- Verify image paths are accessible
- Check browser console for errors

### Placeholders not showing
- Ensure CSS is loaded before JavaScript
- Check for CSS conflicts
- Verify HTML structure matches examples

### Performance issues
- Reduce number of observed elements
- Check for memory leaks in dynamic content
- Monitor Intersection Observer performance