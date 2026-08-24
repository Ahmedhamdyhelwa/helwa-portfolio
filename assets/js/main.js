// Safety: mark <html> as "js" so CSS knows JS is running (and reveal fallback stays off)
document.documentElement.classList.add('js');

// Mobile nav
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => navLinks.classList.remove('open'))
  );
}

// Respect reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal on scroll (with hard fallback if IntersectionObserver is missing or fails)
const revealEls = document.querySelectorAll('.reveal');
function revealAll() { revealEls.forEach(el => el.classList.add('visible')); }

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealAll();
} else {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));

  // Ultimate safety net: after 2.5s, force everything visible in case observer never fires
  setTimeout(revealAll, 2500);
}

// Animated counters (elements with data-count)
const counterEls = document.querySelectorAll('[data-count]');
function animateCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (prefersReducedMotion) {
    el.textContent = target.toLocaleString() + suffix;
    return;
  }
  const dur = 1300;
  const start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased).toLocaleString() + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      animateCounter(e.target);
    });
  }, { threshold: 0.4 });
  counterEls.forEach(el => counterObserver.observe(el));
} else {
  counterEls.forEach(animateCounter);
}
