export function setupNav() {
  const toggle = document.getElementById('nav-toggle'), nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => { const open = nav.classList.toggle('is-open'); toggle.setAttribute('aria-expanded', String(open)); });
    nav.addEventListener('click', e => { if (e.target.tagName === 'A') nav.classList.remove('is-open'); });
  }
  const bar = document.querySelector('.topbar');
  if (bar && window.ScrollTrigger) {
    window.ScrollTrigger.create({ trigger: document.body, start: 'top top', end: 'bottom bottom', onUpdate: self => bar.style.setProperty('--progress', `${(self.progress * 100).toFixed(1)}%`) });
  }
}
