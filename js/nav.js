/**
 * Navigation module: mobile hamburger + desktop dropdown panels.
 * Isolated — no external dependencies.
 */

export function initNav() {
  initMobileNav();
  initDropdowns();
}

/* ---------- Mobile hamburger ---------- */
function initMobileNav() {
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (!toggle || !mobileMenu) return;

  const open = () => {
    toggle.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
    document.body.style.overflow = '';
    // Also close any mobile accordions
    mobileMenu.querySelectorAll('.nav__accordion-content').forEach((p) => {
      p.classList.remove('is-open');
      p.style.maxHeight = '';
    });
    mobileMenu.querySelectorAll('.nav__accordion-toggle').forEach((b) => {
      b.setAttribute('aria-expanded', 'false');
    });
  };

  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => {
    isOpen() ? close() : open();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen()) close();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen()) close();
  });
}

/* ---------- Desktop dropdown panels ---------- */
function initDropdowns() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const toggles = nav.querySelectorAll('.nav__dropdown-toggle');
  const panels = nav.querySelectorAll('.nav__dropdown-panel');

  const closeAll = () => {
    panels.forEach((panel) => {
      panel.classList.remove('is-open');
      panel.addEventListener(
        'transitionend',
        function handler() {
          if (!panel.classList.contains('is-open')) {
            panel.setAttribute('hidden', '');
          }
          panel.removeEventListener('transitionend', handler);
        },
        { once: true }
      );
      // Fallback if transition doesn't fire
      setTimeout(() => {
        if (!panel.classList.contains('is-open')) {
          panel.setAttribute('hidden', '');
        }
      }, 200);
    });
    toggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
  };

  const openPanel = (panel, toggle) => {
    closeAll();
    panel.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    // Force reflow so browser sees the change before adding class
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
      });
    });
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const panelId = toggle.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (!panel) return;

      const isOpen = panel.classList.contains('is-open');
      if (isOpen) {
        closeAll();
      } else {
        openPanel(panel, toggle);
      }
    });
  });

  // Click outside nav -> close all
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeAll();
  });

  // Escape -> close all
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAll();
  });

  // Resize to mobile -> close desktop panels
  window.addEventListener('resize', () => {
    if (window.innerWidth < 768) closeAll();
  });

  /* ---------- Mobile accordion (inside hamburger menu) ---------- */
  const accordionToggles = document.querySelectorAll('.nav__accordion-toggle');
  accordionToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const contentId = btn.getAttribute('aria-controls');
      const content = document.getElementById(contentId);
      if (!content) return;

      const isOpen = content.classList.contains('is-open');

      // Close siblings
      const parent = btn.closest('.nav__mobile');
      if (parent) {
        parent.querySelectorAll('.nav__accordion-content').forEach((c) => {
          if (c !== content) {
            c.classList.remove('is-open');
            c.style.maxHeight = '';
          }
        });
        parent.querySelectorAll('.nav__accordion-toggle').forEach((b) => {
          if (b !== btn) b.setAttribute('aria-expanded', 'false');
        });
      }

      if (isOpen) {
        content.classList.remove('is-open');
        content.style.maxHeight = '';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        content.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}
