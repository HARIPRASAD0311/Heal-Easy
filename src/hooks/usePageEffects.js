import { useEffect } from 'react';

/**
 * Re-creates the behaviour of scroll.js (reveal + parallax) and
 * counter.js (animated stat counters) for whichever page mounts it.
 * Because each page is a fresh DOM tree when React Router swaps routes,
 * calling this once per page mount naturally re-initialises the
 * IntersectionObservers, matching the original per-page DOMContentLoaded behaviour.
 */
export default function usePageEffects() {
  useEffect(() => {
    /* ---------- Scroll reveal ---------- */
    const revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    let revealObserver;
    if (revealTargets.length) {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      );
      revealTargets.forEach((el) => revealObserver.observe(el));
    }

    /* ---------- Animated counters ---------- */
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function animateCount(el) {
      const target = parseFloat(el.getAttribute('data-count-to'));
      const suffix = el.getAttribute('data-count-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-count-decimals') || '0', 10);
      const duration = 1400;

      if (prefersReduced || isNaN(target)) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    const counters = document.querySelectorAll('[data-count-to]');
    let counterObserver;
    if (counters.length) {
      counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.4 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }

    /* ---------- Parallax ---------- */
    const layers = document.querySelectorAll('.parallax-layer');
    let onScroll;
    if (layers.length && !prefersReduced) {
      let ticking = false;
      const update = () => {
        const y = window.scrollY;
        layers.forEach((layer) => {
          const speed = parseFloat(layer.getAttribute('data-parallax-speed') || '0.25');
          layer.style.transform = 'translateY(' + y * speed + 'px)';
        });
        ticking = false;
      };
      onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      if (revealObserver) revealObserver.disconnect();
      if (counterObserver) counterObserver.disconnect();
      if (onScroll) window.removeEventListener('scroll', onScroll);
    };
  }, []);
}
