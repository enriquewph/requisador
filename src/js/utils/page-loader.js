/**
 * Page Loader Utility
 * Handles dynamic loading of HTML components and pages
 */

class PageLoader {
  /**
   * Load HTML content from a file and insert it into an element
   * @param {string} url - URL of the HTML file to load
   * @param {string} targetElementId - ID of the element where content will be inserted
   * @returns {Promise<void>}
   */
  static async loadHTML(url, targetElementId) {
    console.log(`🌐 PageLoader.loadHTML: Starting to fetch ${url} for element ${targetElementId}`);
    try {
      console.log(`🌐 Making fetch request to: ${url}`);
      const response = await fetch(url);
      console.log('🌐 Fetch response:', response);
      console.log(`🌐 Response status: ${response.status} ${response.statusText}`);
      console.log(`🌐 Response ok: ${response.ok}`);

      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
      }

      console.log('🌐 Getting response text...');
      const html = await response.text();
      console.log(`🌐 Response text length: ${html.length} characters`);
      console.log('🌐 Response text preview:', html.substring(0, 200));

      const targetElement = document.getElementById(targetElementId);
      console.log('🌐 Target element:', targetElement);

      if (targetElement) {
        console.log(`🌐 Setting innerHTML of element ${targetElementId}`);
        targetElement.innerHTML = html;
        console.log(`🌐 Successfully updated innerHTML of ${targetElementId}`);
      } else {
        console.error(`Target element with ID '${targetElementId}' not found`);
      }
    } catch (error) {
      console.error(`Error loading HTML from ${url}:`, error);
    }
  }

  /**
   * Load HTML content and append it to an element
   * @param {string} url - URL of the HTML file to load
   * @param {string} targetElementId - ID of the element where content will be appended
   * @returns {Promise<void>}
   */
  static async loadAndAppendHTML(url, targetElementId) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.insertAdjacentHTML('beforeend', html);
      } else {
        console.error(`Target element with ID '${targetElementId}' not found`);
      }
    } catch (error) {
      console.error(`Error loading HTML from ${url}:`, error);
    }
  }

  /**
   * Load multiple HTML components in parallel
   * @param {Array<{url: string, targetId: string}>} components - Array of components to load
   * @returns {Promise<void>}
   */
  static async loadComponents(components) {
    const promises = components.map(component => this.loadHTML(component.url, component.targetId));

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading components:', error);
    }
  }

  /**
   * Show a specific tab content and hide others
   * @param {string} activeTabId - ID of the tab to show
   * @param {Array<string>} allTabIds - Array of all tab IDs
   */
  static showTab(activeTabId, allTabIds) {
    allTabIds.forEach(tabId => {
      const element = document.getElementById(tabId);
      if (element) {
        if (tabId === activeTabId) {
          element.classList.add('active');
          element.style.display = 'block';
        } else {
          element.classList.remove('active');
          element.style.display = 'none';
        }
      }
    });
  }

  /**
   * Initialize tab navigation
   * @param {Array<{buttonId: string, contentId: string}>} tabs - Array of tab configurations
   */
  static initializeTabs(tabs) {
    tabs.forEach(tab => {
      const button = document.getElementById(tab.buttonId);
      if (button) {
        button.addEventListener('click', () => {
          // Remove active class from all tab buttons
          tabs.forEach(t => {
            const btn = document.getElementById(t.buttonId);
            if (btn) {btn.classList.remove('active');}
          });

          // Add active class to clicked button
          button.classList.add('active');

          // Show corresponding content
          const allContentIds = tabs.map(t => t.contentId);
          this.showTab(tab.contentId, allContentIds);
        });
      }
    });
  }
}

// Export for use in other modules
window.PageLoader = PageLoader;
