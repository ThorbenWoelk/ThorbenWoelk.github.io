document.addEventListener('DOMContentLoaded', () => {
  // 1) Animate in on view (skip animation if URL has hash to avoid scroll jump)
  const fadeEls = document.querySelectorAll('.fade-in-up');
  if (window.location.hash) {
    fadeEls.forEach(el => el.classList.add('visible'));
    requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash);
      if (target) target.scrollIntoView();
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });
    fadeEls.forEach(el => io.observe(el));
  }

  // 2) Sticky header background after scroll
  const navbar = document.querySelector('.navbar');
  const backToTopBtn = document.getElementById('backToTop');
  const onScroll = () => {
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    backToTopBtn?.classList.toggle('is-visible', window.scrollY > 260);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3) Active section link highlighting
  const sectionIds = ['about', 'experience', 'certifications', 'projects', 'skills', 'education'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('.desktop-nav .nav-link'));
  const setActive = () => {
    let current = sectionIds[0];
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      if (rect.top <= 120) current = s.id;
    }
    navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === `#${current}` ? 'true' : 'false'));
  };
  window.addEventListener('scroll', setActive, { passive: true });
  setActive();

  // 4) Theme panel (color + mode)
  const root = document.documentElement;
  const systemDark = matchMedia('(prefers-color-scheme: dark)');

  const resolveMode = (mode) => {
    if (mode === 'system') return systemDark.matches ? 'dark' : 'light';
    return mode;
  };

  const applyColor = (color) => {
    root.setAttribute('data-color', color);
    document.querySelectorAll('.theme-color-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.color === color);
    });
    localStorage.setItem('tw-color', color);
  };

  const applyMode = (mode) => {
    const effective = resolveMode(mode);
    if (effective === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    document.querySelectorAll('.theme-mode-btn').forEach(b => {
      b.classList.toggle('is-active', b.dataset.mode === mode);
    });
    localStorage.setItem('tw-mode', mode);
  };

  const savedColor = localStorage.getItem('tw-color') || 'sand';
  const savedMode = localStorage.getItem('tw-mode') || 'dark';
  applyColor(savedColor);
  applyMode(savedMode);

  systemDark.addEventListener('change', () => {
    const mode = localStorage.getItem('tw-mode') || 'dark';
    if (mode === 'system') applyMode('system');
  });

  document.querySelectorAll('.theme-color-btn').forEach(btn => {
    btn.addEventListener('click', () => applyColor(btn.dataset.color));
  });
  document.querySelectorAll('.theme-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => applyMode(btn.dataset.mode));
  });

  // Panel open/close
  const panelTrigger = document.querySelector('.theme-panel-trigger');
  const panel = document.querySelector('.theme-panel');
  const togglePanel = () => {
    const open = panel.classList.toggle('is-open');
    panelTrigger.setAttribute('aria-expanded', open);
  };
  panelTrigger?.addEventListener('click', togglePanel);
  document.addEventListener('click', (e) => {
    if (panel?.classList.contains('is-open') && !e.target.closest('.theme-panel-wrapper')) {
      panel.classList.remove('is-open');
      panelTrigger.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.classList.contains('is-open')) {
      panel.classList.remove('is-open');
      panelTrigger.setAttribute('aria-expanded', 'false');
      panelTrigger.focus();
    }
  });

  // 5) Mobile menu (accessible)
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  const focusableSelector = 'a, button, [tabindex]';
  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    mobileMenu.removeAttribute('hidden');
    // Small delay to allow display:flex to apply before opacity transition
    setTimeout(() => {
      mobileMenu.classList.add('is-open');
    }, 10);
    menuBtn.setAttribute('aria-expanded', 'true');
    menuBtn.innerHTML = '<i data-feather="x"></i>';
    feather.replace(); // Re-render icons

    const first = mobileMenu.querySelector(focusableSelector);
    first?.focus();
    document.addEventListener('keydown', trap);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.innerHTML = '<i data-feather="menu"></i>';
    feather.replace(); // Re-render icons
    document.body.style.overflow = '';

    // Wait for transition
    setTimeout(() => {
      mobileMenu.setAttribute('hidden', '');
    }, 300);

    document.removeEventListener('keydown', trap);
    lastFocused?.focus();
  };

  const trap = (e) => {
    if (e.key === 'Escape') return closeMenu();
    if (e.key !== 'Tab') return;
    const items = Array.from(mobileMenu.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  menuBtn?.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMenu(); else openMenu();
  });

  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // 6) Back to top
  backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // 7) Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // 8) Friendly logo hover effect (once per hover)
  const logoEl = document.querySelector('.logo');
  if (logoEl) {
    logoEl.addEventListener('mouseenter', () => {
      if (!logoEl.classList.contains('logo-hover-effect')) {
        logoEl.classList.add('logo-hover-effect');
      }
    });

    // Since the animation happens on child spans, it triggers multiple times. 
    // Wait for the final character to finish its animation.
    logoEl.addEventListener('animationend', (e) => {
      const chars = logoEl.querySelectorAll('.logo-char');
      if (chars.length > 0 && e.target === chars[chars.length - 1]) {
        logoEl.classList.remove('logo-hover-effect');
      } else if (chars.length === 0) {
        logoEl.classList.remove('logo-hover-effect');
      }
    });
  }
});
