# TailwindCSS Usage Instructions for Requisador de Requisitos

## 🎨 Brand Colors & Design System

### Primary Color Palette
```css
/* Custom CSS Variables (fallback) */
--primary-color: #605DC8;
--secondary-color: #8B89E6;
--accent-color: #e8e7fa;
```

### TailwindCSS Color Classes
```html
<!-- Primary Colors -->
bg-primary-600    <!-- Main brand color #605DC8 -->
bg-primary-500    <!-- Lighter variant #8B89E6 -->
bg-primary-100    <!-- Very light #e8e7fa -->
text-primary-600  <!-- Primary text -->
border-primary-600 <!-- Primary borders -->

<!-- Functional Colors -->
bg-blue-600       <!-- Functions theme -->
bg-green-600      <!-- Variables theme -->
bg-indigo-600     <!-- Components theme -->
bg-purple-600     <!-- Modes theme -->
```

## 🎯 Component Styling Patterns

### Button Styles
```html
<!-- Primary Button -->
<button class="px-4 py-2 bg-primary-600 text-white border border-primary-600 rounded-lg transition-all duration-200 hover:bg-primary-500 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg transition-all duration-200 hover:bg-gray-200 hover:border-gray-400">
  Secondary Action
</button>

<!-- Danger Button -->
<button class="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
  Delete
</button>
```

### Form Controls
```html
<!-- Input Fields -->
<input class="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">

<!-- Select Dropdowns -->
<select class="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500">

<!-- Form Groups -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Form fields here -->
</div>
```

### Layout Containers
```html
<!-- Page Container -->
<div class="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">

<!-- Card Container -->
<div class="bg-white rounded-lg shadow p-6">

<!-- Form Container -->
<div class="p-4 border rounded-lg bg-gray-50">
```

### Tab Navigation
```html
<!-- Tab Container -->
<nav class="flex space-x-4">
  <!-- Active Tab -->
  <button class="px-4 py-2 rounded-md font-medium transition-colors bg-primary-600 text-white">
    Active Tab
  </button>
  
  <!-- Inactive Tab -->
  <button class="px-4 py-2 rounded-md font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-primary-50">
    Inactive Tab
  </button>
</nav>
```

## 🎨 Entity-Specific Color Themes

### Functions (Blue Theme)
```html
<h2 class="text-xl font-semibold mb-4 text-blue-600">Functions</h2>
<span class="font-medium text-blue-700">Function Name</span>
<div class="border-l-4 border-blue-500 pl-4">Function content</div>
```

### Variables (Green Theme)
```html
<h2 class="text-xl font-semibold mb-4 text-green-600">Variables</h2>
<span class="font-medium text-green-700">Variable Name</span>
<div class="border-l-4 border-green-500 pl-4">Variable content</div>
```

### Components (Indigo Theme)
```html
<h2 class="text-xl font-semibold mb-4 text-indigo-600">Components</h2>
<span class="font-medium text-indigo-700">Component Name</span>
<div class="border-l-4 border-indigo-500 pl-4">Component content</div>
```

### Modes (Purple Theme)
```html
<h2 class="text-xl font-semibold mb-4 text-purple-600">Modes</h2>
<span class="font-medium text-purple-700">Mode Name</span>
<div class="border-l-4 border-purple-500 pl-4">Mode content</div>
```

## 📐 Spacing & Layout Guidelines

### Standard Spacing Scale
```html
<!-- Padding -->
p-2    <!-- 8px -->
p-3    <!-- 12px -->
p-4    <!-- 16px -->
p-6    <!-- 24px -->

<!-- Margins -->
mb-3   <!-- margin-bottom: 12px -->
mb-4   <!-- margin-bottom: 16px -->
mb-6   <!-- margin-bottom: 24px -->

<!-- Gaps -->
gap-4  <!-- 16px gap in grid/flex -->
gap-6  <!-- 24px gap in grid/flex -->
space-x-4  <!-- 16px horizontal space between children -->
space-y-2  <!-- 8px vertical space between children -->
```

### Grid Layouts
```html
<!-- Responsive Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

<!-- Form Grid -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">

<!-- Two Column Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
```

