/**
 * Main entry point.
 * Initializes all modules. Each module is self-contained and guards against missing DOM elements.
 */

import { initDropdowns, initMobileNav } from './nav.js';

document.addEventListener('DOMContentLoaded', () => {
  initDropdowns();
  initMobileNav();
});
