/**
 * Initialization Handler for Modular Application
 * This script ensures the app is initialized properly after all modules are loaded
 */

console.log('🔧 Init handler loaded');

/**
 * Initialize the application with all dependencies
 */
function initializeApp() {
    console.log('🚀 Attempting to initialize modular app...');
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        console.log('⏳ DOM not ready yet, waiting...');
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    // Check if main initialize function exists
    if (typeof window.initialize === 'function') {
        try {
            console.log('📋 Calling main initialize function...');
            window.initialize();
            console.log('✅ App initialized successfully!');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        }
    } else {
        console.error('❌ Initialize function not found on window object');
        console.log('🔍 Available window functions:', Object.keys(window).filter(key => typeof window[key] === 'function' && key.includes('initialize')));
    }
}

/**
 * Re-initialize DOM elements and event listeners after dynamic content load
 * This is called when a new tab is loaded
 */
function reinitializePage() {
    console.log('🔄 Re-initializing page after content load...');
    
    try {
        // Re-initialize DOM elements
        if (typeof window.initializeDOMElements === 'function') {
            window.initializeDOMElements();
        }
        
        // Re-bind event listeners
        if (typeof window.bindEventListeners === 'function') {
            window.bindEventListeners();
        }
        
        // Update UI elements
        if (typeof window.updateUI === 'function') {
            window.updateUI();
        }
        
        console.log('✅ Page re-initialization complete');
    } catch (error) {
        console.error('❌ Error during page re-initialization:', error);
    }
}

// Export functions for global use
window.initializeApp = initializeApp;
window.reinitializePage = reinitializePage;

// Start initialization immediately if DOM is already ready
if (document.readyState !== 'loading') {
    console.log('📄 DOM ready state:', document.readyState);
    // Don't auto-initialize here since the modular app handles its own initialization
}
