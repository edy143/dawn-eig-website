/**
 * Main entry point.
 * Initializes all modules. Each module is self-contained and guards against missing DOM elements.
 */

import { initNav } from './nav.js';
import { initForm } from './form.js';
import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initForm();
  initTheme();
});
