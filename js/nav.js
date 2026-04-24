/**
 * Dropdown navigation module.
 * Manages desktop mega-menu dropdowns and mobile accordion menus.
 * Only one dropdown open at a time. Clicking outside closes all.
 */

export function initDropdowns() {
  const dropdownButtons = document.querySelectorAll('.nav__dropdown-btn');
  const dropdownPanels = document.querySelectorAll('.dropdown-panel');

  // No dropdowns on this page (e.g., contact page might not have them)
  if (!dropdownButtons.length) return;

  function openDropdown(name) {
    // Close all first
    dropdownButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    dropdownPanels.forEach(panel => {
      panel.classList.remove('is-open');
      panel.hidden = true;
    });

    // Open the requested one
    const btn = document.querySelector(`.nav__dropdown-btn[data-dropdown="${name}"]`);
    const panel = document.getElementById(`dropdown-${name}`);
    if (btn && panel) {
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.hidden = false;
    }
  }

  function closeAllDropdowns() {
    dropdownButtons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    dropdownPanels.forEach(panel => {
      panel.classList.remove('is-open');
      panel.hidden = true;
    });
  }

  // Button click handlers
  dropdownButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.dataset.dropdown;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeAllDropdowns();
      } else {
        openDropdown(name);
      }
    });
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    const isInsideDropdown = e.target.closest('.dropdown-panel') || e.target.closest('.nav__dropdown-btn');
    if (!isInsideDropdown) {
      closeAllDropdowns();
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
      const focusedBtn = document.querySelector('.nav__dropdown-btn[aria-expanded="true"]');
      if (focusedBtn) focusedBtn.focus();
    }
  });
}

/**
 * Mobile navigation toggle and accordion.
 */
export function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (!toggle || !mobileMenu) return;

  function open() {
    toggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function isOpen() {
    return toggle.getAttribute('aria-expanded') === 'true';
  }

  toggle.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  // Escape key closes mobile menu
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen()) {
      close();
    }
  });

  // Mobile accordion toggles
  const mobileTriggers = mobileMenu.querySelectorAll('.nav__mobile-trigger');
  mobileTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = `mobile-${trigger.dataset.mobileDropdown}`;
      const content = document.getElementById(targetId);
      if (!content) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all mobile accordion items
      mobileTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
      mobileMenu.querySelectorAll('.nav__mobile-content').forEach(c => c.classList.remove('is-open'));

      // Toggle the clicked one
      if (!isExpanded) {
        trigger.setAttribute('aria-expanded', 'true');
        content.classList.add('is-open');
      }
    });
  });

  // Close mobile menu when clicking a link inside it
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen()) close();
    });
  });
}
