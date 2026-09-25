/* =========================================================
   LIORA — script.js
   Vanilla JS. Sem dependências externas.
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     CONFIGURAÇÃO DE CONTATO
     TODO: preencher com os dados oficiais antes de publicar.
     ========================================================= */
  const CONTACT_EMAIL = "comercial@jrperfis.com.br"; // e-mail oficial de contato
  const WHATSAPP_NUMBER = "551115164601"; // número oficial de WhatsApp (usado no botão de contato)

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('topo');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let lastFocusedBeforeMenu = null;

  function openMenu() {
    lastFocusedBeforeMenu = document.activeElement;
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    const firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocusedBeforeMenu) lastFocusedBeforeMenu.focus();
  }
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    // Focus trap + ESC to close
    document.addEventListener('keydown', function (e) {
      if (!mobileMenu.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeMenu();
        return;
      }
      if (e.key === 'Tab') {
        const focusables = mobileMenu.querySelectorAll('a, button');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- Active section indicator ---------- */
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  const sectionIds = navLinks
    .map(function (a) { return a.getAttribute('href'); })
    .filter(function (href) { return href && href.startsWith('#'); });
  const sections = sectionIds
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        const id = '#' + entry.target.id;
        const link = navLinks.find(function (a) { return a.getAttribute('href') === id; });
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (a) { a.classList.remove('is-active'); });
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Parallax leve no hero ---------- */
  const heroMedia = document.querySelector('[data-parallax]');
  if (heroMedia && !prefersReducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        const offset = window.scrollY;
        const translate = Math.min(offset * 0.18, 120);
        heroMedia.style.transform = 'translateY(' + translate + 'px)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Smooth scroll com offset de header (fallback extra) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerOffset = 88;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocusedBeforeLightbox = null;

  function openLightbox(src, alt) {
    lastFocusedBeforeLightbox = document.activeElement;
    lightboxImg.setAttribute('src', src);
    lightboxImg.setAttribute('alt', alt || '');
    lightboxCaption.textContent = alt || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.setAttribute('src', '');
    if (lastFocusedBeforeLightbox) lastFocusedBeforeLightbox.focus();
  }

  document.querySelectorAll('[data-lightbox-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const src = trigger.getAttribute('data-lightbox-src');
      const alt = trigger.getAttribute('data-lightbox-alt');
      openLightbox(src, alt);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        closeLightbox();
        return;
      }
      if (e.key === 'Tab') {
        // único elemento focável dentro do modal: o botão de fechar
        e.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* ---------- Ano do rodapé ---------- */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }

  /* ---------- Exposição opcional dos contatos, apenas se preenchidos ---------- */
  if (CONTACT_EMAIL || WHATSAPP_NUMBER) {
    document.querySelectorAll('[data-contact-email]').forEach(function (el) {
      if (CONTACT_EMAIL) {
        el.setAttribute('href', 'mailto:' + CONTACT_EMAIL);
        el.textContent = CONTACT_EMAIL;
      }
    });
    document.querySelectorAll('[data-contact-whatsapp]').forEach(function (el) {
      if (WHATSAPP_NUMBER) {
        el.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER);
      }
    });
  }
})();
