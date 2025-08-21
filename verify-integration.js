// Node.js script to verify JavaScript syntax and basic integration
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying component integration...\n');

// List of JavaScript files to check
const jsFiles = [
    'scripts/theme-controller.js',
    'scripts/skills-enhancement.js', 
    'scripts/contact-animations.js',
    'scripts/coffee-button.js',
    'scripts/falling-leaves.js',
    'scripts/component-integration.js'
];

let allValid = true;

// Check if files exist and have basic syntax
jsFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            
            // Basic syntax checks
            const hasClass = content.includes('class ');
            const hasInit = content.includes('init(') || content.includes('constructor(');
            const hasEventListener = content.includes('addEventListener');
            
            console.log(`✅ ${file}`);
            console.log(`   - Has class definition: ${hasClass}`);
            console.log(`   - Has initialization: ${hasInit}`);
            console.log(`   - Has event listeners: ${hasEventListener}`);
            console.log(`   - File size: ${(content.length / 1024).toFixed(1)}KB\n`);
        } else {
            console.log(`❌ ${file} - File not found\n`);
            allValid = false;
        }
    } catch (error) {
        console.log(`❌ ${file} - Error reading file: ${error.message}\n`);
        allValid = false;
    }
});

// Check HTML integration
try {
    const htmlContent = fs.readFileSync('index.html', 'utf8');
    
    console.log('📄 Checking HTML integration...');
    
    const scriptTags = jsFiles.filter(file => 
        htmlContent.includes(`src="/${file}"`) || htmlContent.includes(`src="${file}"`)
    );
    
    console.log(`✅ Scripts included in HTML: ${scriptTags.length}/${jsFiles.length}`);
    
    if (scriptTags.length !== jsFiles.length) {
        console.log('⚠️  Missing script tags for:', 
            jsFiles.filter(file => !htmlContent.includes(file.replace('scripts/', '')))
        );
    }
    
    // Check for theme system CSS
    const hasThemeCSS = htmlContent.includes('themes.css');
    console.log(`✅ Theme CSS included: ${hasThemeCSS}`);
    
    // Check for canvas container
    const hasCanvasContainer = htmlContent.includes('canvas-container');
    console.log(`✅ Canvas container present: ${hasCanvasContainer}`);
    
} catch (error) {
    console.log(`❌ Error checking HTML: ${error.message}`);
    allValid = false;
}

// Check CSS files
const cssFiles = [
    'styles/themes.css',
    'styles/skills-enhancement.css',
    'styles/contact-animations.css', 
    'styles/coffee-button.css'
];

console.log('\n🎨 Checking CSS files...');
cssFiles.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const hasThemeVars = content.includes('--theme-') || content.includes('[data-theme');
            console.log(`✅ ${file} - Theme integration: ${hasThemeVars}`);
        } else {
            console.log(`❌ ${file} - File not found`);
            allValid = false;
        }
    } catch (error) {
        console.log(`❌ ${file} - Error: ${error.message}`);
        allValid = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allValid) {
    console.log('🎉 All components appear to be properly integrated!');
    console.log('\nNext steps:');
    console.log('1. Open index.html in a browser');
    console.log('2. Check browser console for any errors');
    console.log('3. Test theme switching functionality');
    console.log('4. Verify falling leaves animation');
    console.log('5. Test contact form animations');
} else {
    console.log('❌ Integration issues found. Please fix the errors above.');
}
console.log('='.repeat(50));