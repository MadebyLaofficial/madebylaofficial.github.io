/* LUMINA case study interactions: navigation, progressive reveals, lightbox, and restrained hero depth. */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');

  menuToggle?.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    mobileMenu.hidden = isOpen;
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.hidden = true;
  }));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Keep navigation oriented within the long-form case study.
  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const navTargets = navLinks
    .map((link) => document.querySelector(link.hash))
    .filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
      const visibleEntry = entries.find((entry) => entry.isIntersecting);
      if (!visibleEntry) return;
      navLinks.forEach((link) => {
        const isCurrent = link.hash === `#${visibleEntry.target.id}`;
        link.toggleAttribute('aria-current', isCurrent);
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    navTargets.forEach((target) => navObserver.observe(target));
  }

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((element) => element.classList.add('visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -24px' });
    reveals.forEach((element) => revealObserver.observe(element));
  }

  const dialog = document.querySelector('.lightbox');
  const dialogImage = dialog?.querySelector('img');
  const dialogCaption = dialog?.querySelector('#lightbox-caption');
  const closeButton = dialog?.querySelector('.lightbox-close');
  let lastTrigger = null;

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => trigger.addEventListener('click', () => {
    lastTrigger = trigger;
    const sourceImage = trigger.querySelector('img');
    dialogImage.src = trigger.dataset.lightbox;
    dialogImage.alt = sourceImage?.alt || 'LUMINA campaign asset';
    dialogCaption.textContent = trigger.dataset.caption || '';
    dialog.showModal();
    closeButton.focus();
  }));

  const closeLightbox = () => { if (dialog?.open) dialog.close(); };
  closeButton?.addEventListener('click', closeLightbox);
  dialog?.addEventListener('click', (event) => { if (event.target === dialog) closeLightbox(); });
  dialog?.addEventListener('close', () => {
    dialogImage.src = '';
    lastTrigger?.focus();
  });

  /* A small pointer shift adds depth without moving the campaign image or affecting reduced-motion users. */
  const parallax = document.querySelector('[data-parallax]');
  if (parallax && !reducedMotion && window.matchMedia('(pointer: fine)').matches) {
    parallax.addEventListener('pointermove', (event) => {
      const bounds = parallax.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 5;
      const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 5;
      parallax.style.transform = `translate(${x}px, ${y}px)`;
    });
    parallax.addEventListener('pointerleave', () => { parallax.style.transform = ''; });
  }
});
