document.addEventListener('DOMContentLoaded', () => {
  // 1) Animate in on view
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in-up').forEach(el => io.observe(el));

  // 2) Sticky header background after scroll
  const navbar = document.querySelector('.navbar');
  const onScroll = () => {
    if (window.scrollY > 24) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3) Active section link highlighting
  const sectionIds = ['about', 'experience', 'education', 'skills', 'projects'];
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

  // 4) Theme toggle (system-aware)
  const root = document.documentElement;
  const themeBtn = document.querySelector('.theme-toggle');
  const lsKey = 'theme';
  const applyTheme = (t) => {
    if (t === 'light') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    themeBtn?.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
  };
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const saved = localStorage.getItem(lsKey);
  applyTheme(saved || (systemDark.matches ? 'dark' : 'dark'));
  systemDark.addEventListener('change', (e) => {
    if (!localStorage.getItem(lsKey)) applyTheme(e.matches ? 'dark' : 'light');
  });
  themeBtn?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    if (next === 'dark') localStorage.removeItem(lsKey); else localStorage.setItem(lsKey, next);
    applyTheme(next);
  });

  // 5) Mobile menu (accessible)
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobileMenu');
  const focusableSelector = 'a, button, [tabindex]';
  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    mobileMenu.removeAttribute('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    const first = mobileMenu.querySelector(focusableSelector);
    first?.focus();
    document.addEventListener('keydown', trap);
  };
  const closeMenu = () => {
    mobileMenu.setAttribute('hidden', '');
    menuBtn.setAttribute('aria-expanded', 'false');
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
    if (mobileMenu.hasAttribute('hidden')) openMenu(); else closeMenu();
  });
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // 6) Footer year
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();
});
