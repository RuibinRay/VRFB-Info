/** Chapter captions fade with their section; side dots navigate between chapters. */
export function setupCaptions(chapters, navEl) {
  const ST = window.ScrollTrigger;
  const dots = chapters.map(c => {
    const b = document.createElement('button'); b.type = 'button';
    b.innerHTML = `<span>${c.el.dataset.title || c.name}</span>`; b.setAttribute('aria-label', c.el.dataset.title || c.name);
    b.addEventListener('click', () => window.scrollTo({ top: c.el.offsetTop + 40, behavior: 'smooth' }));
    navEl.appendChild(b); return b;
  });
  chapters.forEach((c, i) => {
    ST.create({ trigger: c.el, start: 'top 60%', end: 'bottom 40%', onToggle: self => { c.el.classList.toggle('is-active', self.isActive); if (self.isActive) dots.forEach((d, j) => d.classList.toggle('is-active', j === i)); } });
  });
  ST.create({ trigger: '#pillars', start: 'top 60%', onToggle: self => navEl.style.opacity = self.isActive ? '0' : '1' });
}
