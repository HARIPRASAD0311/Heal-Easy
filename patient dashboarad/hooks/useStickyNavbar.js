import { useEffect } from 'react';

export default function useStickyNavbar(navRef) {
  useEffect(() => {
    const navbar = navRef.current;
    if (!navbar) return undefined;

    function onScroll() {
      if (window.scrollY > 8) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, [navRef]);
}
