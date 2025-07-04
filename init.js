/**
 * Initialization Handler for GitHub Pages
 * This script ensures the app is initialized properly after all modules are loaded
 */

console.log('Init handler loaded');

// Simple, robust initialization
function initializeApp() {
    console.log('Attempting to initialize app...');
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        console.log('DOM not ready yet, waiting...');
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    // Check if initialize function exists
    if (typeof window.initialize === 'function') {
        try {
            console.log('Calling initialize function...');
            window.initialize();
            console.log('App initialized successfully!');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    } else {
        console.error('Initialize function not found on window object');
        console.log('Available window functions:', Object.keys(window).filter(key => typeof window[key] === 'function' && key.indexOf('initialize') !== -1));
    }
}

// Start initialization immediately
console.log('DOM ready state:', document.readyState);
initializeApp();
