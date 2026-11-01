/** Shared behaviour for pillar pages: nav, beginner/advanced level, TOC scroll-spy. */
(function () {
  const toggle = document.getElementById('nav-toggle'), nav = document.getElementById('nav');
  if (toggle && nav) toggle.addEventListener('click', () => { const o = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(o)); });

  document.querySelectorAll('.lang-switch a[data-lang]').forEach(a => a.addEventListener('click', () => { try { localStorage.setItem('vrfb-lang', a.dataset.lang); } catch {} }));

  // level toggle (persisted)
  const body = document.body;
  const saved = (() => { try { return localStorage.getItem('vrfb-level'); } catch { return null; } })();
  body.dataset.level = saved === 'advanced' ? 'advanced' : 'beginner';
  document.querySelectorAll('.level').forEach(group => {
    const btns = group.querySelectorAll('button');
    const sync = () => btns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.level === body.dataset.level)));
    btns.forEach(b => b.addEventListener('click', () => { body.dataset.level = b.dataset.level; try { localStorage.setItem('vrfb-level', b.dataset.level); } catch {} document.querySelectorAll('.level').forEach(g => g.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.level === body.dataset.level)))); }));
    sync();
  });

  // TOC scroll-spy
  const links = [...document.querySelectorAll('.toc a[href^="#"]')];
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id)); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(s => io.observe(s));
  }

  // progress bar
  const bar = document.querySelector('.topbar');
  const onScroll = () => { const h = document.documentElement; const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight); bar && bar.style.setProperty('--progress', `${(p * 100).toFixed(1)}%`); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
})();
