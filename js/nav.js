/**
 * Mobile navigation toggle and keyboard support.
 * Isolated module — no external dependencies.
 */

export function initNav() {
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

  // Close on Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });

  // Close when clicking a link inside mobile menu
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen()) close();
    });
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && isOpen()) {
      close();
    }
  });
}