## 🎯 State & Feedback Patterns

### Alert Messages
```html
<!-- Success Alert -->
<div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
  <p>Database ready! Initial data loaded successfully.</p>
</div>

<!-- Warning Alert -->
<div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
  <p>Initializing database...</p>
</div>

<!-- Error Alert -->
<div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
  <p>Error message here</p>
</div>
```

### Loading States
```html
<!-- Disabled Button -->
<button class="primary disabled:opacity-50 disabled:cursor-not-allowed" disabled>
  Processing...
</button>

<!-- Loading Spinner -->
<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
```

### Hover & Focus States
```html
<!-- Interactive Elements -->
hover:bg-primary-500    <!-- Hover background -->
hover:text-red-800      <!-- Hover text color -->
focus:outline-none      <!-- Remove default outline -->
focus:ring-2            <!-- Custom focus ring -->
focus:ring-primary-500  <!-- Focus ring color -->
transition-colors       <!-- Smooth color transitions -->
transition-all          <!-- Smooth all property transitions -->
duration-200            <!-- 200ms transition duration -->
```

## 📱 Responsive Design Patterns

### Breakpoint Usage
```html
<!-- Mobile First Approach -->
<div class="block md:flex">           <!-- Stack on mobile, flex on desktop -->
<div class="w-full md:w-1/2">        <!-- Full width on mobile, half on desktop -->
<div class="text-sm md:text-base">   <!-- Smaller text on mobile -->
<div class="p-4 md:p-6">             <!-- Less padding on mobile -->

<!-- Grid Responsiveness -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

## 🚫 Avoid These Common Patterns

### Don't Use
```html
<!-- Avoid inline styles -->
<div style="color: #605DC8">

<!-- Avoid !important in CSS -->
.custom-class {
  color: #605DC8 !important;
}

<!-- Avoid mixing custom CSS with TailwindCSS -->
<div class="custom-padding bg-gray-100">

<!-- Avoid magic numbers -->
<div class="p-[13px]">  <!-- Use standard spacing scale instead -->
```

### Use Instead
```html
<!-- Use TailwindCSS classes -->
<div class="text-primary-600">

<!-- Use CSS custom properties for brand colors -->
<div class="text-primary-600"> <!-- or custom CSS variables as fallback -->

<!-- Use consistent spacing scale -->
<div class="p-3"> <!-- 12px, standard scale -->
```

## 🎨 Component-Specific Patterns

### List Items
```html
<div class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
  <div class="flex-1">
    <span class="font-medium text-gray-900">Item Name</span>
    <span class="text-gray-600 ml-3">Description</span>
  </div>
  <button class="text-red-600 hover:text-red-800 px-3 py-1 rounded">
    Delete
  </button>
</div>
```

### Data Tables
```html
<div class="overflow-x-auto">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Column Header
        </th>
      </tr>
    </thead>
  </table>
</div>
```

### Form Sections
```html
<div class="mb-6 p-4 border rounded-lg bg-gray-50">
  <h3 class="font-medium mb-3">Section Title</h3>
  <!-- Form content -->
</div>
```

## 🎯 Custom @apply Directives

Current custom classes in `styles.css`:
```css
button.primary {
  @apply px-4 py-2 bg-primary-600 text-white border border-primary-600 rounded-lg transition-all duration-200 hover:bg-primary-500 hover:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

input, select {
  @apply px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500;
}

.tab-active {
  @apply bg-primary-600 text-white;
}

.tab-inactive {
  @apply bg-gray-100 text-gray-700 hover:bg-primary-50;
}
```

## 🎨 Requirements for New Components

When creating new components, always:

1. **Use consistent color themes** based on entity type
2. **Follow spacing scale** (2, 3, 4, 6 for common sizes)
3. **Include hover/focus states** for interactive elements
4. **Make responsive** with mobile-first approach
5. **Use semantic color classes** (primary-, gray-, red-, etc.)
6. **Include loading/disabled states** where applicable
7. **Follow the card-based layout** pattern for content sections
8. **Use consistent typography** (text-xl, font-semibold, etc.)

This ensures visual consistency across the entire application while maintaining the professional look and feel specified in the functional requirements.
