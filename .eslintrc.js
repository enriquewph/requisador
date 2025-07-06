module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'warn',
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'eqeqeq': 'error',
    'curly': 'error',
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'indent': ['error', 2],
    'no-trailing-spaces': 'error',
    'comma-dangle': ['error', 'only-multiline'],
  },
  globals: {
    'PageLoader': 'readonly',
    'showAboutModal': 'readonly',
    'hideAboutModal': 'readonly',
    'CONFIG': 'readonly',
    // Export module functions
    'exportToCSV': 'readonly',
    'exportToLaTeX': 'readonly',
    'importProject': 'readonly',
    'exportProject': 'readonly',
    'exportProjectJSON': 'readonly',
    'exportProjectPDF': 'readonly',
    'printProject': 'readonly',
    // Requirements module functions
    'addRequirement': 'readonly',
    'clearAllRequirements': 'readonly',
    'deleteRequirement': 'readonly',
    'moveRequirementUp': 'readonly',
    'moveRequirementDown': 'readonly',
    'moveRequirementToTop': 'readonly',
    'moveRequirementToBottom': 'readonly',
    'convertRequirementLevel': 'readonly',
    'convertToLevel1': 'readonly',
    'convertToLevel2': 'readonly',
    'renderRequirementsList': 'readonly',
    'renderTreeView': 'readonly',
    'clearForm': 'readonly',
    'updateParentRequirementOptions': 'readonly',
    // Global variables from app.js that are used across modules
    'allRequirements': 'writable',
    'allFunctions': 'writable',
    'allVariables': 'writable',
    'allComponents': 'writable',
    'domElements': 'writable',
    'modes': 'writable'
  }
};
