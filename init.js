/**
 * Initialization Handler for GitHub Pages
 * This script ensures all modules are loaded and initialized properly
 */

// Debug information
console.log('Init handler loaded');

// Global state tracker
window.RequisadorApp = {
    modulesLoaded: {
        requirements: false,
        export: false,
        app: false
    },
    initialized: false,
    initAttempts: 0,
    maxAttempts: 20
};

// Function to check if all modules are loaded
function checkModulesLoaded() {
    const modules = window.RequisadorApp.modulesLoaded;
    return modules.requirements && modules.export && modules.app;
}

// Function to check if required functions exist
function checkRequiredFunctions() {
    const requiredFunctions = [
        'addRequirement',
        'exportToCSV', 
        'exportToLaTeX',
        'exportProject',
        'importProject',
        'clearAllRequirements'
    ];
    
    return requiredFunctions.every(func => typeof window[func] === 'function');
}

// Robust initialization function
function attemptInitialization() {
    window.RequisadorApp.initAttempts++;
    
    console.log(`Initialization attempt ${window.RequisadorApp.initAttempts}`);
    
    if (window.RequisadorApp.initAttempts > window.RequisadorApp.maxAttempts) {
        console.error('Failed to initialize after maximum attempts');
        return;
    }
    
    if (window.RequisadorApp.initialized) {
        console.log('Already initialized');
        return;
    }
    
    // Check if all modules are loaded
    if (!checkModulesLoaded()) {
        console.log('Not all modules loaded yet, retrying...');
        setTimeout(attemptInitialization, 250);
        return;
    }
    
    // Check if required functions exist
    if (!checkRequiredFunctions()) {
        console.log('Not all functions available yet, retrying...');
        setTimeout(attemptInitialization, 250);
        return;
    }
    
    // Check if DOM is ready
    if (document.readyState === 'loading') {
        console.log('DOM not ready yet, waiting...');
        document.addEventListener('DOMContentLoaded', attemptInitialization);
        return;
    }
    
    // Everything is ready, initialize the app
    try {
        console.log('Starting app initialization...');
        
        if (typeof window.initialize === 'function') {
            window.initialize();
            window.RequisadorApp.initialized = true;
            console.log('App initialized successfully!');
        } else {
            console.error('Initialize function not found');
        }
    } catch (error) {
        console.error('Error during initialization:', error);
        // Try again after a delay
        setTimeout(attemptInitialization, 1000);
    }
}

// Mark modules as loaded when they finish loading
window.markModuleLoaded = function(moduleName) {
    console.log(`Module ${moduleName} loaded`);
    window.RequisadorApp.modulesLoaded[moduleName] = true;
    
    // Try to initialize after each module loads
    setTimeout(attemptInitialization, 100);
};

// Start the initialization process
console.log('Starting initialization process...');
setTimeout(attemptInitialization, 100);
